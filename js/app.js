/* =========================================================
   APP — Conectados com o Dinheiro
   Os dados ficam salvos no navegador (localStorage) deste aparelho.
   ========================================================= */

const CONQUISTAS = [
  { id: 'primeiro', icone: '👣', nome: 'Primeiro passo', desc: 'Concluiu a primeira fase.' },
  { id: 'perfeito', icone: '💯', nome: 'Gabaritou!', desc: 'Acertou todas as questões de uma fase.' },
  { id: 'sequencia5', icone: '🔥', nome: 'Em chamas', desc: 'Acertou 5 questões seguidas.' },
  { id: 'persistente', icone: '💪', nome: 'Persistente', desc: 'Tentou a mesma fase 3 vezes.' },
  { id: 'meta', icone: '🎯', nome: 'Planejador', desc: 'Definiu uma meta financeira.' },
  { id: 'metaok', icone: '🏆', nome: 'Meta alcançada', desc: 'Completou a meta simulada.' },
  { id: 'antigolpe', icone: '🛡️', nome: 'Detetive antigolpe', desc: 'Concluiu a Fortaleza Antigolpe.' },
  { id: 'graficos', icone: '📊', nome: 'Leitor de gráficos', desc: 'Concluiu o Mirante dos Gráficos.' },
  { id: 'consciente', icone: '🌿', nome: 'Consumidor consciente', desc: 'Concluiu a Aldeia do Consumo Consciente.' },
  { id: 'metade', icone: '🧭', nome: 'Meio do caminho', desc: 'Concluiu 6 fases.' },
  // "trilha" era "concluiu as 11 fases": hoje essas 11 fases são o Mundo 1.
  { id: 'trilha', icone: '🌴', nome: 'Mundo 1 completo', desc: 'Concluiu todas as fases do Vale do Mamanguape.' },
  { id: 'estrelas', icone: '🌟', nome: 'Colecionador', desc: 'Juntou 20 estrelas.' },
  { id: 'explorador', icone: '🔀', nome: 'Explorador', desc: 'Concluiu os dois caminhos de uma bifurcação.' },
  { id: 'fases20', icone: '🗺️', nome: 'Viajante', desc: 'Concluiu 20 fases.' },
  { id: 'mundo2', icone: '🦀', nome: 'Mundo 2 completo', desc: 'Concluiu todas as fases do Manguezal dos Negócios.' },
  { id: 'mundo3', icone: '🏝️', nome: 'Mundo 3 completo', desc: 'Concluiu todas as fases da Ilha do Futuro.' },
  { id: 'estrelas60', icone: '💫', nome: 'Constelação', desc: 'Juntou 60 estrelas.' },
  { id: 'lenda', icone: '👑', nome: 'Lenda do dinheiro', desc: 'Ganhou 3 estrelas em todas as fases da trilha.' },
  { id: 'poupador', icone: '🐖', nome: 'Poupador', desc: 'Juntou 300 moedas guardadas no cofrinho.' },
  { id: 'comprador', icone: '🛍️', nome: 'Primeira compra', desc: 'Comprou um item na lojinha.' },
  { id: 'estiloso', icone: '😎', nome: 'Estiloso', desc: 'Vestiu o bichinho com 4 itens ao mesmo tempo.' },
  { id: 'superheroi', icone: '🦸', nome: 'Super-herói', desc: 'Vestiu um kit de herói completo.' },
];

const PRODUTOS_META = [
  { n: 'Fone sem fio', e: '🎧', preco: 120 }, { n: 'Tênis novo', e: '👟', preco: 250 },
  { n: 'Mochila', e: '🎒', preco: 90 }, { n: 'Bola oficial', e: '⚽', preco: 80 },
  { n: 'Bicicleta', e: '🚲', preco: 600 }, { n: 'Caixa de som', e: '🔊', preco: 150 },
  { n: 'Livro de aventura', e: '📚', preco: 45 }, { n: 'Kit de desenho', e: '🎨', preco: 60 },
];
const ICONES_META = ['🎁', '📱', '🎮', '🎸', '👕', '🧢', '💄', '🛹', '⌚', '🖥️', '🐶', '✈️', '🎂', '🏖️', '🧸', '💻'];
const VALORES_SEMANA = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

const INCENTIVOS = ['Você consegue!', 'Leia com calma.', 'Pense antes de clicar!', 'Faça a conta no papel se precisar.', 'Bora!', 'Atenção aos detalhes!'];
const ELOGIOS = ['Mandou bem!', 'Isso aí!', 'Arrasou!', 'Certinho!', 'Que cérebro!', 'Show!'];
const CONSOLOS = ['Quase! Veja a explicação.', 'Errar faz parte de aprender.', 'Bora entender juntos?', 'Na próxima você acerta!'];

/* ---------------- ARMAZENAMENTO ---------------- */
const CHAVE = 'conectados_dinheiro_v1';
const Store = {
  ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || { alunos: {}, config: { pin: '1234' } }; }
    catch { return { alunos: {}, config: { pin: '1234' } }; }
  },
  salvar(d) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch { alert('Não foi possível salvar os dados neste navegador.'); } },
  sessao(id) {
    try { if (id === undefined) return localStorage.getItem(CHAVE + '_sessao'); id ? localStorage.setItem(CHAVE + '_sessao', id) : localStorage.removeItem(CHAVE + '_sessao'); }
    catch { return null; }
  },
};

let dados = Store.ler();
let aluno = null;
let quiz = null;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normalizar = s => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
// Turma: "8º A", "8A", "8 a", "8° A" e "8º ano A" viram todas "8a" (mesma regra do banco).
const normalizarTurma = s => String(s).toLowerCase().replace(/[ºª°]/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\bano\b/g, '').replace(/[^a-z0-9]/g, '');
const chaveConta = (turma, nome) => normalizarTurma(turma) + '|' + normalizar(nome);

function salvarAluno() { dados.alunos[aluno.id] = aluno; Store.salvar(dados); Sync.agendar(); }

