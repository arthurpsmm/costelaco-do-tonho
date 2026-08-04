"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/lib/supabase/types";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    throw new Error("Só o dono do restaurante pode gerenciar a equipe.");
  }

  return profile;
}

export async function createStaffMember(input: {
  email: string;
  password: string;
  fullName: string;
  role: StaffRole;
}) {
  const profile = await requireOwner();
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Não consegui criar o usuário." };
  }

  const { error: profileError } = await admin.from("staff_profiles").insert({
    user_id: created.user.id,
    tenant_id: profile.tenant_id,
    full_name: input.fullName,
    role: input.role,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  return { success: true };
}

export async function removeStaffMember(userId: string) {
  await requireOwner();
  const admin = createAdminClient();
  const { error } = await admin.from("staff_profiles").delete().eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}
