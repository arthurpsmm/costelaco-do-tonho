"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/admin/fila");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-14">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        TaPronto
      </p>
      <h1 className="mt-2 font-display text-3xl">Quem é você?</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/pedido/novo"
          className="rounded-xl border border-line bg-card px-4 py-4 text-center font-sans text-sm font-medium text-foreground-soft transition-colors hover:border-brasa hover:text-brasa"
        >
          Sou cliente
        </Link>
        <div className="rounded-xl border border-brasa bg-brasa px-4 py-4 text-center font-sans text-sm font-semibold text-white">
          Sou administração
        </div>
      </div>

      <p className="mt-8 font-sans text-xs uppercase tracking-[0.2em] text-foreground-soft">
        Acesso da equipe
      </p>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 font-sans text-sm outline-none focus:border-brasa"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 font-sans text-sm outline-none focus:border-brasa"
        />
        {error && <p className="text-sm text-brasa">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brasa px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-brasa-deep disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