const TELAS_NAV = { 'tela-trilha': 'trilha', 'tela-loja': 'loja', 'tela-ranking': 'ranking', 'tela-perfil': 'perfil' };
function mostrar(tela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.toggle('ativa', t.id === tela));
  const aba = TELAS_NAV[tela], nav = $('#nav-inferior');
  nav.hidden = !aba;
  document.body.classList.toggle('com-nav', !!aba);
  nav.querySelectorAll('[data-ir]').forEach(b => {
    const on = b.dataset.ir === aba;
    b.classList.toggle('ativa', on);
    on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
function abrirModal(html) { $('#modal-conteudo').innerHTML = html; $('#modal').classList.add('aberto'); }
function fecharModal() { $('#modal').classList.remove('aberto'); }

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

const personagemDe = id => PERSONAGENS.find(p => p.id === id);
const personagem = () => personagemDe(aluno.personagem) || PERSONAGENS[0];
const avatar = (classe = '') => avatarSVG(personagem(), classe, aluno.visual);
const totalPontos = a => Object.values(a.fases).reduce((s, f) => s + f.melhorPontos, 0);
const totalEstrelas = a => Object.values(a.fases).reduce((s, f) => s + f.estrelas, 0);
const fasesConcluidas = a => Object.values(a.fases).filter(f => f.estrelas > 0).length;
const faseLiberada = i => liberadaPara(aluno, FASES[i]);
const faseAtual = () => FASES.find(f => liberadaPara(aluno, f) && !faseConcluida(aluno, f.id)) || null;

/* ---------------- LOGIN ---------------- */
// "entrar" só abre conta que já existe; "criar" só cria conta nova.
let modoLogin = 'entrar';
const TEXTOS_LOGIN = {
  entrar: { botao: 'Entrar 🚀', carregando: 'Entrando...', dica: 'Use o mesmo nome, turma e senha de quando criou a conta. Seu progresso volta em qualquer aparelho. Esqueceu a senha? Peça para a professora criar uma nova.' },
  criar: { botao: 'Criar minha conta ✨', carregando: 'Criando...', dica: 'Escreva seu nome completo e escolha uma senha de 4 números que você vai lembrar. Com ela você entra em qualquer aparelho.' },
};

function trocarModoLogin(modo) {
  modoLogin = modo;
  document.querySelectorAll('.abas-login .aba').forEach(b => {
    const on = b.dataset.modo === modo;
    b.classList.toggle('ativa', on); b.setAttribute('aria-selected', on);
  });
  $('#campo-pin2').hidden = modo !== 'criar';
  $('#login-pin2').required = modo === 'criar';
  $('#btn-login').textContent = TEXTOS_LOGIN[modo].botao;
  $('#login-dica').textContent = TEXTOS_LOGIN[modo].dica;
  $('#login-erro').textContent = '';
}

// Mostra a mensagem de erro e, quando ajuda, troca para a outra aba.
function erroLogin(msg, sugerir) {
  $('#login-erro').innerHTML = esc(msg) + (sugerir ? ` <button type="button" class="link-erro" id="erro-trocar">${sugerir === 'criar' ? 'Criar conta' : 'Ir para Entrar'}</button>` : '');
  if (sugerir) $('#erro-trocar').onclick = () => { trocarModoLogin(sugerir); if (sugerir === 'criar') $('#login-pin2').focus(); };
}

function lembrarUltimoLogin(nome, turma) { try { localStorage.setItem(CHAVE + '_ultimo', JSON.stringify({ nome, turma })); } catch { /* sem armazenamento */ } }
function preencherUltimoLogin() {
  try {
    const u = JSON.parse(localStorage.getItem(CHAVE + '_ultimo'));
    if (u?.nome) { $('#login-nome').value = u.nome; $('#login-turma').value = u.turma || ''; }
  } catch { /* sem armazenamento */ }
}

function iniciarLogin() {
  document.querySelectorAll('.abas-login .aba').forEach(b => b.onclick = () => trocarModoLogin(b.dataset.modo));
  trocarModoLogin('entrar');
  preencherUltimoLogin();

  $('#form-login').onsubmit = async e => {
    e.preventDefault();
    const modo = modoLogin;
    const nome = $('#login-nome').value.trim().replace(/\s+/g, ' ');
    const turma = $('#login-turma').value.trim().replace(/\s+/g, ' ');
    const pin = $('#login-pin').value.trim();
    if (nome.length < 2 || !turma || !/^\d{4}$/.test(pin)) { erroLogin('Preencha nome, turma e uma senha de 4 números.'); return; }
    if (modo === 'criar' && $('#login-pin2').value.trim() !== pin) { erroLogin('As duas senhas não são iguais. Digite de novo.'); return; }
    const entrou = () => {
      lembrarUltimoLogin(nome, turma);
      $('#login-pin').value = ''; $('#login-pin2').value = ''; $('#login-erro').textContent = '';
      personagemDe(aluno.personagem) ? abrirTrilha() : abrirPersonagens();
      if (modo === 'criar') toast('🎉 Conta criada! Guarde seu nome, turma e senha para entrar de novo.');
    };

    // Com banco de dados: entra ou cria pelo banco. Sem internet, usa o aparelho.
    if (Banco.ativo) {
      const botao = $('#btn-login');
      botao.disabled = true; botao.textContent = TEXTOS_LOGIN[modo].carregando; $('#login-erro').textContent = '';
      try {
        await entrarOnline(nome, turma, pin, modo);
        entrou();
        return;
      } catch (falha) {
        if (falha.codigo === 'CONTA_NAO_ENCONTRADA') { erroLogin(mensagemErro(falha), 'criar'); return; }
        if (falha.codigo === 'CONTA_EXISTE') { erroLogin(mensagemErro(falha), 'entrar'); return; }
        if (falha.codigo !== 'SEM_CONEXAO' && falha.codigo !== 'SERVIDOR') { erroLogin(mensagemErro(falha)); return; }
        toast('📴 Sem conexão com o banco. Usando o modo do aparelho: seu progresso será enviado depois.');
      } finally { botao.disabled = false; botao.textContent = TEXTOS_LOGIN[modoLogin].botao; }
    }

    // Modo do aparelho. Procura pelo nome atual (o estudante pode ter trocado o nome no perfil).
    const chave = chaveConta(turma, nome);
    const existente = Object.values(dados.alunos).find(a => chaveConta(a.turma, a.nome) === chave);
    if (modo === 'entrar') {
      if (!existente) {
        erroLogin(Banco.ativo
          ? 'Sem internet, só dá para entrar em contas já usadas neste aparelho. Conecte-se e tente de novo.'
          : 'Não encontramos uma conta com esse nome nesta turma neste aparelho. Confira como você escreveu ou crie uma conta.', Banco.ativo ? null : 'criar');
        return;
      }
      if (existente.pin !== pin) { erroLogin('Senha incorreta para este nome e turma.'); return; }
      aluno = existente;
    } else {
      if (existente) { erroLogin('Já existe uma conta com esse nome nesta turma. Se é sua, use "Entrar" com a sua senha.', 'entrar'); return; }
      let id = chave, n = 2;
      while (dados.alunos[id]) id = `${chave}#${n++}`;
      aluno = { id, nome, turma, pin, personagem: null, criadoEm: new Date().toISOString(), fases: {}, tentativas: [], conquistas: [], meta: null, maiorSequencia: 0, perfil: {}, compras: [], visual: {} };
      salvarAluno();
    }
    Store.sessao(aluno.id);
    entrou();
  };
  $('#btn-professor').onclick = () => abrirLoginProfessor();
}

/* ---------------- PERSONAGENS ---------------- */
function abrirPersonagens() {
  $('#lista-personagens').innerHTML = PERSONAGENS.map(p => `
    <button class="card-personagem ${aluno.personagem === p.id ? 'sel' : ''}" data-id="${p.id}">
      <span class="card-avatar">${avatarSVG(p, 'card')}</span>
      <strong>${p.nome}</strong>
      <small class="card-frase">"${p.frase}"</small>
      <small class="card-info">${p.info}</small>
    </button>`).join('');
  $('#lista-personagens').onclick = e => {
    const b = e.target.closest('.card-personagem'); if (!b) return;
    aluno.personagem = b.dataset.id; salvarAluno(); abrirTrilha();
  };
  mostrar('tela-personagem');
}

/* ---------------- TRILHA ---------------- */
function abrirTrilha(opcoes = {}) {
  const p = personagem();
  $('#topo-avatar').innerHTML = avatarSVG(p, 'topo', aluno.visual);
  $('#topo-avatar').style.setProperty('--moldura', molduraDe(aluno));
  $('#topo-nome').textContent = nomePublico(aluno).split(' ')[0];
  $('#topo-moedas').textContent = saldoMoedas(aluno);
  $('#topo-pontos').textContent = totalPontos(aluno);
  $('#topo-estrelas').textContent = totalEstrelas(aluno);
  const of = ofensiva(aluno);
  $('#topo-ofensiva').textContent = of.dias;
  $('#topo-ofensiva-wrap').classList.toggle('acesa', of.hoje);
  $('#topo-ofensiva-wrap').title = of.hoje ? `Ofensiva de ${of.dias} dia(s)! Você já jogou hoje.` : 'Ofensiva: jogue uma fase hoje para manter o fogo aceso.';
  desenharTrilha();
  desenharMetaResumo();
  mostrar('tela-trilha');
  // Comemorações pendentes: mundo concluído ou patente nova (inclui quem chegou lá antes desta versão).
  setTimeout(verificarComemoracoes, 450);
  const banner = opcoes.focoMundo && document.getElementById('mundo-' + opcoes.focoMundo);
  const alvo = banner || document.querySelector('.no.atual');
  if (banner) banner.classList.add('desbloqueando');
  if (alvo) setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
}

/* ---------------- COMEMORAÇÕES (MUNDO NOVO E PATENTE NOVA) ----------------
   Uma de cada vez: primeiro o mundo, depois a patente. Cada uma aparece só uma vez. */
const mundosVistos = () => (Array.isArray(aluno.mundosVistos) ? aluno.mundosVistos : []);
function mundoParaCelebrar() {
  const vistos = mundosVistos();
  const m = [...MUNDOS].reverse().find(x => faseConcluida(aluno, chefeDoMundo(x).id) && !vistos.includes(x.n));
  return m ? m.n : 0;
}
const patenteVista = () => (Number.isInteger(aluno.patenteVista) ? aluno.patenteVista : 0);
const patenteParaCelebrar = () => (patenteDe(aluno) > patenteVista() ? patenteDe(aluno) : 0);

let comemoracaoAberta = false, timerCelebracao = null;
function verificarComemoracoes() {
  if (!aluno || comemoracaoAberta) return;
  const mundo = mundoParaCelebrar();
  if (mundo) { celebrarMundo(mundo); return; }
  const patente = patenteParaCelebrar();
  if (patente) celebrarPatente(patente);
}

const BRILHOS_CEL = [[8, 18, 0], [86, 14, 0.4], [14, 62, 0.8], [90, 56, 0.2], [30, 8, 1.1], [70, 84, 0.6], [6, 86, 1.3], [94, 88, 0.9]]
  .map(([x, y, d]) => `<span class="cel-brilho" style="left:${x}%;top:${y}%;animation-delay:${(1.4 + d).toFixed(1)}s" aria-hidden="true">✦</span>`).join('');

// Monta a tela de comemoração. "palco" é o desenho animado do meio.
function abrirComemoracao({ cor, sub, palco, titulo, nome, texto, botao, aoIr }) {
  comemoracaoAberta = true;
  fecharModal();
  clearTimeout(timerCelebracao);
  const el = $('#celebracao');
  el.style.setProperty('--cor', cor);
  el.innerHTML = `
    <div class="cel-raios" aria-hidden="true"></div>${BRILHOS_CEL}
    <div class="cel-conteudo">
      <p class="cel-sub">${sub}</p>
      <div class="cel-palco" aria-hidden="true">${palco}
        <span class="cel-avatar" style="--moldura:${molduraDe(aluno)}">${avatarSVG(personagem(), 'cel', aluno.visual)}</span>
      </div>
      <h2 class="cel-titulo" id="cel-titulo">${titulo}</h2>
      <p class="cel-nome">${nome}</p>
      <p class="cel-texto">${texto}</p>
      <div class="cel-botoes">
        <button class="btn btn-primario btn-grande" id="cel-ir">${botao}</button>
        <button class="btn btn-texto" id="cel-fechar">Continuar</button>
      </div>
    </div>`;
  el.hidden = false;
  el.classList.remove('aberta');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('aberta')));
  setTimeout(confete, 1400);
  setTimeout(confete, 2300);
  setTimeout(() => $('#cel-ir')?.focus({ preventScroll: true }), 2300);
  $('#cel-ir').onclick = () => { fecharCelebracao(); aoIr(); };
  $('#cel-fechar').onclick = fecharCelebracao;
}

