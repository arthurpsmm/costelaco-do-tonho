"use client";

import { useState, useTransition } from "react";
import { createStaffMember, removeStaffMember } from "@/app/admin/(protected)/equipe/actions";
import type { StaffRole } from "@/lib/supabase/types";

type Member = { user_id: string; full_name: string; role: StaffRole; email: string };

const roleLabel: Record<StaffRole, string> = {
  owner: "Dono",
  kitchen: "Cozinha",
  counter: "Balcão",
};

export function EquipeAdmin({ members, currentUserId }: { members: Member[]; currentUserId: string }) {
  const [list, setList] = useState(members);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<StaffRole>("counter");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await createStaffMember({ email, password, fullName, role });
      if (result.error) {
        setError(result.error);
        return;
      }
      setList((prev) => [...prev, { user_id: crypto.randomUUID(), full_name: fullName, role, email }]);
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("counter");
    });
  }

  function handleRemove(userId: string) {
    if (!window.confirm("Remover o acesso dessa pessoa?")) return;
    startTransition(async () => {
      const result = await removeStaffMember(userId);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      setList((prev) => prev.filter((m) => m.user_id !== userId));
    });
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((member) => (
              <tr key={member.user_id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{member.full_name}</td>
                <td className="px-4 py-3 text-foreground-soft">{member.email}</td>
                <td className="px-4 py-3">{roleLabel[member.role]}</td>
                <td className="px-4 py-3">
                  {member.user_id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      className="text-xs text-foreground-soft hover:text-brasa"
                    >
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-line p-5">
        <h2 className="font-display text-lg">Adicionar funcionário</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Nome"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
          >
            <option value="counter">Balcão</option>
            <option value="kitchen">Cozinha</option>
            <option value="owner">Dono</option>
          </select>
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Senha provisória"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-brasa">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={isPending || !email || !password || !fullName}
          className="rounded-full bg-brasa px-5 py-2 text-sm font-semibold text-white hover:bg-brasa-deep disabled:opacity-50"
        >
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
