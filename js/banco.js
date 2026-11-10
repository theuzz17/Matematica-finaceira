/* =========================================================
   BANCO DE DADOS — conversa com o Supabase.
   O aparelho continua guardando tudo (funciona sem internet) e
   envia o progresso para o banco assim que der. O banco junta o
   progresso de todos os aparelhos sem perder nada.
   ========================================================= */

class ErroBanco extends Error {
  constructor(codigo, detalhe = '') { super(codigo); this.codigo = codigo; this.detalhe = detalhe; }
}

const MENSAGENS_BANCO = {
  SENHA_INCORRETA: 'Senha incorreta para este nome e turma.',
  CONTA_NAO_ENCONTRADA: 'Não encontramos uma conta com esse nome nesta turma. Confira o nome e se você escolheu a turma certa, ou crie uma conta se for a primeira vez.',
  TURMA_INVALIDA: 'Escolha a sua turma.',
  CONTA_EXISTE: 'Já existe uma conta com esse nome nesta turma. Se é sua, entre com a sua senha.',
  SENHA_ATUAL_INCORRETA: 'A senha atual está incorreta.',
  BLOQUEADO: 'Muitas tentativas erradas. Espere 15 minutos e tente de novo.',
  NOME_EM_USO: 'Já existe alguém com esse nome nesta turma.',
  PIN_INCORRETO: 'PIN incorreto.',
  LOGIN_INCORRETO: 'E-mail ou senha incorretos.',
  SESSAO_PROFESSOR_INVALIDA: 'Sua sessão no painel acabou. Saia e entre de novo.',
  SENHA_CURTA: 'A nova senha precisa ter pelo menos 6 caracteres.',
  DADOS_INVALIDOS: 'Confira os dados digitados.',
  SESSAO_INVALIDA: 'Sua sessão expirou. Entre de novo.',
  CONTA_APAGADA: 'Esta conta foi apagada pela professora.',
  SEM_CONEXAO: 'Sem conexão com a internet. Tente de novo.',
  SERVIDOR: 'O banco de dados não respondeu. Tente de novo em instantes.',
};
const mensagemErro = e => MENSAGENS_BANCO[e?.codigo] || MENSAGENS_BANCO.SERVIDOR;