function celebrarMundo(n) {
  const feito = MUNDOS[n - 1], novo = MUNDOS[n];
  aluno.mundosVistos = [...new Set([...mundosVistos(), ...MUNDOS.filter(m => m.n <= n).map(m => m.n)])];
  salvarAluno();
  abrirComemoracao({
    cor: (novo || feito).cor,
    sub: `${feito.icone} Mundo ${feito.n} completo!`,
    palco: `<svg class="cel-cadeado" viewBox="0 0 100 120">
        <path class="cel-arco" d="M28 54 V38 a22 22 0 0 1 44 0 V54" fill="none" stroke="#e5e7eb" stroke-width="11" stroke-linecap="round"/>
        <rect x="14" y="50" width="72" height="62" rx="14" fill="#fbbf24" stroke="#b45309" stroke-width="3"/>
        <rect x="22" y="58" width="10" height="46" rx="5" fill="#fde68a" opacity=".7"/>
        <circle cx="50" cy="76" r="7.5" fill="#78350f"/><rect x="46.5" y="78" width="7" height="17" rx="3.5" fill="#78350f"/>
      </svg>
      <span class="cel-mundo-icone">${novo ? novo.icone : '👑'}</span>`,
    titulo: novo ? 'Novo mundo desbloqueado!' : 'Trilha completa!',
    nome: novo ? `Mundo ${novo.n}: ${esc(novo.nome)}` : 'Você é uma lenda do dinheiro!',
    texto: novo ? `${novo.fases.length} fases novas esperam por você: ${esc(novo.chamada)}` : 'Você concluiu os 3 mundos! Agora tente ganhar 3 estrelas em todas as fases.',
    botao: novo ? `Ir para o Mundo ${novo.n} 🚀` : 'Ver minha trilha 🗺️',
    aoIr: () => abrirTrilha({ focoMundo: novo ? novo.n : feito.n }),
  });
}

function celebrarPatente(n) {
  const antes = patenteVista(), info = infoPatente(aluno), P = PATENTES[n];
  aluno.patenteVista = n;
  salvarAluno();
  abrirComemoracao({
    cor: P.cor,
    sub: '🎖️ Nova patente!',
    palco: `<span class="pat-velha">${escudoPatente(antes)}</span><span class="pat-nova">${escudoPatente(n)}</span>`,
    titulo: 'Você subiu de patente!',
    nome: `${PATENTES[antes].nome} → ${P.nome}`,
    texto: info.prox
      ? `Você já tem ${info.xp} XP. Faltam ${info.falta} XP para a Patente ${info.prox.nome}. Continue jogando!`
      : `Você tem ${info.xp} XP e chegou à patente mais alta do jogo! 💎`,
    botao: 'Ver as patentes 🛡️',
    aoIr: () => { abaRanking = 'patente'; abrirRanking(); },
  });
}

function fecharCelebracao() {
  const el = $('#celebracao');
  if (el.hidden || !comemoracaoAberta) return;
  comemoracaoAberta = false;
  el.classList.remove('aberta');
  timerCelebracao = setTimeout(() => { el.hidden = true; el.innerHTML = ''; }, 300);
  setTimeout(verificarComemoracoes, 450);   // tem outra esperando? (ex.: patente depois do mundo)
}

