"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/tapronto/format";
import type { OrderItemSnapshot, OrderStatus } from "@/lib/supabase/types";

type OrderRow = {
  id: string;
  ticket_number: number | null;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  notes: string | null;
  total_cents: number;
  pickup_window_templates: { start_time: string; end_time: string } | null;
};

const statusLabel: Record<OrderStatus, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function PedidosHistorico({ pickupDate, orders }: { pickupDate: string; orders: OrderRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);

  function changeDate(newDate: string) {
    router.push(`/admin/pedidos?date=${newDate}`);
  }

  async function cancelOrder(id: string) {
    if (!window.confirm("Cancelar este pedido?")) return;
    const supabase = createClient();
    await supabase.from("orders").update({ status: "cancelado" }).eq("id", id);
    setRows((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelado" } : o)));
  }

  async function deleteOrder(id: string) {
    if (!window.confirm("Excluir este pedido definitivamente? Não dá pra desfazer.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      window.alert("Não consegui excluir: " + error.message);
      return;
    }
    setRows((prev) => prev.filter((o) => o.id !== id));
  }

  async function deleteAll() {
    if (rows.length === 0) return;
    if (
      !window.confirm(
        `Excluir todos os ${rows.length} pedidos de ${pickupDate.split("-").reverse().join("/")}? Não dá pra desfazer.`
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase.from("orders").delete().eq("pickup_date", pickupDate);
    if (error) {
      window.alert("Não consegui excluir tudo: " + error.message);
      return;
    }
    setRows([]);
  }

  const total = rows.filter((o) => o.status !== "cancelado").reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => changeDate(e.target.value)}
          className="rounded-xl border border-line bg-card px-4 py-2 font-sans text-sm outline-none focus:border-brasa"
        />
        <span className="font-sans text-sm text-foreground-soft">
          {rows.length} pedido{rows.length === 1 ? "" : "s"} · total {formatCents(total)}
        </span>
        {rows.length > 0 && (
          <button
            onClick={deleteAll}
            className="ml-auto rounded-full border border-brasa px-4 py-2 font-sans text-sm font-medium text-brasa hover:bg-brasa hover:text-white"
          >
            Excluir todos do dia
          </button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-3">Senha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Retirada</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0 align-top">
                <td className="px-4 py-3 font-bold">#{order.ticket_number}</td>
                <td className="px-4 py-3">
                  {order.customer_name}
                  <span className="block text-xs text-foreground-soft">{order.customer_phone}</span>
                </td>
                <td className="px-4 py-3 text-xs text-foreground-soft">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.name}
                      {item.proteins && item.proteins.length > 0 ? ` (${item.proteins.join(", ")})` : ""}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {order.pickup_window_templates?.start_time.slice(0, 5) ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      order.status === "cancelado"
                        ? "bg-brasa/10 text-brasa"
                        : order.status === "entregue"
                          ? "bg-good/10 text-good"
                          : "bg-background-raised text-foreground-soft"
                    }`}
                  >
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">{formatCents(order.total_cents)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {order.status !== "cancelado" && order.status !== "entregue" && (
                      <button onClick={() => cancelOrder(order.id)} className="text-xs text-foreground-soft hover:text-brasa">
                        Cancelar
                      </button>
                    )}
                    <button onClick={() => deleteOrder(order.id)} className="text-xs text-foreground-soft hover:text-brasa">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground-soft">
                  Nenhum pedido nesse dia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