const Banco = {
  ativo: !!(CONFIG_BANCO.url && CONFIG_BANCO.chave),

  async rpc(funcao, args = {}) {
    const headers = { 'Content-Type': 'application/json', apikey: CONFIG_BANCO.chave };
    // Chaves antigas (JWT "anon") também vão no Authorization; as novas "sb_publishable_" não.
    if (!CONFIG_BANCO.chave.startsWith('sb_')) headers.Authorization = `Bearer ${CONFIG_BANCO.chave}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    let resp;
    try {
      resp = await fetch(`${CONFIG_BANCO.url.replace(/\/+$/, '')}/rest/v1/rpc/${funcao}`, {
        method: 'POST', headers, body: JSON.stringify(args), signal: ctrl.signal,
      });
    } catch (e) {
      throw new ErroBanco('SEM_CONEXAO', e.message);
    } finally { clearTimeout(timer); }
    if (!resp.ok) throw new ErroBanco('SERVIDOR', `${resp.status} ${await resp.text().catch(() => '')}`);
    const res = await resp.json();
    if (res && res.erro) throw new ErroBanco(res.erro);
    return res;
  },
};

/* ---------------- SESSÃO E SINCRONIZAÇÃO DO ESTUDANTE ---------------- */
const lerLS = k => { try { return localStorage.getItem(CHAVE + k); } catch { return null; } };
const gravarLS = (k, v) => { try { v == null ? localStorage.removeItem(CHAVE + k) : localStorage.setItem(CHAVE + k, v); } catch { /* sem armazenamento */ } };
const semSenha = a => { const { pin, ...resto } = a; return resto; };
// Garante os campos que o site espera, mesmo numa conta recém-criada no banco.
const comPadroes = reg => ({ personagem: null, fases: {}, tentativas: [], conquistas: [], meta: null, maiorSequencia: 0, perfil: {}, compras: [], visual: {}, ...reg });
const chaveDe = a => chaveConta(a.turma, a.nome);
// Conta nova (ou que acabou de escolher a turma) espera a professora confirmar a turma no painel.
// Até lá ela joga normalmente, mas não aparece no ranking de ninguém.
const aguardandoAprovacao = a => Banco.ativo && !!a && a.aprovado === false;
// Conta que veio do banco (o id é do banco). Conta criada sem internet tem id do aparelho.
const contaDoBanco = a => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a?.id || '');

const Sync = {
  timer: null,
  enviando: false,
  versao: 0,
  avisos: new Set(),
  get token() { return lerLS('_token'); },
  set token(t) { gravarLS('_token', t); },
  get pendente() { return lerLS('_pendente') === '1'; },
  set pendente(v) { gravarLS('_pendente', v ? '1' : null); },

  agendar(espera = 1200) {
    if (!Banco.ativo || !aluno) return;
    this.versao++;
    this.pendente = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.enviar(), espera);
  },

  avisarUmaVez(id, msg) { if (!this.avisos.has(id)) { this.avisos.add(id); toast(msg); } },

  async enviar() {
    if (!Banco.ativo || !aluno || this.enviando || !this.pendente) return;
    this.enviando = true;
    const alvo = aluno, versao = this.versao;
    try {
      const res = await enviarAluno(alvo);
      if (aluno === alvo && this.versao === versao) { aplicarServidor(res.aluno); this.pendente = false; }
    } catch (e) {
      if (e.codigo === 'SENHA_INCORRETA') {
        this.avisarUmaVez('conflito', '⚠️ Seu progresso não foi enviado: já existe outra conta com este nome e turma no banco. Fale com a professora.');
      } else if (e.codigo === 'CONTA_APAGADA') {
        this.avisarUmaVez('apagada', '⚠️ Esta conta foi apagada pela professora e não aparece mais no ranking. Se ela é sua mesmo, fale com a professora.');
      } else {
        if (e.codigo === 'SEM_CONEXAO') this.avisarUmaVez('offline', '📴 Sem internet. Seu progresso fica guardado neste aparelho e vai para o banco quando a conexão voltar.');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.enviar(), 20000);
      }
    } finally {
      this.enviando = false;
      if (aluno === alvo && this.pendente && this.versao !== versao) this.agendar(300);
    }
  },
};

// Envia o estudante. Sem token válido, entra de novo com a senha guardada no aparelho.
async function enviarAluno(a) {
  if (Sync.token) {
    try { return await Banco.rpc('salvar_aluno', { p_token: Sync.token, p_dados: semSenha(a) }); }
    catch (e) { if (e.codigo !== 'SESSAO_INVALIDA') throw e; Sync.token = null; }
  }
  const res = await entrarDeNovo(a);
  Sync.token = res.token;
  return res;
}

async function garantirToken() {
  if (Sync.token) return Sync.token;
  const res = await entrarDeNovo(aluno);
  Sync.token = res.token;
  aplicarServidor(res.aluno);
  return res.token;
}

// Entra de novo com a senha guardada no aparelho. Conta criada sem internet é criada no banco agora.
// Conta que já estava no banco só entra: se a professora apagou, ela não é criada de novo sozinha.
async function entrarDeNovo(a) {
  if (!a.pin) throw new ErroBanco('SESSAO_INVALIDA');
  const args = { p_turma: a.turma, p_nome: a.nome, p_pin: a.pin, p_dados: semSenha(a) };
  if (!contaDoBanco(a)) return Banco.rpc('entrar', args);
  try {
    return await Banco.rpc('entrar_conta', args);
  } catch (e) {
    if (e.codigo === 'CONTA_NAO_ENCONTRADA') throw new ErroBanco('CONTA_APAGADA');
    if (e.codigo === 'SERVIDOR' && /404|PGRST202/.test(e.detalhe)) return Banco.rpc('entrar', args);
    throw e;
  }
}

// Troca os dados do estudante pelos do banco (já juntados), mantendo o mesmo objeto.
function aplicarServidor(reg) {
  const pin = aluno.pin, idAntigo = aluno.id;
  Object.keys(aluno).forEach(k => delete aluno[k]);
  Object.assign(aluno, comPadroes(reg), { pin });
  if (idAntigo !== aluno.id) delete dados.alunos[idAntigo];
  dados.alunos[aluno.id] = aluno;
  Store.salvar(dados);
  Store.sessao(aluno.id);
  lembrarUltimoLogin(aluno.nome, aluno.turma);   // a professora pode ter trocado a turma
}

// Login ou criação de conta pelo banco. Se o aparelho tinha progresso desta conta, ele vai junto
// (inclusive de conta antiga com turma não reconhecida, que o banco passa para a turma escolhida).
async function entrarOnline(nome, turma, pin, modo = 'entrar') {
  const contas = Object.values(dados.alunos).filter(a => a.pin === pin);
  const local = contas.find(a => chaveDe(a) === chaveConta(turma, nome)) || contas.find(a => contaSemTurma(a, nome));
  const args = { p_turma: turma, p_nome: nome, p_pin: pin, p_dados: local ? semSenha(local) : null };
  let res;
  try {
    res = await Banco.rpc(modo === 'criar' ? 'criar_conta' : 'entrar_conta', args);
  } catch (e) {
    if (e.codigo === 'CONTA_NAO_ENCONTRADA' && local) {
      // Conta que só existia neste aparelho (de antes do banco): leva para o banco com o progresso.
      res = await Banco.rpc('criar_conta', args);
    } else if (e.codigo === 'SERVIDOR' && /404|PGRST202/.test(e.detalhe)) {
      // Banco ainda sem as funções novas (banco.sql antigo): usa a função antiga, que entra ou cria.
      res = await Banco.rpc('entrar', args);
    } else throw e;
  }
  if (local) delete dados.alunos[local.id];
  Sync.token = res.token;
  Sync.pendente = false;
  aluno = { ...comPadroes(res.aluno), pin };
  dados.alunos[aluno.id] = aluno;
  Store.salvar(dados);
  Store.sessao(aluno.id);
  atualizarRanking();
}

// Conta antiga sem turma reconhecida escolhe a turma. Só a turma muda no aparelho
// (o resto continua como está, para não perder progresso que ainda não foi enviado).
async function definirTurma(turma) {
  if (Banco.ativo) {
    const token = await garantirToken();
    const res = await Banco.rpc('escolher_turma', { p_token: token, p_turma: turma });
    aluno.turma = res.aluno.turma;
    if (typeof res.aluno.aprovado === 'boolean') aluno.aprovado = res.aluno.aprovado;
  } else {
    if (Object.values(dados.alunos).some(o => o.id !== aluno.id && chaveConta(o.turma, o.nome) === chaveConta(turma, aluno.nome))) throw new ErroBanco('NOME_EM_USO');
    aluno.turma = turma;
  }
  dados.alunos[aluno.id] = aluno;
  Store.salvar(dados);
  lembrarUltimoLogin(aluno.nome, aluno.turma);
}

async function sairOnline() {
  if (!Banco.ativo) return;
  if (Sync.pendente && aluno) { clearTimeout(Sync.timer); await Sync.enviar().catch(() => {}); }
  const tok = Sync.token;
  Sync.token = null;
  Sync.pendente = false;
  rankingServidor = null;
  gravarLS('_ranking', null);
  if (tok) Banco.rpc('sair', { p_token: tok }).catch(() => {});
}

/* ---------------- RANKING VINDO DO BANCO ---------------- */
let rankingServidor = (() => { try { return JSON.parse(lerLS('_ranking')); } catch { return null; } })();
let rankingVersao = 0;

async function atualizarRanking() {
  if (!Banco.ativo || !Sync.token) return false;
  try {
    const r = await Banco.rpc('ranking_publico', { p_token: Sync.token });
    rankingServidor = r.alunos;
    // A professora pode ter trocado a minha turma pelo painel.
    const eu = aluno && r.alunos.find(a => a.id === aluno.id);
    // Estou no ranking: a professora já aprovou a minha turma.
    if (eu && aluno.aprovado === false) { aluno.aprovado = true; Store.salvar(dados); }
    if (eu && turmaOficial(eu.turma) && turmaOficial(eu.turma) !== turmaOficial(aluno.turma)) {
      aluno.turma = turmaOficial(eu.turma);
      Store.salvar(dados);
      lembrarUltimoLogin(aluno.nome, aluno.turma);
    }
    rankingVersao++;
    gravarLS('_ranking', JSON.stringify(r.alunos));
    return true;
  } catch (e) {
    if (e.codigo === 'SESSAO_INVALIDA') Sync.token = null;
    return false;
  }
}

// Lista usada pelo ranking: do banco (com o meu registro atualizado) ou, sem banco, do aparelho.
// Quem ainda espera a professora aprovar a turma não entra (nem no próprio aparelho).
function alunosRanking() {
  if (!Banco.ativo || !Array.isArray(rankingServidor)) return Object.values(dados.alunos).filter(a => !aguardandoAprovacao(a));
  const lista = rankingServidor.filter(a => !aluno || a.id !== aluno.id);
  if (aluno && !aguardandoAprovacao(aluno)) lista.push(aluno);
  return lista;
}

/* ---------------- PAINEL PEDAGÓGICO ----------------
   Cada professora entra com o próprio e-mail e senha. A sessão fica só na memória desta aba:
   ao sair do painel ou recarregar a página, é preciso entrar de novo. */
let sessaoProfessor = null, emailProfessor = '';

async function entrarProfessor(email, senha) {
  const res = await Banco.rpc('professor_entrar', { p_email: email, p_senha: senha });
  sessaoProfessor = res.token;
  emailProfessor = res.email;
}

async function carregarPainelOnline() {
  const res = await Banco.rpc('painel_dados', { p_sessao: sessaoProfessor });
  return { alunos: Object.fromEntries(Object.entries(res.alunos).map(([id, a]) => [id, comPadroes(a)])) };
}

function sairProfessor() {
  if (Banco.ativo && sessaoProfessor) Banco.rpc('professor_sair', { p_sessao: sessaoProfessor }).catch(() => {});
  sessaoProfessor = null;
  emailProfessor = '';
}

window.addEventListener('online', () => Sync.enviar());
