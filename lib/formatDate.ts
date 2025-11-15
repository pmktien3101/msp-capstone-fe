// Small shared date formatting helpers to standardize dd/mm/yyyy and time formats
export function formatDate(date?: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(date?: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '-';
  return `${formatDate(date)} ${formatTime(date)}`;
}
