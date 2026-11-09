/* =========================================================
   CONFIGURAÇÃO DO BANCO DE DADOS (Supabase)
   Pegue os dois valores no painel do Supabase:
   Project Settings > API (ou "Connect" no topo do projeto).
   A chave pública ("anon" ou "publishable") pode ficar aqui:
   ela não dá acesso às tabelas, só às funções protegidas por senha.
   Deixe os dois vazios para o site guardar tudo só no aparelho.
   ========================================================= */
const CONFIG_BANCO = {
  url: 'https://enbiapwwxyspnphzhybj.supabase.co',
  chave: 'sb_publishable_kBmT0ZDVdZ0Mlur-OnnXLA_wufPYjIW',
};

/* TURMAS do jogo. Cada estudante escolhe a sua ao criar a conta, e o ranking
   de turma só mostra os colegas da mesma turma (o Geral junta todas).
   Para abrir outra turma, acrescente aqui e em turmas_oficiais() no supabase/banco.sql. */
const TURMAS = ['8º A', '8º B'];