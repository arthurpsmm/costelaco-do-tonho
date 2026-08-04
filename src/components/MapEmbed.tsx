import { restaurant } from "@/lib/data";

export function MapEmbed({ className = "" }: { className?: string }) {
  const query = encodeURIComponent(restaurant.mapsQuery);
  return (
    <div className={`overflow-hidden rounded-2xl border border-line ${className}`}>
      <iframe
        title={`Mapa — ${restaurant.fullName}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: 320 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
