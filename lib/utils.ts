import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSafeValue = (
  value: string | number | null | undefined,
  fallback: string = '-'
): string => {
  if (value !== undefined && value !== null && value !== '') {
    // Convert numeric strings to numbers and apply toFixed(2)
    if (!isNaN(Number(value))) {
      return Number(value).toFixed(2); // Ensures output is a string
    }

    return String(value); // Ensure all other values are returned as strings
  }

  return fallback;
};

export const getTextWidth = (text: string, font = '14px Arial'): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return 100;
  } // Fallback width
  context.font = font;
  const textWidth = context.measureText(text).width;

  return Math.ceil(textWidth + 40); // Add dynamic padding (8px on left + 8px on right)
};