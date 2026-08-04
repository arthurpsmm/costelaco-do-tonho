import { restaurant } from "./data";

export function whatsappLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${restaurant.whatsappNumber}?text=${encoded}`;
}

export function genericWhatsappLink() {
  return whatsappLink(
    `Olá! Vim pelo site do ${restaurant.name} e gostaria de mais informações.`
  );
}
