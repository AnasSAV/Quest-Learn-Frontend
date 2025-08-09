import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getQuestionImageUrl(imageKey: string): string {
  if (!imageKey) return '';
  return `https://sjbwnjqunhonucocaoiu.supabase.co/storage/v1/object/public/math-png/${imageKey}`;
}
