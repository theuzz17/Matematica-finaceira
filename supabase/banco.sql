-- =========================================================
-- BANCO DE DADOS — Conectados com o Dinheiro
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em "Run".
-- Pode rodar de novo sem perder dados: ele só cria o que falta e
-- atualiza as funções.
--
-- Segurança:
--  * As tabelas ficam fechadas (RLS ligado e sem políticas). Ninguém lê
--    nem altera as tabelas direto pela internet.
--  * O site só conversa com o banco por funções (RPC) que conferem a
--    senha do estudante, o token da sessão ou o PIN da professora.
--  * Senhas e PIN são guardados com hash bcrypt, nunca em texto.
--  * Depois de 8 senhas erradas seguidas, a conta trava por 15 minutos.
-- =========================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------
create table if not exists public.alunos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(nome) between 2 and 40),
  turma         text not null check (char_length(turma) between 1 and 15),
  nome_norm     text not null,
  turma_norm    text not null,
  pin_hash      text not null,
  dados         jsonb not null default '{}'::jsonb,  -- fases, tentativas, conquistas, meta, perfil...
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

create table if not exists public.config (
  id                 int primary key default 1 check (id = 1),
  pin_professor_hash text not null,
  falhas             int not null default 0,
  bloqueado_ate      timestamptz
);
-- PIN inicial do painel pedagógico: 1234 (troque pelo painel depois de entrar).
insert into public.config (id, pin_professor_hash)
values (1, extensions.crypt('1234', extensions.gen_salt('bf', 8)))
on conflict (id) do nothing;

alter table public.alunos  enable row level security;
alter table public.sessoes enable row level security;
alter table public.config  enable row level security;
revoke all on public.alunos, public.sessoes, public.config from anon, authenticated;

-- ---------------------------------------------------------
-- FUNÇÕES INTERNAS (não ficam disponíveis para o site)
-- ---------------------------------------------------------
create or replace function public.normalizar(t text) returns text
language sql stable set search_path = public, extensions as $$
  select lower(extensions.unaccent(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g')))
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
  fases jsonb := '{}'::jsonb;
  fa    jsonb;
  fb    jsonb;
  k     text;
  a     jsonb;
  b     jsonb;
begin
  antigo := coalesce(antigo, '{}'::jsonb) - 'pin' - 'id' - 'nome' - 'turma';
  novo   := coalesce(novo,   '{}'::jsonb) - 'pin' - 'id' - 'nome' - 'turma';

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
    'fases', fases,
    'maiorSequencia', greatest(coalesce((antigo->>'maiorSequencia')::numeric, 0), coalesce((novo->>'maiorSequencia')::numeric, 0)));
end $$;

-- Registro completo que o site usa (sem a senha).
create or replace function public.registro_aluno(r public.alunos) returns jsonb
language sql stable as $$
  select (r.dados - 'pin') || jsonb_build_object(
    'id', r.id, 'nome', r.nome, 'turma', r.turma,
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

-- Confere o PIN da professora com trava contra tentativas repetidas.
create or replace function public.conferir_pin_professor(p_pin text) returns text
language plpgsql set search_path = public, extensions as $$
declare c public.config;
begin
  select * into c from public.config where id = 1 for update;
  if c.bloqueado_ate is not null and c.bloqueado_ate > now() then return 'BLOQUEADO'; end if;
  if c.pin_professor_hash <> extensions.crypt(coalesce(p_pin, ''), c.pin_professor_hash) then
    update public.config set
      falhas = case when falhas + 1 >= 8 then 0 else falhas + 1 end,
      bloqueado_ate = case when falhas + 1 >= 8 then now() + interval '15 minutes' else null end
    where id = 1;
    return 'PIN_INCORRETO';
  end if;
  update public.config set falhas = 0, bloqueado_ate = null where id = 1;
  return 'OK';
end $$;

-- ---------------------------------------------------------
-- FUNÇÕES DO ESTUDANTE (chamadas pelo site)
-- Erros voltam como {"erro": "CODIGO"} para o site mostrar a mensagem certa.
-- ---------------------------------------------------------

-- Entra na conta ou cria uma nova. Se o aparelho já tinha progresso
-- guardado (p_dados), ele é juntado ao que está no banco.
create or replace function public.entrar(p_turma text, p_nome text, p_pin text, p_dados jsonb default null) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  r   public.alunos;
  tok uuid;
  nm  text := public.limpar(p_nome);
  tm  text := public.limpar(p_turma);
begin
  if char_length(nm) not between 2 and 40 or char_length(tm) not between 1 and 15 or coalesce(p_pin, '') !~ '^\d{4}$' then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;
  if p_dados is not null and (jsonb_typeof(p_dados) <> 'object' or octet_length(p_dados::text) > 500000) then
    return jsonb_build_object('erro', 'DADOS_INVALIDOS');
  end if;

  select * into r from public.alunos
  where turma_norm = public.normalizar(tm) and nome_norm = public.normalizar(nm)
  for update;

  if found then
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
      dados = case when p_dados is null then dados else public.mesclar_dados(dados, p_dados) end,
      atualizado_em = now()
    where id = r.id
    returning * into r;
  else
    insert into public.alunos (nome, turma, nome_norm, turma_norm, pin_hash, dados)
    values (nm, tm, public.normalizar(nm), public.normalizar(tm),
            extensions.crypt(p_pin, extensions.gen_salt('bf', 8)),
            public.mesclar_dados('{}'::jsonb, coalesce(p_dados, '{}'::jsonb)))
    returning * into r;
  end if;

  insert into public.sessoes (aluno_id) values (r.id) returning token into tok;
  return jsonb_build_object('token', tok, 'aluno', public.registro_aluno(r));
end $$;

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
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' or octet_length(p_dados::text) > 500000 then
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

create or replace function public.sair(p_token uuid) returns jsonb
language sql security definer set search_path = public as $$
  delete from public.sessoes where token = p_token;
  select jsonb_build_object('ok', true);
$$;

-- Ranking: só quem está logado vê, e só os dados públicos
-- (primeiro nome + inicial do sobrenome, apelido, turma, foto e XP).
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
      'turma', a.turma,
      'personagem', a.dados->'personagem',
      'perfil', jsonb_build_object('apelido', a.dados->'perfil'->'apelido', 'moldura', a.dados->'perfil'->'moldura'),
      'criadoEm', coalesce(a.dados->>'criadoEm', to_json(a.criado_em) #>> '{}'),
      'conquistas', case when jsonb_typeof(a.dados->'conquistas') = 'array' then a.dados->'conquistas' else '[]'::jsonb end,
      'fases', case when jsonb_typeof(a.dados->'fases') = 'object' then a.dados->'fases' else '{}'::jsonb end,
      'maiorSequencia', coalesce(a.dados->'maiorSequencia', '0'::jsonb),
      'tentativas', coalesce((
        select jsonb_agg(jsonb_build_object('faseId', t->>'faseId', 'data', t->>'data', 'pontos', t->'pontos'))
        from jsonb_array_elements(case when jsonb_typeof(a.dados->'tentativas') = 'array' then a.dados->'tentativas' else '[]'::jsonb end) t
      ), '[]'::jsonb)))
    from public.alunos a), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------
