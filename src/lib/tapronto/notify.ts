export function customerWhatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function readyMessage(customerName: string, ticketNumber: number | null) {
  return `Oi, ${customerName}! Sua marmita (senha ${ticketNumber ?? "-"}) já está pronta pra retirada 🍖`;
}
