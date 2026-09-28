import { FinancialItem, FinancialTransaction, TransactionCategory, TransactionType } from './finance-store';

export interface ExtractionResult {
  date: string;
  merchant: string | null;
  type: TransactionType;
  category: TransactionCategory;
  total_amount: number;
  payment_method: string | null;
  confidence_score: number;
  items: FinancialItem[];
  raw_summary: string;
}

// Allowed static categories
const VALID_CATEGORIES: TransactionCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Pendapatan',
  'Lainnya',
];

/**
 * Normalizes Indonesian money expressions to integer number
 * e.g., "25k" -> 25000, "15rb" -> 15000, "1.5jt" -> 1500000, "Rp 50.000" -> 50000
 */
export function normalizeNominal(text: string): number {
  if (!text) return 0;
  let cleaned = text.toLowerCase().trim();

  // Handle "1.5jt" or "2.5 juta"
  const jtMatch = cleaned.match(/([\d.,]+)\s*(?:jt|juta)/i);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(',', '.'));
    if (!isNaN(val)) return Math.round(val * 1000000);
  }

  // Handle "25k" or "15rb" or "15 ribu"
  const rbMatch = cleaned.match(/([\d.,]+)\s*(?:k|rb|ribu)/i);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(',', '.'));
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Standard digits: remove "rp", dots, whitespace, trailing cents
  cleaned = cleaned.replace(/^rp\.?\s*/i, '');
  cleaned = cleaned.replace(/,00$/, ''); // strip sen
  cleaned = cleaned.replace(/\./g, '').replace(/,/g, '');
  const digitsOnly = cleaned.match(/\d+/);

  if (digitsOnly) {
    return parseInt(digitsOnly[0], 10);
  }

  return 0;
}

/**
 * Main AI extraction function for free text inputs
 */
