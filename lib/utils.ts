import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasIntersection(a: Set<any>, b: Set<any>) {
  const arrA = Array.from(a);
  const arrB = Array.from(b);
  for (const elem of arrA) {
    if (arrB.includes(elem)) {
      return true
    }
  }
  return false
}