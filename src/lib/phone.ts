/**
 * Ubah nomor HP Indonesia ke format internasional tanpa "+" (mis. "0812-3456 789" → "628123456789").
 * Mengembalikan null jika tidak valid.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (!/^\d{10,15}$/.test(digits)) return null;
  return digits;
}

/** Tampilan yang mudah dibaca: "628123456789" → "0812-3456-789". */
export function formatPhone(phone: string): string {
  const local = phone.startsWith("62") ? "0" + phone.slice(2) : phone;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

/** Link WhatsApp dengan pesan yang sudah terisi. */
export function waLink(phone: string, text?: string): string {
  return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
