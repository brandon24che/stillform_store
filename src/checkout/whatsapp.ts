import type { Catalog } from "@/catalog/types";
import type { OrderForm, PlacedOrder } from "@/checkout/checkout";

const LAST_LINK_KEY = "stillform.lastWhatsAppLink";

/** Digits in international form (no +, no leading 00); null when the store hasn't set a usable number. */
export function whatsappNumber(catalog: Catalog): string | null {
  const raw = (catalog.settings.contact?.whatsapp ?? "").replace(/\D/g, "");
  const digits = raw.startsWith("00") ? raw.slice(2) : raw;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function orderMessage(order: PlacedOrder, form: OrderForm, money: (minor: number) => string): string {
  const items = order.items.map((item, index) => `${index + 1}. ${item.name} — ${item.colorway} · ${item.size} × ${item.quantity} — ${money(item.lineTotal)}`);
  const address = [form.line1, form.line2, form.city, form.region, form.postalCode, form.country].filter((part) => part.trim()).join(", ");
  const details = [
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    address ? `Address: ${address}` : null,
    `Payment: ${order.paymentMethod}`,
    form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
  ].filter((line): line is string => line !== null);
  return [
    `Hello STILLFORM! I'd like to finish order ${order.reference}.`,
    "",
    ...items,
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? "Included" : money(order.shipping)}`,
    `Total: ${money(order.total)}`,
    "",
    ...details,
  ].join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function rememberWhatsAppLink(reference: string, url: string) {
  try {
    sessionStorage.setItem(LAST_LINK_KEY, JSON.stringify({ reference, url }));
  } catch {
    // The confirmation page simply shows no WhatsApp link.
  }
}

export function recallWhatsAppLink(reference: string): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(LAST_LINK_KEY) ?? "null") as { reference?: string; url?: string } | null;
    return saved?.reference === reference && saved.url ? saved.url : null;
  } catch {
    return null;
  }
}
