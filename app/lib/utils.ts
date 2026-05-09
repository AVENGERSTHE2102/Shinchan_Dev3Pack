import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;
export const solToLamports = (sol: number) => sol * 1_000_000_000;
