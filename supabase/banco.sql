create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;


-- TABELAS

create table if not exists public.alunos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(nome) between 2 and 40),
  turma         text not null check (char_length(turma) between 1 and 15),
  nome_norm     text not null,
  turma_norm    text not null,
  pin_hash      text not null,
  dados         jsonb not null default '{}'::jsonb,  -- fases, tentativas, conquistas, meta, perfil...
  aprovado      boolean not null default false,     -- a professora confirmou a turma (só assim aparece no ranking)
  falhas        int not null default 0,
  bloqueado_ate timestamptz,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (turma_norm, nome_norm)
);

create table if not exists public.sessoes (
  token     uuid primary key default gen_random_uuid(),
  aluno_id  uuid not null references public.alunos(id) on delete cascade,
  criado_em timestamptz not null default now(),
  usado_em  timestamptz not null default now()
);
create index if not exists sessoes_aluno_idx on public.sessoes (aluno_id);

-- Antigo PIN único do painel. Não é mais usado: o painel agora tem contas de professora (abaixo).
create table if not exists public.config (
  id                 int primary key default 1 check (id = 1),
  pin_professor_hash text not null,
  falhas             int not null default 0,
  bloqueado_ate      timestamptz
);

-- CONTAS DE PROFESSORA: entram no painel com e-mail e senha (botão "Entrar" do painel).
-- Este arquivo é público: NUNCA escreva uma senha aqui. Para criar uma conta (ou trocar a senha
-- de uma conta), rode só no SQL Editor do Supabase, trocando o e-mail e a SENHA:
--   insert into public.professores (email, senha_hash)
--   values (lower('email@exemplo.com'), extensions.crypt('SENHA', extensions.gen_salt('bf', 8)))
--   on conflict (email) do update set senha_hash = excluded.senha_hash, falhas = 0, bloqueado_ate = null;
-- Para tirar o acesso de alguém:  delete from public.professores where email = 'email@exemplo.com';
create table if not exists public.professores (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(trim(email)) and position('@' in email) > 1),
  senha_hash    text not null,
  falhas        int not null default 0,
  bloqueado_ate timestamptz,
  criado_em     timestamptz not null default now()
);

create table if not exists public.sessoes_professor (
  token        uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.professores(id) on delete cascade,
  criado_em    timestamptz not null default now(),
  usado_em     timestamptz not null default now()
);

-- APROVAÇÃO DA TURMA: conta nova só aparece no ranking depois que a professora confirma, no painel,
-- que o estudante é mesmo daquela turma. Até lá ele joga e o progresso fica salvo normalmente.
-- Na primeira vez que este arquivo roda, as contas antigas continuam valendo, e as criadas a partir
-- de 9/11/2026 (o dia em que estudantes criaram contas na turma dos outros) ficam aguardando revisão.
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'alunos' and column_name = 'aprovado') then
    alter table public.alunos add column aprovado boolean not null default true;
    update public.alunos set aprovado = false where criado_em >= timestamptz '2026-11-09 00:00:00-03';
  end if;
end $$;
alter table public.alunos alter column aprovado set default false;

alter table public.alunos  enable row level security;
alter table public.sessoes enable row level security;
alter table public.config  enable row level security;
alter table public.professores       enable row level security;
alter table public.sessoes_professor enable row level security;
revoke all on public.alunos, public.sessoes, public.config, public.professores, public.sessoes_professor from anon, authenticated;

