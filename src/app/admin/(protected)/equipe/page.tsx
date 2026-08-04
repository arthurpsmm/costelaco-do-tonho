import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EquipeAdmin } from "@/components/admin/EquipeAdmin";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/admin/login");

  if (profile.role !== "owner") {
    redirect("/admin/fila");
  }

  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff_profiles")
    .select("user_id, full_name, role, created_at")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: true });

  const staffWithEmail = await Promise.all(
    (staff ?? []).map(async (member) => {
      const { data } = await admin.auth.admin.getUserById(member.user_id);
      return { ...member, email: data.user?.email ?? "—" };
    })
  );

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Equipe
      </p>
      <h1 className="mt-2 font-display text-3xl">Quem tem acesso ao painel</h1>
      <p className="mt-2 max-w-lg text-foreground-soft">
        Só o dono pode adicionar ou remover gente daqui.
      </p>

      <div className="mt-8">
        <EquipeAdmin members={staffWithEmail} currentUserId={user.id} />
      </div>
    </div>
  );
}