export function parseFinancialText(inputText: string, refDate: Date = new Date()): ExtractionResult {
  const text = inputText.toLowerCase().trim();

  // 1. Determine Date (ISO YYYY-MM-DD)
  let dateObj = new Date(refDate);
  if (text.includes('kemarin')) {
    dateObj.setDate(dateObj.getDate() - 1);
  } else if (text.includes('lusa')) {
    dateObj.setDate(dateObj.getDate() + 2);
  } else if (text.includes('2 hari lalu') || text.includes('kemarin lusa')) {
    dateObj.setDate(dateObj.getDate() - 2);
  }
  const dateStr = dateObj.toISOString().split('T')[0];

  // 2. Determine Transaction Type (default: expense)
  let type: TransactionType = 'expense';
  const incomeKeywords = ['gaji', 'terima', 'dapat', 'transfer masuk', 'bonus', 'komisi', 'omzet', 'hasil jual', 'dibayar', 'inflow', 'pemasukan'];
  if (incomeKeywords.some((kw) => text.includes(kw))) {
    type = 'income';
  }

  // 3. Determine Payment Method
  let payment_method: string | null = null;
  if (text.includes('qris') || text.includes('qrisd') || text.includes('scan')) payment_method = 'QRIS';
  else if (text.includes('cash') || text.includes('tunai')) payment_method = 'Cash';
  else if (text.includes('transfer') || text.includes('bca') || text.includes('mandiri') || text.includes('bri') || text.includes('bni')) payment_method = 'Transfer';
  else if (text.includes('debit')) payment_method = 'Debit';
  else if (text.includes('kartu kredit') || text.includes('credit card') || text.includes('cc')) payment_method = 'Kartu Kredit';

  // 4. Determine Category & Merchant
  let category: TransactionCategory = type === 'income' ? 'Pendapatan' : 'Lainnya';
  let merchant: string | null = null;

  // Merchant detection logic
  const merchantMatch = inputText.match(/(?:di|ke|dari|at)\s+([A-Za-z0-9\s]+?)(?:\s+(?:pakai|menggunakan|pake|via|sebesar|rp|\d|kemarin|hari ini)|$)/i);
  if (merchantMatch && merchantMatch[1].trim().length > 1) {
    merchant = merchantMatch[1].trim();
  }

  // Category matching
  if (type === 'income') {
    category = 'Pendapatan';
  } else if (/(kopi|makan|nasi|roti|cafe|resto|warung|sate|bakso|minum|kuliner|snack|makanan|minuman|resto|kfc|mcd|starbucks|boba|janji jiwa)/.test(text)) {
    category = 'Makanan & Minuman';
  } else if (/(bensin|gojek|gofood|grab|maxi|parkir|tol|shell|pertamina|servis|motor|mobil|ban|angkot|busway|mrt|tiket|ojek)/.test(text)) {
    category = 'Transportasi';
  } else if (/(baju|celana|sepatu|uniqlo|zara|shopee|tokopedia|lazada|supermarket|belanja|kaos|tas|baju|hijab|skincare|makeup)/.test(text)) {
    category = 'Belanja';
  } else if (/(listrik|pln|pdam|air|wifi|indihome|telkomsel|pulsa|kuota|sewa|kost|kontrakan|iuran|tagihan|bpjs)/.test(text)) {
    category = 'Tagihan & Utilitas';
  } else if (/(bioskop|xxi|game|steam|netflix|spotify|konser|liburan|hotel|wisata|nonton|rekreasi)/.test(text)) {
    category = 'Hiburan';
  } else if (/(obat|apotek|dokter|rumah sakit|rs|vitamin|kacamata|periksa|klinik)/.test(text)) {
    category = 'Kesehatan';
  } else if (/(spp|sekolah|kuliah|buku|kursus|udemy|bimbingan|les|biaya semester)/.test(text)) {
    category = 'Pendidikan';
  }

  // 5. Items Extraction & Amounts Calculation
  const items: FinancialItem[] = [];
  let total_amount = 0;

  // Split clauses by "sama", "dan", ",", "plus", "serta"
  const itemParts = inputText.split(/(?:,|\ssama\s|\sdan\s|\splus\s|\s&\s)/i);

  if (itemParts.length > 1) {
    for (const part of itemParts) {
      const nominal = normalizeNominal(part);
      if (nominal > 0) {
        // Clean item name
        let itemName = part
          .replace(/rp\.?\s*[\d.,]+(?:\s*(?:k|rb|ribu|jt|juta))?/gi, '')
          .replace(/[\d.,]+\s*(?:k|rb|ribu|jt|juta)/gi, '')
          .replace(/(?:kemarin|hari ini|qris|cash|tunai|transfer|bca|mandiri|di|ke|dari)\s*/gi, '')
          .trim();

        if (!itemName) itemName = 'Item Transaksi';
        items.push({ name: capitalize(itemName), qty: 1, price: nominal });
        total_amount += nominal;
      }
    }
  }

  // Fallback single item parsing if total is still 0 or no multiple items parsed
  if (items.length === 0 || total_amount === 0) {
    total_amount = normalizeNominal(inputText);
    let generalName = inputText
      .replace(/rp\.?\s*[\d.,]+(?:\s*(?:k|rb|ribu|jt|juta))?/gi, '')
      .replace(/[\d.,]+\s*(?:k|rb|ribu|jt|juta)/gi, '')
      .replace(/(?:kemarin|hari ini|qris|cash|tunai|transfer|debit|bca|di|ke|dari)\s*[A-Za-z0-9\s]*/gi, '')
      .trim();

    if (!generalName || generalName.length < 2) {
      generalName = type === 'income' ? 'Penerimaan Dana' : `Pembayaran ${category}`;
    }

    items.push({
      name: capitalize(generalName),
      qty: 1,
      price: total_amount,
    });
  }

  // 6. Confidence Score
  let confidence_score = 0.92;
  if (total_amount > 0 && payment_method && merchant) confidence_score = 0.98;
  else if (total_amount > 0 && (payment_method || merchant)) confidence_score = 0.95;
  else if (total_amount === 0) confidence_score = 0.5;

  // 7. Raw Summary
  const formattedNominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total_amount);
  const actionWord = type === 'income' ? 'Penerimaan' : 'Pengeluaran';
  const merchantPart = merchant ? ` di ${merchant}` : '';
  const payPart = payment_method ? ` menggunakan ${payment_method}` : '';

  const raw_summary = `${actionWord} ${category} sebesar ${formattedNominal}${merchantPart}${payPart}.`;

  return {
    date: dateStr,
    merchant,
    type,
    category,
    total_amount,
    payment_method,
    confidence_score,
    items,
    raw_summary,
  };
}

/**
 * Receipt Image OCR & AI Extractor Parser Simulation / Gemini fallback
 */
export async function parseReceiptImage(base64Image: string): Promise<ExtractionResult> {
  // Simulates OCR scan from receipt photo
  const sampleReceiptData: ExtractionResult = {
    date: new Date().toISOString().split('T')[0],
    merchant: 'Indomaret Point Supomo',
    type: 'expense',
    category: 'Makanan & Minuman',
    total_amount: 58500,
    payment_method: 'QRIS',
    confidence_score: 0.96,
    items: [
      { name: 'Kopi Point Iced Palm Sugar', qty: 1, price: 22000 },
      { name: 'Roti Srikaya Indomaret', qty: 2, price: 12000 },
      { name: 'Air Mineral 600ml', qty: 1, price: 12500 },
    ],
    raw_summary: 'Hasil struk fisik: Pembelian Kopi Point, Roti Srikaya, dan Air Mineral di Indomaret Point Supomo via QRIS.',
  };

  return sampleReceiptData;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
