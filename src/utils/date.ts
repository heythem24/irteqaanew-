// Date formatting utilities to ensure Gregorian calendar in Arabic layout (day/month/year)
export function formatDate(input: Date | string | number | undefined | null): string {
  // Numeric Gregorian format with Latin digits: dd/MM/yyyy (e.g., 01/05/2025)
  try {
    if (!input) return '-';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      calendar: 'gregory'
    }).format(d);
  } catch {
    return '-';
  }
}

export function formatTime(input: Date | string | number | undefined | null): string {
  // Time with Latin digits (24h), e.g., 13:45
  try {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  } catch {
    return '';
  }
}

export function formatDateTime(input: Date | string | number | undefined | null): string {
  const date = formatDate(input);
  const time = formatTime(input);
  return [date, time].filter(Boolean).join(' ');
}

export function formatMonthDay(input: Date | string | number | undefined | null): string {
  // Arabic month name with Latin digits: e.g., 01 ماي
  try {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ar-DZ-u-nu-latn', { calendar: 'gregory', month: 'short', day: '2-digit' }).format(d);
  } catch {
    return '';
  }
}

export function formatDateLongAr(input: Date | string | number | undefined | null): string {
  // Arabic long date with Latin digits: e.g., 01 ماي 2025
  try {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ar-DZ-u-nu-latn', { calendar: 'gregory', day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return '';
  }
}
