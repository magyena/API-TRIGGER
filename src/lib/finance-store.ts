import fs from 'fs';
import path from 'path';

export interface FinancialItem {
  name: string;
  qty: number;
  price: number;
}

export type TransactionType = 'expense' | 'income';

export type TransactionCategory =
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja'
  | 'Tagihan & Utilitas'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Pendapatan'
  | 'Lainnya';

export interface FinancialTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string | null;
  type: TransactionType;
  category: TransactionCategory;
  total_amount: number;
  payment_method: string | null;
  confidence_score: number;
  items: FinancialItem[];
  raw_summary: string;
  createdAt: string;
}

// Initial realistic seed transactions
const initialSeedTransactions: FinancialTransaction[] = [
  {
    id: 'tx_seed_1',
    date: '2026-09-11',
    merchant: 'Janji Jiwa',
    type: 'expense',
    category: 'Makanan & Minuman',
    total_amount: 40000,
    payment_method: 'QRIS',
    confidence_score: 0.98,
    items: [
      { name: 'Kopi Susu Gula Aren', qty: 1, price: 25000 },
      { name: 'Roti Coklat', qty: 1, price: 15000 },
    ],
    raw_summary: 'Membeli Kopi Susu Gula Aren dan Roti Coklat di Janji Jiwa menggunakan QRIS.',
    createdAt: '2026-09-11T10:15:00.000Z',
  },
  {
    id: 'tx_seed_2',
    date: '2026-09-10',
    merchant: 'PT Hijrah Teknologi',
    type: 'income',
    category: 'Pendapatan',
    total_amount: 12500000,
    payment_method: 'Transfer',
    confidence_score: 1.0,
    items: [{ name: 'Gaji Bulanan September 2026', qty: 1, price: 12500000 }],
    raw_summary: 'Penerimaan gaji bulanan bulan September 2026 melalui Transfer BCA.',
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'tx_seed_3',
    date: '2026-09-09',
    merchant: 'PLN Persero',
    type: 'expense',
    category: 'Tagihan & Utilitas',
    total_amount: 350000,
    payment_method: 'Transfer',
    confidence_score: 0.95,
    items: [{ name: 'Token Listrik PLN 350k', qty: 1, price: 350000 }],
    raw_summary: 'Pembelian token listrik PLN senilai Rp350.000 via Transfer.',
    createdAt: '2026-09-09T14:20:00.000Z',
  },
  {
    id: 'tx_seed_4',
    date: '2026-09-08',
    merchant: 'Shell Gatot Subroto',
    type: 'expense',
    category: 'Transportasi',
    total_amount: 150000,
    payment_method: 'Kartu Kredit',
    confidence_score: 0.96,
    items: [{ name: 'Bensin Shell V-Power 10L', qty: 1, price: 150000 }],
    raw_summary: 'Pengisian bensin Shell V-Power senilai Rp150.000 menggunakan Kartu Kredit.',
    createdAt: '2026-09-08T18:45:00.000Z',
  },
  {
    id: 'tx_seed_5',
    date: '2026-09-07',
    merchant: 'Uniqlo Grand Indonesia',
    type: 'expense',
    category: 'Belanja',
    total_amount: 599000,
    payment_method: 'Debit',
    confidence_score: 0.97,
    items: [{ name: 'Kemeja Airism Cotton', qty: 1, price: 599000 }],
    raw_summary: 'Pembelian Kemeja Airism Cotton di Uniqlo menggunakan kartu Debit.',
    createdAt: '2026-09-07T16:10:00.000Z',
  },
  {
    id: 'tx_seed_6',
    date: '2026-09-05',
    merchant: 'XXI Cinema Plaza Senayan',
    type: 'expense',
    category: 'Hiburan',
    total_amount: 120000,
    payment_method: 'QRIS',
    confidence_score: 0.95,
    items: [
      { name: 'Tiket Nonton Bioskop', qty: 2, price: 50000 },
      { name: 'Popcorn Regular', qty: 1, price: 20000 },
    ],
    raw_summary: 'Nonton bioskop XXI dan beli popcorn 2 tiket menggunakan QRIS.',
    createdAt: '2026-09-05T19:30:00.000Z',
  },
];

// Persistent storage location in data directory or temp fallback
const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'finance_transactions.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(initialSeedTransactions, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Failed to access disk storage, using in-memory store:', err);
  }
}

let memoryTransactions: FinancialTransaction[] = [...initialSeedTransactions];

export function getTransactions(): FinancialTransaction[] {
  try {
    ensureDataFile();
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading transactions file:', e);
  }
  return memoryTransactions;
}

export function saveTransactions(transactions: FinancialTransaction[]): void {
  memoryTransactions = [...transactions];
  try {
    ensureDataFile();
    fs.writeFileSync(FILE_PATH, JSON.stringify(transactions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing transactions file:', e);
  }
}

export function addTransaction(transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>): FinancialTransaction {
  const current = getTransactions();
  const newTx: FinancialTransaction = {
    ...transaction,
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newTx, ...current];
  saveTransactions(updated);
  return newTx;
}

export function updateTransaction(id: string, updatedFields: Partial<FinancialTransaction>): FinancialTransaction | null {
  const current = getTransactions();
  const index = current.findIndex((tx) => tx.id === id);
  if (index === -1) return null;

  const updatedTx = { ...current[index], ...updatedFields };
  current[index] = updatedTx;
  saveTransactions(current);
  return updatedTx;
}

export function deleteTransaction(id: string): boolean {
  const current = getTransactions();
  const filtered = current.filter((tx) => tx.id !== id);
  if (filtered.length === current.length) return false;
  saveTransactions(filtered);
  return true;
}
