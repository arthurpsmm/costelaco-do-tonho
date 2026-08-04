import { restaurant } from "@/lib/data";

export function RatingBadge({ className = "border-line bg-card" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm ${className}`}
    >
      <span className="flex text-ember" aria-hidden="true">
        {"★★★★★"}
      </span>
      <span className="font-semibold">{restaurant.rating}</span>
      <span className="opacity-70">
        · {restaurant.reviewCount.toLocaleString("pt-BR")} avaliações no Google
      </span>
    </div>
  );
}
