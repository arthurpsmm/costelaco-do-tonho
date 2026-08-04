import type { Metadata } from "next";
import { getTenant, getMenu, getPickupWindows } from "@/lib/tapronto/queries";
import { todayISODate } from "@/lib/tapronto/format";
import { NewOrderForm } from "@/components/pedido/NewOrderForm";

export const metadata: Metadata = {
  title: "Pedir marmita",
  description: "Monte sua marmita, escolha o horário de retirada e receba uma senha na hora.",
};

export const dynamic = "force-dynamic";

export default async function NovoPedidoPage() {
  const tenant = await getTenant();
  const menu = await getMenu(tenant.id);
  const pickupDate = todayISODate();
  const windows = await getPickupWindows(tenant.id, pickupDate);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Almoço sem fila
      </p>
      <h1 className="mt-2 max-w-xl font-display text-3xl sm:text-4xl">Monte sua marmita</h1>
      <p className="mt-3 max-w-lg text-foreground-soft">
        Escolha, revise e confirme — você recebe uma senha e acompanha o status em tempo real.
      </p>

      <div className="mt-12">
        <NewOrderForm
          tenantSlug={tenant.slug}
          marmitas={menu.marmitas}
          cutlery={menu.cutlery}
          drinks={menu.drinks}
          windows={windows}
          pickupDate={pickupDate}
        />
      </div>
    </div>
  );
}
