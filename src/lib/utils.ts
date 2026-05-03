import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isMockApple(): boolean {
  return process.env.MOCK_APPLE_AUTH === "true" || process.env.NEXT_PUBLIC_MOCK_APPLE_AUTH === "true";
}

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === "matiss.frasne@gmail.com";
}

export function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}