-- ---------------------------------------------------------
-- FUNÇÕES INTERNAS (não ficam disponíveis para o site)
-- ---------------------------------------------------------
create or replace function public.normalizar(t text) returns text
language sql stable set search_path = public, extensions as $$
  select lower(extensions.unaccent(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g')))
$$;

-- Turma: "8º A", "8A", "8 a", "8° A" e "8º ano A" viram todas "8a".
create or replace function public.normalizar_turma(t text) returns text
language sql stable set search_path = public, extensions as $$
  select regexp_replace(
           regexp_replace(lower(extensions.unaccent(regexp_replace(coalesce(t, ''), '[ºª°]', '', 'g'))), '\mano\M', '', 'g'),
           '[^a-z0-9]', '', 'g')
$$;

-- TURMAS DO JOGO. Cada estudante fica em uma delas e o ranking de turma só mostra os colegas da mesma.
-- Para abrir outra turma, acrescente aqui e em TURMAS (js/config.js).
create or replace function public.turmas_oficiais() returns text[]
language sql immutable as $$
  select array['8º A', '8º B']
$$;

-- Reconhece a turma oficial escrita de qualquer jeito: "8B", "8º ano B", "8°ano b", "oitavo B", "Turma B" e "B" viram "8º B".
-- Devolve nulo quando não dá para saber a turma (por exemplo "8º ano" ou "8").
create or replace function public.turma_oficial(t text) returns text
language sql stable set search_path = public, extensions as $$
  select o from unnest(public.turmas_oficiais()) as o
  where public.normalizar_turma(o) = regexp_replace(public.normalizar_turma(t), '^(turma)?(8|oitavo)?(ano|serie)?(turma)?', '8')
  limit 1
$$;

create or replace function public.limpar(t text) returns text
language sql immutable as $$
  select regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g')
$$;

-- Junta dois registros do mesmo estudante sem perder progresso:
-- soma as tentativas sem repetir, une as conquistas e guarda o melhor de cada fase.
create or replace function public.mesclar_dados(antigo jsonb, novo jsonb) returns jsonb
language plpgsql immutable as $$
declare
  tent  jsonb;
  conq  jsonb;
  bonus jsonb;
  comp  jsonb;
  fases jsonb := '{}'::jsonb;
  fa    jsonb;
  fb    jsonb;
  k     text;
  a     jsonb;
  b     jsonb;
begin
  antigo := coalesce(antigo, '{}'::jsonb) - 'pin' - 'id' - 'nome' - 'turma' - 'aprovado';
  novo   := coalesce(novo,   '{}'::jsonb) - 'pin' - 'id' - 'nome' - 'turma' - 'aprovado';

  select coalesce(jsonb_agg(y.t order by y.t->>'data'), '[]'::jsonb) into tent
  from (
    select distinct on (x.t->>'faseId', x.t->>'data') x.t
    from (
      select jsonb_array_elements(case when jsonb_typeof(antigo->'tentativas') = 'array' then antigo->'tentativas' else '[]'::jsonb end)
      union all
      select jsonb_array_elements(case when jsonb_typeof(novo->'tentativas') = 'array' then novo->'tentativas' else '[]'::jsonb end)
    ) as x(t)
    order by x.t->>'faseId', x.t->>'data'
  ) as y;

  select coalesce(jsonb_agg(distinct c.v), '[]'::jsonb) into conq
  from (
    select jsonb_array_elements_text(case when jsonb_typeof(antigo->'conquistas') = 'array' then antigo->'conquistas' else '[]'::jsonb end)
    union
    select jsonb_array_elements_text(case when jsonb_typeof(novo->'conquistas') = 'array' then novo->'conquistas' else '[]'::jsonb end)
  ) as c(v);

  -- XP bônus dado pela professora: junta os dois lados sem repetir (um aparelho antigo não apaga o bônus).
  select coalesce(jsonb_agg(y.b order by y.b->>'data'), '[]'::jsonb) into bonus
  from (
    select distinct on (x.b->>'data', x.b->>'pontos') x.b
    from (
      select jsonb_array_elements(case when jsonb_typeof(antigo->'bonusXp') = 'array' then antigo->'bonusXp' else '[]'::jsonb end)
      union all
      select jsonb_array_elements(case when jsonb_typeof(novo->'bonusXp') = 'array' then novo->'bonusXp' else '[]'::jsonb end)
    ) as x(b)
    order by x.b->>'data', x.b->>'pontos'
  ) as y;

  -- Itens comprados na lojinha: junta os dois lados, um registro por item (vale a compra mais antiga).
  select coalesce(jsonb_agg(y.c order by y.c->>'data'), '[]'::jsonb) into comp
  from (
    select distinct on (x.c->>'item') x.c
    from (
      select jsonb_array_elements(case when jsonb_typeof(antigo->'compras') = 'array' then antigo->'compras' else '[]'::jsonb end)
      union all
      select jsonb_array_elements(case when jsonb_typeof(novo->'compras') = 'array' then novo->'compras' else '[]'::jsonb end)
    ) as x(c)
    where jsonb_typeof(x.c) = 'object' and x.c->>'item' is not null
    order by x.c->>'item', x.c->>'data'
  ) as y;

  fa := case when jsonb_typeof(antigo->'fases') = 'object' then antigo->'fases' else '{}'::jsonb end;
  fb := case when jsonb_typeof(novo->'fases')   = 'object' then novo->'fases'   else '{}'::jsonb end;
  for k in select jsonb_object_keys(fa) union select jsonb_object_keys(fb) loop
    a := fa->k;
    b := fb->k;
    if a is null then
      fases := fases || jsonb_build_object(k, b);
    elsif b is null then
      fases := fases || jsonb_build_object(k, a);
    else
      fases := fases || jsonb_build_object(k, jsonb_build_object(
        'melhorPontos',  greatest((a->>'melhorPontos')::numeric,  (b->>'melhorPontos')::numeric),
        'melhorAcertos', greatest((a->>'melhorAcertos')::numeric, (b->>'melhorAcertos')::numeric),
        'estrelas',      greatest((a->>'estrelas')::numeric,      (b->>'estrelas')::numeric),
        'tentativas',    greatest((a->>'tentativas')::numeric,    (b->>'tentativas')::numeric)));
    end if;
  end loop;

  return antigo || novo || jsonb_build_object(
    'tentativas', tent,
    'conquistas', conq,
    'bonusXp', bonus,
    'compras', comp,
    'fases', fases,
    'maiorSequencia', greatest(coalesce((antigo->>'maiorSequencia')::numeric, 0), coalesce((novo->>'maiorSequencia')::numeric, 0)));
end $$;

-- Registro completo que o site usa (sem a senha).
create or replace function public.registro_aluno(r public.alunos) returns jsonb
language sql stable as $$
  select (r.dados - 'pin') || jsonb_build_object(
    'id', r.id, 'nome', r.nome, 'turma', r.turma, 'aprovado', r.aprovado,
    'criadoEm', coalesce(r.dados->>'criadoEm', to_json(r.criado_em) #>> '{}'))
$$;

-- Devolve o estudante dono do token, ou nulo se a sessão não existe.
create or replace function public.aluno_da_sessao(p_token uuid) returns public.alunos
language plpgsql as $$
declare r public.alunos;
begin
  select a.* into r
  from public.sessoes s join public.alunos a on a.id = s.aluno_id
  where s.token = p_token and s.usado_em > now() - interval '180 days';
  if found then
    update public.sessoes set usado_em = now() where token = p_token;
  end if;
  return r;
end $$;

-- O painel deixou de usar o PIN único (o 1234 estava neste arquivo público).
drop function if exists public.conferir_pin_professor(text);

-- Professora dona da sessão do painel (token devolvido por professor_entrar), ou nulo.
-- A sessão vale enquanto for usada; depois de 12 horas parada, é preciso entrar de novo.
create or replace function public.professor_da_sessao(p_sessao text) returns uuid
language plpgsql set search_path = public as $$
declare pid uuid;
begin
  if coalesce(p_sessao, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return null; end if;
  update public.sessoes_professor set usado_em = now()
  where token = p_sessao::uuid and usado_em > now() - interval '12 hours'
  returning professor_id into pid;
  return pid;
end $$;

-- Usada por todas as funções do painel: 'OK' ou o erro para o site mostrar.
create or replace function public.conferir_professor(p_sessao text) returns text
language sql set search_path = public as $$
  select case when public.professor_da_sessao(p_sessao) is null then 'SESSAO_PROFESSOR_INVALIDA' else 'OK' end
$$;

-- ---------------------------------------------------------
-- FUNÇÕES DO ESTUDANTE (chamadas pelo site)
-- Erros voltam como {"erro": "CODIGO"} para o site mostrar a mensagem certa.
-- ---------------------------------------------------------

-- Núcleo do acesso. p_modo:
--   'entrar' = só entra em conta que já existe (erro CONTA_NAO_ENCONTRADA)
--   'criar'  = só cria conta nova (erro CONTA_EXISTE)
--   'ambos'  = entra ou cria (usado para enviar progresso feito sem internet)
-- Se o aparelho já tinha progresso guardado (p_dados), ele é juntado ao do banco.
-- Conta nova só pode ser criada em uma das turmas oficiais, e só entra no ranking depois que a professora aprova.
create or replace function public.acessar_conta(p_turma text, p_nome text, p_pin text, p_dados jsonb, p_modo text) returns jsonb
language plpgsql set search_path = public, extensions as $$
declare
  r     public.alunos;
  tok   uuid;
  achou boolean;
  ofi   boolean;
  nm    text := public.limpar(p_nome);
  tm    text := public.limpar(p_turma);
begin
  tm  := coalesce(public.turma_oficial(tm), tm);
  ofi := tm = any(public.turmas_oficiais());
  if char_length(nm) not between 2 and 40 or char_length(tm) not between 1 and 15 or coalesce(p_pin, '') !~ '^\d{4}$' then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;
  if p_dados is not null and (jsonb_typeof(p_dados) <> 'object' or octet_length(p_dados::text) > 3000000) then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;
  if p_modo = 'criar' and not ofi then
    return jsonb_build_object('erro', 'TURMA_INVALIDA');
  end if;

  select * into r from public.alunos
  where turma_norm = public.normalizar_turma(tm) and nome_norm = public.normalizar(nm)
  for update;
  achou := found;

  -- Conta antiga com uma turma que não dá para reconhecer ("8º ano", "8"): se só existe uma
  -- com esse nome, é ela. Ao entrar com a senha certa, ela passa para a turma escolhida agora
  -- e fica aguardando a professora confirmar essa turma.
  if not achou and ofi and (
    select count(*) from public.alunos a where a.nome_norm = public.normalizar(nm) and public.turma_oficial(a.turma) is null
  ) = 1 then
    select * into r from public.alunos a
    where a.nome_norm = public.normalizar(nm) and public.turma_oficial(a.turma) is null
    for update;
    achou := found;
  end if;

  if achou and p_modo = 'criar' then
    return jsonb_build_object('erro', 'CONTA_EXISTE');
  elsif not achou and p_modo = 'entrar' then
    return jsonb_build_object('erro', 'CONTA_NAO_ENCONTRADA');
  end if;

  if achou then
    if r.bloqueado_ate is not null and r.bloqueado_ate > now() then
      return jsonb_build_object('erro', 'BLOQUEADO');
    end if;
    if r.pin_hash <> extensions.crypt(p_pin, r.pin_hash) then
      update public.alunos set
        falhas = case when falhas + 1 >= 8 then 0 else falhas + 1 end,
        bloqueado_ate = case when falhas + 1 >= 8 then now() + interval '15 minutes' else null end
      where id = r.id;
      return jsonb_build_object('erro', 'SENHA_INCORRETA');
    end if;
    update public.alunos set
      falhas = 0, bloqueado_ate = null,
      turma      = case when ofi then tm else turma end,
      turma_norm = case when ofi then public.normalizar_turma(tm) else turma_norm end,
      -- Turma escolhida pelo próprio estudante: a professora precisa confirmar.
      aprovado   = case when ofi and public.turma_oficial(r.turma) is distinct from tm then false else aprovado end,
      dados = case when p_dados is null then dados else public.mesclar_dados(dados, p_dados) end,
      atualizado_em = now()
    where id = r.id
    returning * into r;
  else
    insert into public.alunos (nome, turma, nome_norm, turma_norm, pin_hash, dados, aprovado)
    values (nm, tm, public.normalizar(nm), public.normalizar_turma(tm),
            extensions.crypt(p_pin, extensions.gen_salt('bf', 8)),
            public.mesclar_dados('{}'::jsonb, coalesce(p_dados, '{}'::jsonb)), false)
    returning * into r;
  end if;

  insert into public.sessoes (aluno_id) values (r.id) returning token into tok;
  return jsonb_build_object('token', tok, 'aluno', public.registro_aluno(r));
end $$;

-- Botão "Entrar": só funciona se a conta já existe.
create or replace function public.entrar_conta(p_turma text, p_nome text, p_pin text, p_dados jsonb default null) returns jsonb
language sql security definer set search_path = public, extensions as $$
  select public.acessar_conta(p_turma, p_nome, p_pin, p_dados, 'entrar')
$$;

-- Botão "Criar conta": só funciona se ainda não existe conta com esse nome na turma.
create or replace function public.criar_conta(p_turma text, p_nome text, p_pin text, p_dados jsonb default null) returns jsonb
language sql security definer set search_path = public, extensions as $$
  select public.acessar_conta(p_turma, p_nome, p_pin, p_dados, 'criar')
$$;

-- Entra ou cria. O site usa só para enviar o progresso de uma conta criada sem internet.
create or replace function public.entrar(p_turma text, p_nome text, p_pin text, p_dados jsonb default null) returns jsonb
language sql security definer set search_path = public, extensions as $$
  select public.acessar_conta(p_turma, p_nome, p_pin, p_dados, 'ambos')
$$;

-- Salva o progresso. Também troca o nome, se ele mudou e não estiver em uso.
create or replace function public.salvar_aluno(p_token uuid, p_dados jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  r  public.alunos;
  nm text;
  ok boolean;
begin
  r := public.aluno_da_sessao(p_token);
  if r.id is null then return jsonb_build_object('erro', 'SESSAO_INVALIDA'); end if;
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' or octet_length(p_dados::text) > 3000000 then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;

  nm := public.limpar(coalesce(p_dados->>'nome', r.nome));
  ok := char_length(nm) between 2 and 40;
  if ok and public.normalizar(nm) <> r.nome_norm and exists (
    select 1 from public.alunos where turma_norm = r.turma_norm and nome_norm = public.normalizar(nm) and id <> r.id
  ) then
    return jsonb_build_object('erro', 'NOME_EM_USO');
  end if;

  update public.alunos set
    nome = case when ok then nm else nome end,
    nome_norm = case when ok then public.normalizar(nm) else nome_norm end,
    dados = public.mesclar_dados(dados, p_dados),
    atualizado_em = now()
  where id = r.id
  returning * into r;
  return jsonb_build_object('aluno', public.registro_aluno(r));
end $$;

create or replace function public.trocar_senha(p_token uuid, p_atual text, p_nova text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.alunos;
begin
  r := public.aluno_da_sessao(p_token);
  if r.id is null then return jsonb_build_object('erro', 'SESSAO_INVALIDA'); end if;
  if r.bloqueado_ate is not null and r.bloqueado_ate > now() then return jsonb_build_object('erro', 'BLOQUEADO'); end if;
  if r.pin_hash <> extensions.crypt(coalesce(p_atual, ''), r.pin_hash) then
    update public.alunos set
      falhas = case when falhas + 1 >= 8 then 0 else falhas + 1 end,
      bloqueado_ate = case when falhas + 1 >= 8 then now() + interval '15 minutes' else null end
    where id = r.id;
    return jsonb_build_object('erro', 'SENHA_ATUAL_INCORRETA');
  end if;
  if coalesce(p_nova, '') !~ '^\d{4}$' then return jsonb_build_object('erro', 'DADOS_INVALIDOS'); end if;
  update public.alunos set pin_hash = extensions.crypt(p_nova, extensions.gen_salt('bf', 8)), falhas = 0 where id = r.id;
  return jsonb_build_object('ok', true);
end $$;

-- Conta antiga sem turma reconhecida: o estudante escolhe a turma uma vez, e a professora confirma no painel.
-- Quem já está em uma turma não troca sozinho (só a professora troca); recebe de volta a turma que já tem.
create or replace function public.escolher_turma(p_token uuid, p_turma text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  r  public.alunos;
  tm text := public.turma_oficial(p_turma);
begin
  r := public.aluno_da_sessao(p_token);
  if r.id is null then return jsonb_build_object('erro', 'SESSAO_INVALIDA'); end if;
  if tm is null then return jsonb_build_object('erro', 'TURMA_INVALIDA'); end if;
  if public.turma_oficial(r.turma) is null then
    begin
      update public.alunos set turma = tm, turma_norm = public.normalizar_turma(tm), aprovado = false, atualizado_em = now()
      where id = r.id
      returning * into r;
    exception when unique_violation then
      return jsonb_build_object('erro', 'NOME_EM_USO');
    end;
  end if;
  return jsonb_build_object('aluno', public.registro_aluno(r));
end $$;

create or replace function public.sair(p_token uuid) returns jsonb
language sql security definer set search_path = public as $$
  delete from public.sessoes where token = p_token;
  select jsonb_build_object('ok', true);
$$;

-- Ranking: só quem está logado vê, e só os dados públicos
-- (primeiro nome + inicial do sobrenome, apelido, turma, foto e XP).
-- Só aparece quem a professora já aprovou na turma.
create or replace function public.ranking_publico(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.alunos;
begin
  r := public.aluno_da_sessao(p_token);
  if r.id is null then return jsonb_build_object('erro', 'SESSAO_INVALIDA'); end if;
  return jsonb_build_object('alunos', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id,
      'nome', split_part(a.nome, ' ', 1) ||
              case when position(' ' in a.nome) > 0 then ' ' || left(regexp_replace(a.nome, '^.* ', ''), 1) || '.' else '' end,
      'turma', coalesce(public.turma_oficial(a.turma), a.turma),
      'personagem', a.dados->'personagem',
      'perfil', jsonb_build_object('apelido', a.dados->'perfil'->'apelido', 'moldura', a.dados->'perfil'->'moldura'),
      'visual', case when jsonb_typeof(a.dados->'visual') = 'object' then a.dados->'visual' else '{}'::jsonb end,
      'criadoEm', coalesce(a.dados->>'criadoEm', to_json(a.criado_em) #>> '{}'),
      'conquistas', case when jsonb_typeof(a.dados->'conquistas') = 'array' then a.dados->'conquistas' else '[]'::jsonb end,
      'fases', case when jsonb_typeof(a.dados->'fases') = 'object' then a.dados->'fases' else '{}'::jsonb end,
      'maiorSequencia', coalesce(a.dados->'maiorSequencia', '0'::jsonb),
      'bonusXp', case when jsonb_typeof(a.dados->'bonusXp') = 'array' then a.dados->'bonusXp' else '[]'::jsonb end,
      'tentativas', coalesce((
        select jsonb_agg(jsonb_build_object('faseId', t->>'faseId', 'data', t->>'data', 'pontos', t->'pontos'))
        from jsonb_array_elements(case when jsonb_typeof(a.dados->'tentativas') = 'array' then a.dados->'tentativas' else '[]'::jsonb end) t
      ), '[]'::jsonb)))
    from public.alunos a where a.aprovado), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------
-- FUNÇÕES DO PAINEL PEDAGÓGICO (exigem uma professora logada: p_sessao)
-- ---------------------------------------------------------
-- Versões antigas, que pediam o PIN (p_pin), saem para dar lugar às que pedem a sessão (p_sessao).
drop function if exists public.painel_dados(text);
drop function if exists public.professor_alterar_pin(text, text);
drop function if exists public.professor_apagar_tudo(text);
drop function if exists public.professor_importar(text, jsonb);
drop function if exists public.professor_redefinir_senha(text, uuid, text);
drop function if exists public.professor_apagar_aluno(text, uuid);
drop function if exists public.professor_mudar_turma(text, uuid, text);
drop function if exists public.professor_aprovar(text, jsonb);

-- Botão "Entrar" do painel: e-mail e senha da professora. Errar 8 vezes trava a conta por 15 minutos.
create or replace function public.professor_entrar(p_email text, p_senha text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  p   public.professores;
  tok uuid;
begin
  select * into p from public.professores where email = lower(trim(coalesce(p_email, ''))) for update;
  if not found then return jsonb_build_object('erro', 'LOGIN_INCORRETO'); end if;
  if p.bloqueado_ate is not null and p.bloqueado_ate > now() then return jsonb_build_object('erro', 'BLOQUEADO'); end if;
  if p.senha_hash <> extensions.crypt(coalesce(p_senha, ''), p.senha_hash) then
    update public.professores set
      falhas = case when falhas + 1 >= 8 then 0 else falhas + 1 end,
      bloqueado_ate = case when falhas + 1 >= 8 then now() + interval '15 minutes' else null end
    where id = p.id;
    return jsonb_build_object('erro', 'LOGIN_INCORRETO');
  end if;
  update public.professores set falhas = 0, bloqueado_ate = null where id = p.id;
  delete from public.sessoes_professor where usado_em < now() - interval '12 hours';
  insert into public.sessoes_professor (professor_id) values (p.id) returning token into tok;
  return jsonb_build_object('token', tok, 'email', p.email);
end $$;

create or replace function public.professor_sair(p_sessao text) returns jsonb
language sql security definer set search_path = public as $$
  delete from public.sessoes_professor where token::text = lower(coalesce(p_sessao, ''));
  select jsonb_build_object('ok', true);
$$;

-- A professora troca a própria senha (pelo menos 6 caracteres).
create or replace function public.professor_trocar_senha(p_sessao text, p_atual text, p_nova text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  pid uuid := public.professor_da_sessao(p_sessao);
  p   public.professores;
begin
  if pid is null then return jsonb_build_object('erro', 'SESSAO_PROFESSOR_INVALIDA'); end if;
  select * into p from public.professores where id = pid for update;
  if p.bloqueado_ate is not null and p.bloqueado_ate > now() then return jsonb_build_object('erro', 'BLOQUEADO'); end if;
  if p.senha_hash <> extensions.crypt(coalesce(p_atual, ''), p.senha_hash) then
    update public.professores set
      falhas = case when falhas + 1 >= 8 then 0 else falhas + 1 end,
      bloqueado_ate = case when falhas + 1 >= 8 then now() + interval '15 minutes' else null end
    where id = pid;
    return jsonb_build_object('erro', 'SENHA_ATUAL_INCORRETA');
  end if;
  if char_length(coalesce(p_nova, '')) not between 6 and 72 then return jsonb_build_object('erro', 'SENHA_CURTA'); end if;
  update public.professores set senha_hash = extensions.crypt(p_nova, extensions.gen_salt('bf', 8)), falhas = 0 where id = pid;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.painel_dados(p_sessao text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_professor(p_sessao);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  return jsonb_build_object('alunos', coalesce((
    select jsonb_object_agg(a.id::text, public.registro_aluno(a)) from public.alunos a), '{}'::jsonb));
end $$;

create or replace function public.professor_apagar_tudo(p_sessao text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_professor(p_sessao);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  delete from public.alunos where true;
  return jsonb_build_object('ok', true);
end $$;

-- Importa um backup (o mesmo arquivo JSON do botão "Backup dos dados").
create or replace function public.professor_importar(p_sessao text, p_alunos jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  st  text := public.conferir_professor(p_sessao);
  reg jsonb;
  nm  text;
  tm  text;
  pin text;
  r   public.alunos;
  adicionados int := 0;
  mesclados   int := 0;
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  if jsonb_typeof(p_alunos) <> 'object' then return jsonb_build_object('erro', 'DADOS_INVALIDOS'); end if;
  for reg in select value from jsonb_each(p_alunos) loop
    nm := public.limpar(reg->>'nome');
    tm := public.limpar(reg->>'turma');
    tm := coalesce(public.turma_oficial(tm), tm);
    continue when char_length(nm) not between 2 and 40 or char_length(tm) not between 1 and 15;
    select * into r from public.alunos where turma_norm = public.normalizar_turma(tm) and nome_norm = public.normalizar(nm) for update;
    if found then
      update public.alunos set dados = public.mesclar_dados(dados, reg), atualizado_em = now() where id = r.id;
      mesclados := mesclados + 1;
    else
      pin := case when coalesce(reg->>'pin', '') ~ '^\d{4}$' then reg->>'pin' else '0000' end;
      -- Backup trazido pela professora: já vale como aprovado.
      insert into public.alunos (nome, turma, nome_norm, turma_norm, pin_hash, dados, aprovado)
      values (nm, tm, public.normalizar(nm), public.normalizar_turma(tm),
              extensions.crypt(pin, extensions.gen_salt('bf', 8)), public.mesclar_dados('{}'::jsonb, reg), true);
      adicionados := adicionados + 1;
    end if;
  end loop;
  return jsonb_build_object('adicionados', adicionados, 'mesclados', mesclados);
end $$;

-- Estudante esqueceu a senha: a professora define uma nova pelo painel.
create or replace function public.professor_redefinir_senha(p_sessao text, p_aluno uuid, p_nova text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_professor(p_sessao);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  if coalesce(p_nova, '') !~ '^\d{4}$' then return jsonb_build_object('erro', 'DADOS_INVALIDOS'); end if;
  update public.alunos set pin_hash = extensions.crypt(p_nova, extensions.gen_salt('bf', 8)), falhas = 0, bloqueado_ate = null
  where id = p_aluno;
  if not found then return jsonb_build_object('erro', 'CONTA_NAO_ENCONTRADA'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Apaga a conta de um estudante (por exemplo, uma conta de teste ou repetida).
create or replace function public.professor_apagar_aluno(p_sessao text, p_aluno uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_professor(p_sessao);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  delete from public.alunos where id = p_aluno;
  if not found then return jsonb_build_object('erro', 'CONTA_NAO_ENCONTRADA'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Passa um estudante para outra turma (por exemplo, quem escolheu a turma errada). O progresso não muda.
-- Como é a professora que escolhe a turma, a conta já fica aprovada nela.
create or replace function public.professor_mudar_turma(p_sessao text, p_aluno uuid, p_turma text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  st text := public.conferir_professor(p_sessao);
  tm text := public.turma_oficial(p_turma);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  if tm is null then return jsonb_build_object('erro', 'TURMA_INVALIDA'); end if;
  begin
    update public.alunos set turma = tm, turma_norm = public.normalizar_turma(tm), aprovado = true, atualizado_em = now()
    where id = p_aluno;
    if not found then return jsonb_build_object('erro', 'CONTA_NAO_ENCONTRADA'); end if;
  exception when unique_violation then
    return jsonb_build_object('erro', 'NOME_EM_USO');
  end;
  return jsonb_build_object('ok', true);
end $$;

-- Aprova contas na turma em que estão (uma ou várias de uma vez). p_alunos = lista JSON de ids.
-- Conta sem turma oficial não é aprovada assim: use "Mudar turma", que já aprova.
create or replace function public.professor_aprovar(p_sessao text, p_alunos jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  st text := public.conferir_professor(p_sessao);
  n  int;
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  if jsonb_typeof(p_alunos) <> 'array' or jsonb_array_length(p_alunos) > 500
     or exists (select 1 from jsonb_array_elements(p_alunos) e where jsonb_typeof(e) <> 'string'
                or e #>> '{}' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;
  update public.alunos set aprovado = true, atualizado_em = now()
  where id in (select (e #>> '{}')::uuid from jsonb_array_elements(p_alunos) e)
    and not aprovado and public.turma_oficial(turma) is not null;
  get diagnostics n = row_count;
  return jsonb_build_object('aprovados', n);
end $$;

-- Atualiza contas antigas para a nova regra de turma ("8A" = "8º A").
-- Se duas contas antigas virarem a mesma, as duas ficam como estavam.
do $$
declare r record;
begin
  for r in select id, turma from public.alunos where turma_norm <> public.normalizar_turma(turma) loop
    begin
      update public.alunos set turma_norm = public.normalizar_turma(r.turma) where id = r.id;
    exception when unique_violation then null;
    end;
  end loop;
end $$;

-- Coloca as contas antigas nas turmas oficiais: "8B", "8°ano B", "B"... viram "8º B". O progresso não muda.
-- Se a mesma pessoa tiver duas contas que virariam uma só, as duas ficam como estavam (a professora vê no painel).
-- Contas sem turma reconhecível ("8º ano", "8") ficam como estão: o estudante escolhe a turma no site.
do $$
declare
  r record;
  o text;
begin
  for r in select id, turma, turma_norm from public.alunos loop
    o := public.turma_oficial(r.turma);
    continue when o is null or (r.turma = o and r.turma_norm = public.normalizar_turma(o));
    begin
      update public.alunos set turma = o, turma_norm = public.normalizar_turma(o) where id = r.id;
    exception when unique_violation then null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------
-- PERMISSÕES: o site (papel "anon") só pode chamar as funções públicas.
-- ---------------------------------------------------------
revoke execute on function
  public.normalizar(text), public.normalizar_turma(text), public.limpar(text), public.mesclar_dados(jsonb, jsonb),
  public.turmas_oficiais(), public.turma_oficial(text),
  public.registro_aluno(public.alunos), public.aluno_da_sessao(uuid),
  public.professor_da_sessao(text), public.conferir_professor(text),
  public.acessar_conta(text, text, text, jsonb, text),
  public.entrar(text, text, text, jsonb), public.entrar_conta(text, text, text, jsonb), public.criar_conta(text, text, text, jsonb),
  public.salvar_aluno(uuid, jsonb), public.trocar_senha(uuid, text, text), public.escolher_turma(uuid, text),
  public.sair(uuid), public.ranking_publico(uuid), public.painel_dados(text),
  public.professor_entrar(text, text), public.professor_sair(text), public.professor_trocar_senha(text, text, text),
  public.professor_apagar_tudo(text), public.professor_importar(text, jsonb),
  public.professor_redefinir_senha(text, uuid, text), public.professor_apagar_aluno(text, uuid),
  public.professor_mudar_turma(text, uuid, text), public.professor_aprovar(text, jsonb)
from public, anon, authenticated;

grant execute on function
  public.entrar(text, text, text, jsonb), public.entrar_conta(text, text, text, jsonb), public.criar_conta(text, text, text, jsonb),
  public.salvar_aluno(uuid, jsonb), public.trocar_senha(uuid, text, text), public.escolher_turma(uuid, text),
  public.sair(uuid), public.ranking_publico(uuid), public.painel_dados(text),
  public.professor_entrar(text, text), public.professor_sair(text), public.professor_trocar_senha(text, text, text),
  public.professor_apagar_tudo(text), public.professor_importar(text, jsonb),
  public.professor_redefinir_senha(text, uuid, text), public.professor_apagar_aluno(text, uuid),
  public.professor_mudar_turma(text, uuid, text), public.professor_aprovar(text, jsonb)
to anon, authenticated;

-- Remove a função de dar XP pelo painel, caso tenha sido criada antes.
drop function if exists public.professor_dar_xp(text, uuid, int);