// Atalhos para cada mundo no alto da trilha.
function desenharMundosNav() {
  $('#mundos-nav').innerHTML = MUNDOS.map(m => {
    const st = statusMundo(aluno, m);
    return `<button class="mundo-chip ${st.bloqueado ? 'bloqueado' : ''} ${st.feitas === m.fases.length ? 'completo' : ''}" data-mundo="${m.n}" style="--cor:${m.cor}">
      <span aria-hidden="true">${st.bloqueado ? '🔒' : m.icone}</span><b>Mundo ${m.n}</b><small>${st.feitas}/${m.fases.length}</small></button>`;
  }).join('');
  $('#mundos-nav').onclick = e => {
    const b = e.target.closest('[data-mundo]');
    if (b) document.getElementById('mundo-' + b.dataset.mundo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
}

function desenharTrilha() {
  desenharMundosNav();
  const mapa = $('#mapa');
  const ESP = 170, CABECALHO = 250, FIM_MUNDO = 95;
  const atual = faseAtual();
  const pos = {};
  let faixas = '', banners = '', extras = '', y = 0;

  MUNDOS.forEach(m => {
    const topo = y, st = statusMundo(aluno, m);
    const linhas = [];
    m.fases.forEach(f => (linhas[f.linha] ||= []).push(f));
    let yl = topo + CABECALHO, ultima = yl, k = 0;
    linhas.filter(Boolean).forEach((fs, idx, arr) => {
      fs.forEach(f => { pos[f.id] = { x: f.lado === 'c' ? 50 + 18 * Math.sin(f.linha * 1.15) : f.lado === 'e' ? 27 : 73, y: yl }; });
      const xDecor = fs.length === 2 ? 50 : pos[fs[0].id].x > 50 ? 12 : 88;
      extras += `<span class="decor" style="left:${xDecor}%;top:${yl - 10}px">${m.decor[k++ % m.decor.length]}</span>`;
      if (fs.length === 2 && idx > 0 && arr[idx - 1].length === 1) extras += `<span class="bifurcacao" style="top:${yl - ESP / 2}px">🔀 escolha</span>`;
      ultima = yl; yl += ESP;
    });
    const fim = ultima + FIM_MUNDO;
    const anterior = MUNDOS[m.n - 2];
    faixas += `<div class="mundo-faixa" style="top:${topo}px;height:${fim - topo}px;--faixa:${m.faixa}"></div>`;
    banners += `<div class="mundo-banner ${st.bloqueado ? 'bloqueado' : ''}" id="mundo-${m.n}" style="top:${topo + 22}px;--cor:${m.cor}">
      <span class="mb-icone" aria-hidden="true">${st.bloqueado ? '🔒' : m.icone}</span>
      <span class="mb-texto"><small>Mundo ${m.n}</small><b>${esc(m.nome)}</b>
        <span class="mb-prog">${st.bloqueado && anterior ? `Conclua o ${esc(chefeDoMundo(anterior).nome)} para entrar` : `${st.feitas}/${m.fases.length} fases · ⭐ ${st.estrelas}/${m.fases.length * 3}`}</span>
        <span class="barra"><i style="width:${st.feitas / m.fases.length * 100}%"></i></span></span>
      ${st.feitas === m.fases.length ? '<span class="mb-ok" aria-label="Mundo completo">✅</span>' : ''}</div>`;
    y = fim;
  });
  const altura = y + 70;
  mapa.style.height = altura + 'px';

  // Caminhos: tracejado onde ainda não passou, dourado onde já passou.
  let base = '', feito = '';
  FASES.forEach(f => f.liga.forEach(id => {
    const a = pos[id], b = pos[f.id], my = (a.y + b.y) / 2;
    const d = `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
    base += `<path d="${d}" class="caminho-base"/>`;
    if (faseConcluida(aluno, id) && liberadaPara(aluno, f)) feito += `<path d="${d}" class="caminho-feito"/>`;
  }));

  let nos = '';
  FASES.forEach((f, i) => {
    const prog = aluno.fases[f.id], p = pos[f.id];
    const liberada = liberadaPara(aluno, f), concluida = faseConcluida(aluno, f.id);
    const estado = !liberada ? 'bloqueada' : f === atual ? 'atual' : concluida ? 'concluida' : 'liberada';
    const estrelas = prog ? '★'.repeat(prog.estrelas) + '☆'.repeat(3 - prog.estrelas) : '☆☆☆';
    nos += `
      <div class="no-wrap ${f.lado !== 'c' ? 'ramo' : ''} ${f.final ? 'chefe' : ''}" style="left:${p.x}%;top:${p.y}px">
        ${estado === 'atual' ? `<span class="avatar-trilha">${avatar('trilha')}</span>` : ''}
        <button class="no ${estado}" data-i="${i}" style="--cor:${f.cor}" aria-label="Fase ${i + 1}: ${esc(f.nome)}${liberada ? '' : ' (bloqueada)'}">
          <span>${liberada ? f.icone : '🔒'}</span>
        </button>
        <div class="no-rotulo"><b>${i + 1}. ${esc(f.nome)}</b><span class="estrelas">${estrelas}</span></div>
      </div>`;
  });

  mapa.innerHTML = `${faixas}
    <svg class="caminho" viewBox="0 0 100 ${altura}" preserveAspectRatio="none">${base}${feito}</svg>
    ${extras}${banners}${nos}
    <div class="chegada" style="top:${altura - 50}px">🏁 Chegada</div>`;

  mapa.onclick = e => {
    const b = e.target.closest('.no'); if (!b) return;
    const i = +b.dataset.i;
    if (!faseLiberada(i)) { toast(motivoBloqueio(aluno, FASES[i])); return; }
    abrirDetalheFase(i);
  };
}

function abrirDetalheFase(i) {
  const f = FASES[i];
  const prog = aluno.fases[f.id];
  const qtd = qtdQuestoes(f);
  const m = MUNDOS[f.mundo - 1];
  const extra = f.final ? `<li>🏆 Desafio do Mundo ${f.mundo}: vale moedas em dobro!</li>`
    : f.lado !== 'c' ? '<li>🔀 Caminho à sua escolha: o outro lado pode ser feito depois</li>' : '';
  const tipos = f.final ? FASES.filter(g => g.mundo === f.mundo && !g.final).reduce((s, g) => s + g.geradores.length, 0) : f.geradores.length;
  abrirModal(`
    <div class="detalhe-fase" style="--cor:${f.cor}">
      <div class="detalhe-icone">${f.icone}</div>
      <p class="detalhe-mundo">${m.icone} Mundo ${m.n} · ${esc(m.nome)}</p>
      <h2>Fase ${i + 1}: ${esc(f.nome)}</h2>
      <p>${esc(f.desc)}</p>
      <ul class="regras">
        <li>📝 ${qtd} questões sorteadas entre ${tipos} tipos diferentes${f.semFacil ? ' (só médias e difíceis)' : ''}</li>
        <li>⭐ Acerte ${qtd - 2} ou mais para avançar</li>
        <li>${ICONE_MOEDA} ${premioPrevisto(f, prog)}</li>
        ${extra}
        <li>🔁 Pode tentar de novo quantas vezes quiser (vale a melhor pontuação)</li>
      </ul>
      ${prog ? `<p class="recorde">Seu recorde: <b>${prog.melhorAcertos}/${qtd}</b> · ${prog.melhorPontos} pts · ${'★'.repeat(prog.estrelas)}${'☆'.repeat(3 - prog.estrelas)}</p>` : ''}
      <button class="btn btn-primario btn-grande" id="btn-comecar">${prog ? 'Jogar de novo' : 'Começar!'}</button>
      <button class="btn btn-texto" onclick="fecharModal()">Voltar</button>
    </div>`);
  $('#btn-comecar').onclick = () => { fecharModal(); iniciarQuiz(i); };
}

/* ---------------- QUIZ ---------------- */
function iniciarQuiz(i) {
  const fase = FASES[i];
  quiz = { i, fase, questoes: gerarQuestoesDaFase(fase), atual: 0, acertos: 0, pontos: 0, sequencia: 0, maiorSeq: 0, respostas: [] };
  $('#quiz-fase').textContent = `${fase.icone} ${fase.nome}`;
  $('#tela-quiz').style.setProperty('--cor', fase.cor);
  mostrar('tela-quiz');
  mostrarQuestao();
}

function mostrarQuestao() {
  const q = quiz.questoes[quiz.atual];
  const total = quiz.questoes.length;
  $('#quiz-barra').style.width = (quiz.atual / total * 100) + '%';
  $('#quiz-contador').textContent = `${quiz.atual + 1}/${total}`;
  $('#quiz-sequencia').textContent = quiz.sequencia >= 2 ? `🔥 ${quiz.sequencia}` : '';
  $('#quiz-personagem').innerHTML = avatar('quiz');
  $('#quiz-fala').textContent = R.pick(INCENTIVOS);
  const nivelNome = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' }[q.nivel];
  $('#quiz-chips').innerHTML = `<span class="chip">${esc(q.tema)}</span><span class="chip nivel-${q.nivel}">${nivelNome} · ${PONTOS_NIVEL[q.nivel]} pts</span>`;
  $('#quiz-texto').innerHTML = esc(q.texto).replace(/\n/g, '<br>');
  $('#quiz-visual').innerHTML = q.visual || '';
  $('#quiz-visual').hidden = !q.visual;
  const letras = ['A', 'B', 'C', 'D'];
  $('#quiz-opcoes').innerHTML = q.opcoes.map((o, k) =>
    `<button class="opcao" data-k="${k}"><span class="letra">${letras[k]}</span><span>${esc(o)}</span></button>`).join('');
  $('#quiz-opcoes').onclick = e => { const b = e.target.closest('.opcao'); if (b && !b.disabled) responder(+b.dataset.k); };
  $('#quiz-feedback').className = 'feedback';
  $('#quiz-feedback').innerHTML = '';
}

function responder(k) {
  const q = quiz.questoes[quiz.atual];
  const acertou = k === q.correta;
  document.querySelectorAll('.opcao').forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.correta) b.classList.add('certa');
    else if (idx === k) b.classList.add('errada');
  });
  const pts = acertou ? PONTOS_NIVEL[q.nivel] : 0;
  if (acertou) { quiz.acertos++; quiz.pontos += pts; quiz.sequencia++; quiz.maiorSeq = Math.max(quiz.maiorSeq, quiz.sequencia); }
  else quiz.sequencia = 0;
  quiz.respostas.push({ tema: q.tema, nivel: q.nivel, acertou, enunciado: q.texto, resposta: q.opcoes[k], correta: q.opcoes[q.correta], visual: q.visual || '' });

  $('#quiz-fala').textContent = acertou ? R.pick(ELOGIOS) : R.pick(CONSOLOS);
  $('#quiz-sequencia').textContent = quiz.sequencia >= 2 ? `🔥 ${quiz.sequencia}` : '';
  const ultima = quiz.atual === quiz.questoes.length - 1;
  const fb = $('#quiz-feedback');
  fb.className = 'feedback aberto ' + (acertou ? 'ok' : 'erro');
  fb.innerHTML = `
    <div class="fb-titulo">${acertou ? `✅ Correto! +${pts} pts` : `❌ Resposta certa: ${esc(q.opcoes[q.correta])}`}</div>
    <p class="fb-explicacao">💡 ${esc(q.explicacao)}</p>
    <button class="btn btn-primario btn-grande" id="btn-continuar">${ultima ? 'Ver resultado' : 'Continuar'}</button>`;
  $('#btn-continuar').onclick = () => {
    if (ultima) finalizarQuiz();
    else { quiz.atual++; mostrarQuestao(); }
  };
  $('#btn-continuar').focus({ preventScroll: true });
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function calcularEstrelas(acertos, total) {
  if (acertos === total) return 3;
  if (acertos >= total - 1) return 2;
  if (acertos >= total - 2) return 1;
  return 0;
}

function finalizarQuiz() {
  const { fase, acertos, pontos, questoes, i } = quiz;
  const total = questoes.length;
  const estrelas = calcularEstrelas(acertos, total);
  const anterior = aluno.fases[fase.id] || { melhorPontos: 0, melhorAcertos: 0, estrelas: 0, tentativas: 0 };
  const recorde = pontos > anterior.melhorPontos;
  aluno.fases[fase.id] = {
    melhorPontos: Math.max(anterior.melhorPontos, pontos),
    melhorAcertos: Math.max(anterior.melhorAcertos, acertos),
    estrelas: Math.max(anterior.estrelas, estrelas),
    tentativas: anterior.tentativas + 1,
  };
  aluno.maiorSequencia = Math.max(aluno.maiorSequencia || 0, quiz.maiorSeq);
  const tentativa = { faseId: fase.id, fase: fase.nome, data: new Date().toISOString(), acertos, total, pontos, estrelas, respostas: quiz.respostas.map(({ visual, ...r }) => r) };
  aluno.tentativas.push(tentativa);
  const extrato = calcularMoedas(aluno);
  const moedas = extrato.detalhes.get(tentativa) || { moedas: 0, partes: [] };

  let msgMeta = '';
  if (estrelas > 0 && aluno.meta && aluno.meta.guardado < aluno.meta.preco) {
    aluno.meta.guardado = Math.min(aluno.meta.preco, aluno.meta.guardado + aluno.meta.porSemana);
    aluno.meta.semanas = (aluno.meta.semanas || 0) + 1;
    msgMeta = `<p class="msg-meta">🐷 +1 semana de economia simulada: +${brl(aluno.meta.porSemana)} no cofrinho da meta!</p>`;
  }

  const novas = verificarConquistas(estrelas, acertos, total, fase, extrato.saldo);
  salvarAluno();

  const proximas = estrelas > 0 ? proximasFases(fase) : [];
  const p = personagem();
  const pat = infoPatente(aluno);
  const mundoNovo = fase.final && estrelas > 0 && !anterior.estrelas;
  const seguinte = MUNDOS[fase.mundo];
  const blocoMoedas = moedas.moedas ? `
    <div class="res-moedas">
      <div class="rm-topo">${ICONE_MOEDA}<b>+${moedas.moedas}</b><span>moedas</span></div>
      <ul>${moedas.partes.map(([t, v]) => `<li><span>${esc(t)}</span><b>+${v}</b></li>`).join('')}</ul>
      <button class="btn btn-texto" id="res-loja">🛍️ Ir para a lojinha · você tem ${extrato.saldo} moedas</button>
    </div>` : '';
  $('#resultado-conteudo').innerHTML = `
    <div class="res-personagem ${estrelas ? 'pula' : ''}">${avatarSVG(p, 'resultado', aluno.visual)}</div>
    <h2>${estrelas === 3 ? 'Perfeito!' : estrelas > 0 ? 'Fase concluída!' : 'Quase lá!'}</h2>
    <div class="res-estrelas">${[1, 2, 3].map(n => `<span class="${n <= estrelas ? 'on' : ''}" style="animation-delay:${n * 0.25}s">★</span>`).join('')}</div>
    <div class="res-numeros">
      <div><b>${acertos}/${total}</b><small>acertos</small></div>
      <div><b>${pontos}</b><small>pontos</small></div>
      <div><b>${quiz.maiorSeq}</b><small>maior sequência</small></div>
    </div>
    <button class="res-liga" id="res-liga">${escudoPatente(pat.n)}<span><b>+${pontos} XP</b> · Patente ${pat.atual.nome}${pat.prox ? ` · faltam ${pat.falta} XP para ${pat.prox.nome}` : ''}</span></button>
    ${recorde && anterior.tentativas > 0 ? '<p class="recorde">🎉 Novo recorde nesta fase!</p>' : ''}
    ${estrelas === 0 ? `<p>Você precisa de ${total - 2} acertos para avançar e ganhar moedas. As questões serão novas na próxima tentativa!</p>` : ''}
    ${mundoNovo ? `<div class="res-mundo">${seguinte ? `🎉 Você abriu o <b>Mundo ${seguinte.n}: ${esc(seguinte.nome)}</b> ${seguinte.icone}` : '🏁 Você completou a trilha inteira! Que orgulho!'}</div>` : ''}
    ${blocoMoedas}
    ${msgMeta}
    ${novas.length ? `<div class="novas-conquistas"><h3>Conquistas desbloqueadas</h3>${novas.map(c => `<div class="conquista on"><span>${c.icone}</span><div><b>${c.nome}</b><small>${c.desc}</small></div></div>`).join('')}</div>` : ''}
    <details class="revisao"><summary>Revisar minhas respostas</summary>
      ${quiz.respostas.map((r, n) => `<div class="rev-item ${r.acertou ? 'ok' : 'erro'}"><b>${n + 1}. ${r.acertou ? '✅' : '❌'}</b> ${esc(r.enunciado).replace(/\n/g, '<br>')}${r.visual ? `<div class="rev-visual">${r.visual}</div>` : ''}<br><small>Sua resposta: ${esc(r.resposta)}${r.acertou ? '' : ` · Certa: ${esc(r.correta)}`}</small></div>`).join('')}
    </details>
    <div class="res-botoes">
      ${proximas.length > 1 ? '<p class="res-escolha">🔀 Escolha seu caminho:</p>' : ''}
      ${proximas.map((f, k) => `<button class="btn ${k ? 'btn-secundario' : 'btn-primario'} btn-grande" data-prox="${f.id}">${proximas.length > 1 ? '' : 'Próxima: '}${f.icone} ${esc(f.nome)}</button>`).join('')}
      <button class="btn ${proximas.length ? 'btn-secundario' : 'btn-primario'} btn-grande" id="res-repetir">Tentar de novo (questões novas)</button>
      <button class="btn btn-texto" id="res-trilha">Voltar à trilha</button>
    </div>`;
  mostrar('tela-resultado');
  if (estrelas > 0) confete();
  setTimeout(verificarComemoracoes, 1100);   // mundo novo e/ou patente nova
  $('#res-repetir').onclick = () => iniciarQuiz(i);
  $('#res-trilha').onclick = () => abrirTrilha();
  $('#res-liga').onclick = () => { abaRanking = 'patente'; abrirRanking(); };
  if ($('#res-loja')) $('#res-loja').onclick = abrirLoja;
  document.querySelectorAll('[data-prox]').forEach(b => b.onclick = () => {
    const k = FASES.findIndex(f => f.id === b.dataset.prox);
    abrirTrilha(); setTimeout(() => abrirDetalheFase(k), 400);
  });
}

// Depois de concluir uma fase: as fases que ela abriu (até 2, numa bifurcação).
// Se não abriu nenhuma, sugere a primeira fase liberada que ainda falta.
function proximasFases(fase) {
  const filhas = FASES.filter(f => f.liga.includes(fase.id) && liberadaPara(aluno, f) && !faseConcluida(aluno, f.id));
  if (filhas.length) return filhas.slice(0, 2);
  const atual = faseAtual();
  return atual ? [atual] : [];
}

function verificarConquistas(estrelas, acertos, total, fase, saldo = 0) {
  const ganhar = [];
  const add = id => { if (!aluno.conquistas.includes(id)) { aluno.conquistas.push(id); ganhar.push(CONQUISTAS.find(c => c.id === id)); } };
  if (estrelas > 0) add('primeiro');
  if (acertos === total) add('perfeito');
  if (aluno.maiorSequencia >= 5) add('sequencia5');
  if (aluno.fases[fase.id].tentativas >= 3) add('persistente');
  if (fase.id === 'f8' && estrelas > 0) add('antigolpe');
  if (fase.id === 'f10' && estrelas > 0) add('graficos');
  if (fase.id === 'f11' && estrelas > 0) add('consciente');
  if (fasesConcluidas(aluno) >= 6) add('metade');
  if (fasesConcluidas(aluno) >= 20) add('fases20');
  if (mundoCompleto(aluno, MUNDOS[0])) add('trilha');
  if (mundoCompleto(aluno, MUNDOS[1])) add('mundo2');
  if (mundoCompleto(aluno, MUNDOS[2])) add('mundo3');
  if (FASES.every(f => (aluno.fases[f.id]?.estrelas || 0) === 3)) add('lenda');
  if (BIFURCACOES.some(par => par.every(id => faseConcluida(aluno, id)))) add('explorador');
  if (totalEstrelas(aluno) >= 20) add('estrelas');
  if (totalEstrelas(aluno) >= 60) add('estrelas60');
  if (saldo >= 300) add('poupador');
  if (aluno.meta && aluno.meta.guardado >= aluno.meta.preco) add('metaok');
  return ganhar;
}

// Conquistas ganhas fora de uma fase (na lojinha, por exemplo).
function darConquista(id) {
  if (aluno.conquistas.includes(id)) return;
  const c = CONQUISTAS.find(x => x.id === id); if (!c) return;
  aluno.conquistas.push(id); salvarAluno();
  toast(`${c.icone} Conquista: ${esc(c.nome)}!`);
}

function confete() {
  const cores = ['#ff9f1c', '#2ec4b6', '#ff006e', '#3a86ff', '#ffd23f', '#06a77d'];
  for (let n = 0; n < 60; n++) {
    const c = document.createElement('i');
    c.className = 'confete';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = R.pick(cores);
    c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

/* ---------------- META FINANCEIRA SIMULADA ---------------- */
function desenharMetaResumo() {
  const el = $('#meta-resumo');
  if (!aluno.meta) {
    el.innerHTML = `<button class="meta-card vazio" id="btn-meta">🎯 <span><b>Crie sua meta financeira</b><small>Escolha um produto e planeje sua economia</small></span></button>`;
  } else {
    const m = aluno.meta, pct = Math.round(m.guardado / m.preco * 100);
    el.innerHTML = `<button class="meta-card" id="btn-meta">
      <span class="meta-emoji">${m.e}</span>
      <span class="meta-info"><b>${esc(m.produto)}</b><small>${brl(m.guardado)} de ${brl(m.preco)} (simulado)</small>
      <span class="barra"><i style="width:${pct}%"></i></span></span>
      <span class="meta-pct">${pct}%</span></button>`;
  }
  $('#btn-meta').onclick = abrirMeta;
}

function abrirMeta() {
  const m = aluno.meta;
  if (m) {
    const falta = m.preco - m.guardado;
    const semanas = Math.ceil(falta / m.porSemana);
    abrirModal(`
      <h2>${m.e} Minha meta: ${esc(m.produto)}</h2>
      <div class="meta-grande"><span class="barra"><i style="width:${Math.round(m.guardado / m.preco * 100)}%"></i></span></div>
      <div class="res-numeros">
        <div><b>${brl(m.guardado)}</b><small>guardado</small></div>
        <div><b>${brl(falta)}</b><small>falta</small></div>
        <div><b>${semanas}</b><small>semanas restantes</small></div>
      </div>
      ${m.tipo ? `<p class="tag-tipo">Você classificou como: <b>${m.tipo === 'necessidade' ? '✅ Necessidade' : '💭 Desejo'}</b></p>` : ''}
      <p>📌 Plano: guardar <b>${brl(m.porSemana)}</b> por semana. Cada fase concluída conta como <b>uma semana</b> de economia.</p>
      <p class="aviso">Valores fictícios, apenas para simular o planejamento. Os pontos do jogo não são dinheiro de verdade.</p>
      <button class="btn btn-secundario" id="btn-trocar-meta">Trocar de meta</button>
      <button class="btn btn-texto" onclick="fecharModal()">Fechar</button>`);
    $('#btn-trocar-meta').onclick = () => { if (confirm('Trocar de meta? O progresso da meta atual será perdido.')) { aluno.meta = null; salvarAluno(); abrirMeta(); desenharMetaResumo(); } };
    return;
  }
  abrirModal(`
    <h2>🎯 O que você deseja comprar?</h2>
    <p>Escolha um produto da lista ou adicione o seu próprio desejo.</p>
    <div class="grade-produtos">
      ${PRODUTOS_META.map((p, k) => `<button type="button" class="produto" data-k="${k}"><span>${p.e}</span><b>${p.n}</b><small>${brl(p.preco)}</small></button>`).join('')}
      <button type="button" class="produto produto-novo" data-k="novo"><span>✏️</span><b>Outro produto</b><small>Eu escolho</small></button>
    </div>
    <div id="meta-personalizada" class="meta-personalizada" hidden>
      <label class="campo">Nome do produto<input id="meta-nome" maxlength="30" placeholder="Ex.: Celular novo" autocomplete="off"></label>
      <label class="campo">Preço (R$)<input id="meta-preco" type="number" inputmode="decimal" min="5" max="10000" step="0.01" placeholder="Ex.: 350"></label>
      <span class="campo-rotulo">Escolha um ícone</span>
      <div class="grade-icones">${ICONES_META.map((e, k) => `<button type="button" class="icone-meta ${k ? '' : 'sel'}" data-e="${e}" aria-label="Ícone ${e}">${e}</button>`).join('')}</div>
      <p class="pergunta-consciente">🤔 Antes de decidir: isso é uma <b>necessidade</b> ou um <b>desejo</b>?</p>
      <div class="segmentado" role="radiogroup" aria-label="Necessidade ou desejo">
        <label><input type="radio" name="meta-tipo" value="necessidade"><span>✅ Necessidade</span></label>
        <label><input type="radio" name="meta-tipo" value="desejo" checked><span>💭 Desejo</span></label>
      </div>
    </div>
    <label class="campo">Quanto você guardaria por semana?
      <select id="meta-semana">${VALORES_SEMANA.map(v => `<option value="${v}" ${v === 10 ? 'selected' : ''}>${brl(v)}</option>`).join('')}</select>
    </label>
    <p id="meta-calculo" class="meta-calculo">Escolha um produto acima.</p>
    <p class="erro" id="meta-erro"></p>
    <p class="aviso">Valores fictícios. Os pontos do jogo não são dinheiro de verdade.</p>
    <button class="btn btn-primario btn-grande" id="btn-salvar-meta" disabled>Criar meta</button>
    <button class="btn btn-texto" onclick="fecharModal()">Cancelar</button>`);
  let escolhido = null;
  let icone = ICONES_META[0];
  const lerProduto = () => {
    if (escolhido === null) return null;
    if (escolhido !== 'novo') return PRODUTOS_META[escolhido];
    const n = $('#meta-nome').value.trim().replace(/\s+/g, ' ');
    const preco = r2(parseFloat(String($('#meta-preco').value).replace(',', '.')));
    return { n, e: icone, preco, personalizado: true, tipo: (document.querySelector('[name=meta-tipo]:checked') || {}).value };
  };
  const validar = p => {
    if (!p) return 'Escolha um produto acima.';
    if (p.personalizado) {
      if (p.n.length < 2) return 'Digite o nome do produto (pelo menos 2 letras).';
      if (!isFinite(p.preco) || p.preco < 5 || p.preco > 10000) return 'Digite um preço entre R$ 5,00 e R$ 10.000,00.';
    }
    return '';
  };
  const atualizar = () => {
    const p = lerProduto(), s = +$('#meta-semana').value;
    const erro = validar(p);
    $('#btn-salvar-meta').disabled = !!erro;
    $('#meta-erro').textContent = p && p.personalizado && ($('#meta-nome').value || $('#meta-preco').value) ? erro : '';
    if (erro) { $('#meta-calculo').textContent = p ? 'Preencha o nome e o preço do seu produto.' : 'Escolha um produto acima.'; return; }
    const semanas = Math.ceil(p.preco / s);
    const meses = (semanas / 4.3).toFixed(1).replace('.', ',');
    $('#meta-calculo').innerHTML = `${p.e} ${brl(p.preco)} ÷ ${brl(s)} por semana = <b>${semanas} semana${semanas > 1 ? 's' : ''}</b> (cerca de ${meses} meses) para alcançar a meta.`;
  };
  document.querySelectorAll('.produto').forEach(b => b.onclick = () => {
    document.querySelectorAll('.produto').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    escolhido = b.dataset.k === 'novo' ? 'novo' : +b.dataset.k;
    $('#meta-personalizada').hidden = escolhido !== 'novo';
    if (escolhido === 'novo') $('#meta-nome').focus();
    atualizar();
  });
  document.querySelectorAll('.icone-meta').forEach(b => b.onclick = () => {
    document.querySelectorAll('.icone-meta').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel'); icone = b.dataset.e; atualizar();
  });
  ['#meta-nome', '#meta-preco'].forEach(id => { $(id).oninput = atualizar; });
  document.querySelectorAll('[name=meta-tipo]').forEach(r => { r.onchange = atualizar; });
  $('#meta-semana').onchange = atualizar;
  $('#btn-salvar-meta').onclick = () => {
    const p = lerProduto();
    if (validar(p)) return;
    aluno.meta = { produto: p.n, e: p.e, preco: p.preco, porSemana: +$('#meta-semana').value, guardado: 0, semanas: 0, personalizado: !!p.personalizado, tipo: p.tipo || null, criadaEm: new Date().toISOString() };
    const novas = [];
    if (!aluno.conquistas.includes('meta')) { aluno.conquistas.push('meta'); novas.push('🎯 Conquista: Planejador!'); }
    salvarAluno(); fecharModal(); desenharMetaResumo();
    novas.forEach(toast);
  };
}

/* ---------------- CONQUISTAS ---------------- */
function abrirConquistas() {
  abrirModal(`
    <h2>🏅 Minhas conquistas</h2>
    <p>${aluno.conquistas.length} de ${CONQUISTAS.length} desbloqueadas</p>
    <div class="lista-conquistas">${CONQUISTAS.map(c => {
      const on = aluno.conquistas.includes(c.id);
      return `<div class="conquista ${on ? 'on' : ''}"><span>${on ? c.icone : '🔒'}</span><div><b>${c.nome}</b><small>${c.desc}</small></div></div>`;
    }).join('')}</div>
    <button class="btn btn-texto" onclick="fecharModal()">Fechar</button>`);
}

/* ---------------- PAINEL DA PROFESSORA ---------------- */
function abrirLoginProfessor() {
  abrirModal(`
    <h2>👩‍🏫 Painel pedagógico</h2>
    <p>Acesso restrito à pesquisadora e à professora regente.</p>
    <form id="form-prof">
      <label class="campo">PIN de acesso<input type="password" id="prof-pin" inputmode="numeric" maxlength="8" autocomplete="off" required></label>
      <p class="erro" id="prof-erro"></p>
      <button class="btn btn-primario btn-grande">Entrar</button>
    </form>
    <button class="btn btn-texto" onclick="fecharModal()">Cancelar</button>`);
  $('#prof-pin').focus();
  $('#form-prof').onsubmit = async e => {
    e.preventDefault();
    const pin = $('#prof-pin').value;
    if (Banco.ativo) {
      const botao = $('#form-prof .btn-primario');
      botao.disabled = true; botao.textContent = 'Carregando...';
      try { painelDados = await carregarPainelOnline(pin); fecharModal(); abrirPainel(); }
      catch (falha) { $('#prof-erro').textContent = mensagemErro(falha); }
      finally { botao.disabled = false; botao.textContent = 'Entrar'; }
      return;
    }
    if (pin === dados.config.pin) { fecharModal(); abrirPainel(); }
    else $('#prof-erro').textContent = 'PIN incorreto.';
  };
}

function resumoAluno(a) {
  const resp = a.tentativas.flatMap(t => t.respostas);
  const acertos = resp.filter(r => r.acertou).length;
  return {
    nome: a.nome, turma: a.turma, personagem: (personagemDe(a.personagem) || {}).nome || '-',
    pontos: totalPontos(a), estrelas: totalEstrelas(a), fases: fasesConcluidas(a), tentativas: a.tentativas.length,
    respondidas: resp.length, acertos, taxa: resp.length ? Math.round(acertos / resp.length * 100) : 0,
    moedas: calcularMoedas(a).saldo, itens: comprasDe(a).length, xp: xpTotal(a), patente: PATENTES[patenteDe(a)].nome,
    conquistas: a.conquistas.length, meta: a.meta ? `${a.meta.produto} - ${brl(a.meta.preco)}${a.meta.tipo ? ' - ' + a.meta.tipo : ''} (${Math.round(a.meta.guardado / a.meta.preco * 100)}%)` : '-',
  };
}

// No modo aparelho, o painel lê o navegador. Com banco, lê o que veio do banco (todos os aparelhos).
let painelDados = null;
function abrirPainel() {
  if (!Banco.ativo) { dados = Store.ler(); painelDados = dados; }
  $('#painel-aviso').textContent = Banco.ativo
    ? '☁️ Dados do banco de dados online: aparecem os estudantes de todos os aparelhos.'
    : 'Os dados ficam salvos apenas neste navegador. Para juntar os resultados de vários aparelhos, exporte o backup em cada um e importe aqui.';
  const turmas = [...new Set(Object.values(painelDados.alunos).map(a => a.turma))].sort();
  $('#painel-turma').innerHTML = `<option value="">Todas as turmas</option>` + turmas.map(t => `<option>${esc(t)}</option>`).join('');
  $('#painel-turma').onchange = renderPainel;
  renderPainel();
  mostrar('tela-professor');
}

function alunosFiltrados() {
  const t = $('#painel-turma').value;
  return Object.values(painelDados.alunos).filter(a => !t || a.turma === t);
}

function renderPainel() {
  const lista = alunosFiltrados();
  const resumos = lista.map(resumoAluno).sort((a, b) => b.pontos - a.pontos);
  const resp = lista.flatMap(a => a.tentativas.flatMap(t => t.respostas));
  const acertos = resp.filter(r => r.acertou).length;

  $('#painel-tiles').innerHTML = `
    <div class="tile"><small>Estudantes</small><b>${lista.length}</b></div>
    <div class="tile"><small>Tentativas de fase</small><b>${lista.reduce((s, a) => s + a.tentativas.length, 0)}</b></div>
    <div class="tile"><small>Questões respondidas</small><b>${resp.length}</b></div>
    <div class="tile"><small>Taxa média de acerto</small><b>${resp.length ? Math.round(acertos / resp.length * 100) : 0}%</b></div>`;

  // Acerto por conteúdo
  const temas = {};
  resp.forEach(r => { temas[r.tema] = temas[r.tema] || { ok: 0, total: 0 }; temas[r.tema].total++; if (r.acertou) temas[r.tema].ok++; });
  const linhasTema = Object.entries(temas).map(([t, v]) => ({ t, ...v, pct: Math.round(v.ok / v.total * 100) })).sort((a, b) => a.pct - b.pct);
  $('#grafico-temas').innerHTML = linhasTema.length ? linhasTema.map(l => `
    <div class="barra-linha" title="${esc(l.t)}: ${l.ok} acertos de ${l.total} (${l.pct}%)">
      <span class="barra-rotulo">${esc(l.t)}</span>
      <span class="barra-trilho"><i style="width:${Math.max(l.pct, 1)}%"></i></span>
      <span class="barra-valor">${l.pct}%</span>
    </div>`).join('') : '<p class="vazio">Ainda não há respostas registradas.</p>';
  $('#tabela-temas').innerHTML = linhasTema.length ? `<table><thead><tr><th>Conteúdo</th><th>Acertos</th><th>Erros</th><th>Total</th><th>% acerto</th></tr></thead><tbody>
    ${linhasTema.map(l => `<tr><td>${esc(l.t)}</td><td>${l.ok}</td><td>${l.total - l.ok}</td><td>${l.total}</td><td>${l.pct}%</td></tr>`).join('')}</tbody></table>` : '';

  // Desempenho por fase
  const porFase = FASES.map(f => {
    const ts = lista.flatMap(a => a.tentativas.filter(t => t.faseId === f.id));
    const concl = lista.filter(a => a.fases[f.id]?.estrelas > 0).length;
    return { f, tentativas: ts.length, concl, media: ts.length ? (ts.reduce((s, t) => s + t.acertos / t.total, 0) / ts.length * 100).toFixed(0) : '-' };
  });
  $('#tabela-fases').innerHTML = `<table><thead><tr><th>Fase</th><th>Concluíram</th><th>Tentativas</th><th>Acerto médio</th></tr></thead><tbody>
    ${porFase.map(p => `<tr><td>${p.f.icone} ${esc(p.f.nome)}</td><td>${p.concl}/${lista.length}</td><td>${p.tentativas}</td><td>${p.media}${p.media === '-' ? '' : '%'}</td></tr>`).join('')}</tbody></table>`;

  // Alunos
  $('#tabela-alunos').innerHTML = resumos.length ? `<table><thead><tr><th>#</th><th>Estudante</th><th>Turma</th><th>Pontos</th><th>★</th><th>Fases</th><th>Tentativas</th><th>% acerto</th><th>XP</th><th>Patente</th><th>Moedas</th><th>Meta</th></tr></thead><tbody>
    ${resumos.map((r, n) => `<tr class="clicavel" data-id="${esc(lista.find(a => a.nome === r.nome && a.turma === r.turma).id)}"><td>${n + 1}</td><td>${esc(r.nome)}</td><td>${esc(r.turma)}</td><td>${r.pontos}</td><td>${r.estrelas}</td><td>${r.fases}/${FASES.length}</td><td>${r.tentativas}</td><td>${r.taxa}%</td><td>${r.xp}</td><td>${r.patente}</td><td>${r.moedas}</td><td>${esc(r.meta)}</td></tr>`).join('')}
    </tbody></table>` : `<p class="vazio">Nenhum estudante cadastrado ${Banco.ativo ? 'no banco' : 'neste aparelho'} ainda.</p>`;
  $('#tabela-alunos').onclick = e => { const tr = e.target.closest('tr.clicavel'); if (tr) abrirHistorico(tr.dataset.id); };
}

function abrirHistorico(id) {
  const a = painelDados.alunos[id];
  abrirModal(`
    <h2>📈 Histórico de ${esc(a.nome)}</h2>
    <p>Turma ${esc(a.turma)} · ${totalPontos(a)} pontos · maior sequência: ${a.maiorSequencia || 0}</p>
    <div class="tabela-rolagem">${a.tentativas.length ? `<table><thead><tr><th>Data</th><th>Fase</th><th>Acertos</th><th>Pontos</th><th>★</th></tr></thead><tbody>
      ${a.tentativas.slice().reverse().map(t => `<tr><td>${new Date(t.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td><td>${esc(t.fase)}</td><td>${t.acertos}/${t.total}</td><td>${t.pontos}</td><td>${t.estrelas}</td></tr>`).join('')}
      </tbody></table>` : '<p class="vazio">Nenhuma tentativa ainda.</p>'}</div>
    <button class="btn btn-secundario btn-grande" id="btn-nova-senha">🔑 Criar senha nova para este estudante</button>
    <button class="btn btn-perigo btn-grande" id="btn-apagar-aluno">🗑️ Apagar esta conta</button>
    <button class="btn btn-texto" onclick="fecharModal()">Fechar</button>`);
  $('#btn-apagar-aluno').onclick = async () => {
    if (!confirm(`Apagar a conta de ${a.nome} (turma ${a.turma}) e todo o progresso? Esta ação não pode ser desfeita.`)) return;
    if (Banco.ativo) {
      try { await Banco.rpc('professor_apagar_aluno', { p_pin: pinProfessor, p_aluno: id }); }
      catch (falha) { alert(mensagemErro(falha)); return; }
    }
    delete painelDados.alunos[id];
    if (dados.alunos[id]) { delete dados.alunos[id]; Store.salvar(dados); }
    fecharModal(); abrirPainel(); toast(`🗑️ Conta de ${esc(a.nome)} apagada.`);
  };
  $('#btn-nova-senha').onclick = async () => {
    const nova = prompt(`Nova senha de ${a.nome} (4 números):`);
    if (nova === null) return;
    if (!/^\d{4}$/.test(nova.trim())) { alert('A senha precisa ter 4 números.'); return; }
    if (Banco.ativo) {
      try { await Banco.rpc('professor_redefinir_senha', { p_pin: pinProfessor, p_aluno: id, p_nova: nova.trim() }); }
      catch (falha) { alert(mensagemErro(falha)); return; }
    } else {
      a.pin = nova.trim(); Store.salvar(dados);
    }
    toast(`🔑 Senha nova de ${esc(a.nome)}: ${nova.trim()}. Avise o estudante.`);
  };
}

/* ---------------- EXPORTAÇÃO / IMPORTAÇÃO ---------------- */
function baixar(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const csvCel = v => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
const csv = linhas => '﻿' + linhas.map(l => l.map(csvCel).join(';')).join('\r\n');
const hoje = () => new Date().toISOString().slice(0, 10);

function exportarResumo() {
  const linhas = [['Estudante', 'Turma', 'Personagem', 'Pontos', 'Estrelas', 'Fases concluídas', 'Tentativas', 'Questões respondidas', 'Acertos', '% acerto', 'Conquistas', 'XP total', 'Patente', 'Moedas', 'Itens comprados', 'Meta']];
  alunosFiltrados().map(resumoAluno).forEach(r => linhas.push([r.nome, r.turma, r.personagem, r.pontos, r.estrelas, r.fases, r.tentativas, r.respondidas, r.acertos, r.taxa, r.conquistas, r.xp, r.patente, r.moedas, r.itens, r.meta]));
  baixar(`resumo-estudantes-${hoje()}.csv`, csv(linhas), 'text/csv;charset=utf-8');
}

function exportarRespostas() {
  const linhas = [['Estudante', 'Turma', 'Data', 'Fase', 'Questão', 'Conteúdo', 'Nível', 'Resposta dada', 'Resposta correta', 'Acertou']];
  alunosFiltrados().forEach(a => a.tentativas.forEach(t => t.respostas.forEach((r, n) =>
    linhas.push([a.nome, a.turma, new Date(t.data).toLocaleString('pt-BR'), t.fase, n + 1, r.tema, r.nivel, r.resposta, r.correta, r.acertou ? 'Sim' : 'Não']))));
  baixar(`respostas-detalhadas-${hoje()}.csv`, csv(linhas), 'text/csv;charset=utf-8');
}

function exportarBackup() {
  const copia = { alunos: JSON.parse(JSON.stringify(painelDados.alunos)) };
  baixar(`backup-conectados-${hoje()}.json`, JSON.stringify(copia, null, 1), 'application/json');
}

function importarBackup(arquivo) {
  const leitor = new FileReader();
  leitor.onload = async () => {
    let novo;
    try { novo = JSON.parse(leitor.result); if (!novo.alunos || typeof novo.alunos !== 'object') throw new Error(); }
    catch { alert('Arquivo inválido. Use um backup exportado por esta plataforma.'); return; }
    if (Banco.ativo) {
      try {
        const r = await Banco.rpc('professor_importar', { p_pin: pinProfessor, p_alunos: novo.alunos });
        painelDados = await carregarPainelOnline(pinProfessor);
        toast(`✅ Enviado ao banco: ${r.adicionados} novos, ${r.mesclados} mesclados.`);
        abrirPainel();
      } catch (falha) { alert(mensagemErro(falha)); }
      return;
    }
    try {
      let adicionados = 0, mesclados = 0;
      Object.values(novo.alunos).forEach(a => {
        const atual = dados.alunos[a.id];
        if (!atual) { dados.alunos[a.id] = a; adicionados++; return; }
        mesclados++;
        const chaves = new Set(atual.tentativas.map(t => t.faseId + t.data));
        a.tentativas.forEach(t => { if (!chaves.has(t.faseId + t.data)) atual.tentativas.push(t); });
        atual.tentativas.sort((x, y) => x.data.localeCompare(y.data));
        atual.conquistas = [...new Set([...atual.conquistas, ...a.conquistas])];
        Object.entries(a.fases).forEach(([fid, f]) => {
          const g = atual.fases[fid];
          atual.fases[fid] = g ? { melhorPontos: Math.max(g.melhorPontos, f.melhorPontos), melhorAcertos: Math.max(g.melhorAcertos, f.melhorAcertos), estrelas: Math.max(g.estrelas, f.estrelas), tentativas: Math.max(g.tentativas, f.tentativas) } : f;
        });
        atual.maiorSequencia = Math.max(atual.maiorSequencia || 0, a.maiorSequencia || 0);
        // Itens da lojinha: junta os dois lados sem repetir o mesmo item.
        const itens = new Set((atual.compras || []).map(c => c.item));
        (Array.isArray(a.compras) ? a.compras : []).forEach(c => { if (c?.item && !itens.has(c.item)) { (atual.compras ||= []).push(c); itens.add(c.item); } });
      });
      Store.salvar(dados);
      toast(`✅ Importado: ${adicionados} novos, ${mesclados} mesclados.`);
      abrirPainel();
    } catch { alert('Arquivo inválido. Use um backup exportado por esta plataforma.'); }
  };
  leitor.readAsText(arquivo);
}

function iniciarPainel() {
  $('#btn-exp-resumo').onclick = exportarResumo;
  $('#btn-exp-respostas').onclick = exportarRespostas;
  $('#btn-exp-backup').onclick = exportarBackup;
  $('#input-importar').onchange = e => { if (e.target.files[0]) importarBackup(e.target.files[0]); e.target.value = ''; };
  $('#btn-imprimir').onclick = () => window.print();
  $('#btn-pin').onclick = () => {
    const novo = prompt('Novo PIN do painel (4 a 8 números):');
    if (novo === null) return;
    if (!/^\d{4,8}$/.test(novo)) { alert('O PIN deve ter de 4 a 8 números.'); return; }
    if (Banco.ativo) {
      Banco.rpc('professor_alterar_pin', { p_pin: pinProfessor, p_novo: novo })
        .then(() => { pinProfessor = novo; toast('🔐 PIN alterado no banco.'); })
        .catch(falha => alert(mensagemErro(falha)));
      return;
    }
    dados.config.pin = novo; Store.salvar(dados); toast('🔐 PIN alterado.');
  };
  $('#btn-apagar').onclick = async () => {
    if (Banco.ativo) {
      if (!confirm('Apagar TODOS os dados dos estudantes do BANCO DE DADOS? Isso apaga o progresso de todos os aparelhos. Faça um backup antes. Esta ação não pode ser desfeita.')) return;
      try {
        await Banco.rpc('professor_apagar_tudo', { p_pin: pinProfessor });
        painelDados = { alunos: {} };
        dados.alunos = {}; Store.salvar(dados); Store.sessao(null);
        renderPainel(); toast('Dados apagados do banco.');
      } catch (falha) { alert(mensagemErro(falha)); }
      return;
    }
    if (!confirm('Apagar TODOS os dados dos estudantes deste aparelho? Faça um backup antes. Esta ação não pode ser desfeita.')) return;
    dados.alunos = {}; Store.salvar(dados); Store.sessao(null); renderPainel(); toast('Dados apagados.');
  };
  $('#btn-sair-painel').onclick = () => {
    pinProfessor = null;
    painelDados = null;
    mostrar('tela-login');
  };
}

/* ---------------- INÍCIO ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  iniciarLogin();
  iniciarPainel();
  iniciarRanking();
  iniciarLoja();
  $('#btn-trocar-personagem').onclick = abrirPerfil;
  $('#topo-moedas-btn').onclick = abrirLoja;
  $('#nav-inferior').onclick = e => {
    const b = e.target.closest('[data-ir]'); if (!b || !aluno) return;
    ({ trilha: abrirTrilha, loja: abrirLoja, ranking: abrirRanking, perfil: abrirPerfil })[b.dataset.ir]();
  };
  $('#quiz-sair').onclick = () => { if (confirm('Sair da fase? O progresso desta tentativa será perdido.')) abrirTrilha(); };
  $('#modal').onclick = e => { if (e.target.id === 'modal') fecharModal(); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { fecharModal(); fecharCelebracao(); }
    if ($('#tela-quiz').classList.contains('ativa') && !$('#quiz-feedback').classList.contains('aberto')) {
      const k = ['1', '2', '3', '4'].indexOf(e.key);
      if (k >= 0) responder(k);
    }
  });

  const sessao = Store.sessao();
  if (sessao && dados.alunos[sessao]) {
    aluno = dados.alunos[sessao];
    personagemDe(aluno.personagem) ? abrirTrilha() : abrirPersonagens();
    if (Banco.ativo) {
      if (!Sync.token) Sync.pendente = true;   // sessão feita sem internet: entra no banco agora
      Sync.enviar().then(() => atualizarRanking());
    }
  } else mostrar('tela-login');
  $('#status-banco').textContent = Banco.ativo ? '☁️ Progresso salvo online' : '📱 Progresso salvo só neste aparelho';
  $('#login-personagens').innerHTML = PERSONAGENS.map(p => avatarSVG(p, 'login')).join('');
});
