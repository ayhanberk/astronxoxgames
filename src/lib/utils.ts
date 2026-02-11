import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes using clsx and tailwind-merge.
 * This is essential for clean and premium component development.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
