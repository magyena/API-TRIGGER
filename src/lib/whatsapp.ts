export interface WAAdminNumber {
  id: string;
  name: string;
  phoneNumber: string; // e.g. "6281234567890"
  weight: number;
  isActive: boolean;
  startHour: string; // "08:00"
  endHour: string;   // "21:00"
  totalClicks: number;
  lastUsedAt?: Date | null;
}

export type RoutingStrategy = 'ROUND_ROBIN' | 'WEIGHTED' | 'RANDOM';

export function isWithinOperatingHours(startHour: string, endHour: string): boolean {
  if (!startHour || !endHour) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);

  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight schedule e.g., 22:00 to 06:00
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

export function selectWhatsAppNumber(
  numbers: WAAdminNumber[],
  strategy: RoutingStrategy = 'ROUND_ROBIN'
): WAAdminNumber | null {
  // Filter active & operational numbers
  const available = numbers.filter(
    (n) => n.isActive && isWithinOperatingHours(n.startHour, n.endHour)
  );

  if (available.length === 0) {
    // Fallback to any active number if all outside hours
    const active = numbers.filter((n) => n.isActive);
    if (active.length === 0) return numbers[0] || null;
    return active[0];
  }

  if (strategy === 'RANDOM') {
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }

  if (strategy === 'WEIGHTED') {
    const totalWeight = available.reduce((acc, curr) => acc + (curr.weight || 1), 0);
    let randomNum = Math.floor(Math.random() * totalWeight);
    for (const num of available) {
      randomNum -= (num.weight || 1);
      if (randomNum < 0) return num;
    }
    return available[0];
  }

  // ROUND_ROBIN default: Pick the one used least recently or with minimum clicks
  const sorted = [...available].sort((a, b) => {
    const timeA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
    const timeB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return a.totalClicks - b.totalClicks;
  });

  return sorted[0];
}

export function formatWhatsAppMessage(
  template: string,
  params: { product?: string; campaign?: string; date?: string; utmSource?: string }
): string {
  let msg = template || "Halo Admin, Saya tertarik dengan produk Anda";
  msg = msg.replace(/{product}/gi, params.product || "Produk");
  msg = msg.replace(/{campaign}/gi, params.campaign || "");
  msg = msg.replace(/{date}/gi, params.date || new Date().toLocaleDateString("id-ID"));
  msg = msg.replace(/{utm_source}/gi, params.utmSource || "");
  return encodeURIComponent(msg.trim());
}