-- FUNÇÕES DO PAINEL PEDAGÓGICO (exigem o PIN da professora)
-- ---------------------------------------------------------
create or replace function public.painel_dados(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_pin_professor(p_pin);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  return jsonb_build_object('alunos', coalesce((
    select jsonb_object_agg(a.id::text, public.registro_aluno(a)) from public.alunos a), '{}'::jsonb));
end $$;

create or replace function public.professor_alterar_pin(p_pin text, p_novo text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_pin_professor(p_pin);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  if coalesce(p_novo, '') !~ '^\d{4,8}$' then return jsonb_build_object('erro', 'DADOS_INVALIDOS'); end if;
  update public.config set pin_professor_hash = extensions.crypt(p_novo, extensions.gen_salt('bf', 8)) where id = 1;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.professor_apagar_tudo(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare st text := public.conferir_pin_professor(p_pin);
begin
  if st <> 'OK' then return jsonb_build_object('erro', st); end if;
  delete from public.alunos where true;
  return jsonb_build_object('ok', true);
end $$;

-- Importa um backup (o mesmo arquivo JSON do botão "Backup dos dados").
create or replace function public.professor_importar(p_pin text, p_alunos jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  st  text := public.conferir_pin_professor(p_pin);
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
    continue when char_length(nm) not between 2 and 40 or char_length(tm) not between 1 and 15;
    select * into r from public.alunos where turma_norm = public.normalizar(tm) and nome_norm = public.normalizar(nm) for update;
    if found then
      update public.alunos set dados = public.mesclar_dados(dados, reg), atualizado_em = now() where id = r.id;
      mesclados := mesclados + 1;
    else
      pin := case when coalesce(reg->>'pin', '') ~ '^\d{4}$' then reg->>'pin' else '0000' end;
      insert into public.alunos (nome, turma, nome_norm, turma_norm, pin_hash, dados)
      values (nm, tm, public.normalizar(nm), public.normalizar(tm),
              extensions.crypt(pin, extensions.gen_salt('bf', 8)), public.mesclar_dados('{}'::jsonb, reg));
      adicionados := adicionados + 1;
    end if;
  end loop;
  return jsonb_build_object('adicionados', adicionados, 'mesclados', mesclados);
end $$;

-- ---------------------------------------------------------
-- PERMISSÕES: o site (papel "anon") só pode chamar as funções públicas.
-- ---------------------------------------------------------
revoke execute on function
  public.normalizar(text), public.limpar(text), public.mesclar_dados(jsonb, jsonb),
  public.registro_aluno(public.alunos), public.aluno_da_sessao(uuid), public.conferir_pin_professor(text),
  public.entrar(text, text, text, jsonb), public.salvar_aluno(uuid, jsonb), public.trocar_senha(uuid, text, text),
  public.sair(uuid), public.ranking_publico(uuid), public.painel_dados(text),
  public.professor_alterar_pin(text, text), public.professor_apagar_tudo(text), public.professor_importar(text, jsonb)
from public, anon, authenticated;

grant execute on function
  public.entrar(text, text, text, jsonb), public.salvar_aluno(uuid, jsonb), public.trocar_senha(uuid, text, text),
  public.sair(uuid), public.ranking_publico(uuid), public.painel_dados(text),
  public.professor_alterar_pin(text, text), public.professor_apagar_tudo(text), public.professor_importar(text, jsonb)
to anon, authenticated;
