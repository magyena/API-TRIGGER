import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function generateEventId(): string {
  return 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export function generateVisitorId(): string {
  return 'vis_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}
