import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;
export const solToLamports = (sol: number) => sol * 1_000_000_000;

/**
 * Computes a SHA-256 hash of a string and returns it as a byte array.
 * Used for deriving Dare PDAs.
 */
export async function computeDareHash(text: string): Promise<number[]> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data as any);
  return Array.from(new Uint8Array(hashBuffer));
}
