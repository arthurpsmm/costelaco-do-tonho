-- TaPronto — vincula seu usuário de login (criado no Dashboard) ao restaurante
-- Rode por último, depois de criar seu usuário em:
-- Authentication → Users → Add user (defina e-mail e senha aí)

insert into staff_profiles (user_id, tenant_id, full_name, role)
select
  u.id,
  t.id,
  'Tonho',                          -- troque pelo seu nome
  'owner'
from auth.users u, tenants t
where u.email = 'SEU_EMAIL_AQUI@exemplo.com'   -- troque pelo e-mail que você cadastrou
  and t.slug = 'costelaco-do-tonho'
on conflict (user_id) do nothing;
