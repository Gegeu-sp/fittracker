import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateDisplay(dateString: string | null | undefined): string {
  if (!dateString) return 'Data inválida';
  
  // Se a string já estiver no formato ISO com tempo, pegamos só a parte da data
  const datePart = dateString.split('T')[0];
  
  // Quebramos a string "YYYY-MM-DD" para evitar problemas de timezone do Date()
  const [year, month, day] = datePart.split('-');
  
  if (!year || !month || !day) return dateString; // Fallback se o formato for inesperado
  
  // Garantir zero padding se necessário (embora ISO venha com ele, inputs manuais podem não ter)
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  
  return `${paddedDay}/${paddedMonth}/${year}`;
}

export function safeAvatarSrc(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}
