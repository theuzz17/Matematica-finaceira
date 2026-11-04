/* =========================================================
   RANKING — XP semanal, ofensiva e ligas (no estilo Duolingo)
   Tudo é calculado a partir das tentativas salvas. Assim o
   resultado é o mesmo em qualquer aparelho que tenha os dados,
   inclusive depois de a professora importar backups.
   ========================================================= */

const LIGAS = [
  { nome: 'Bronze', cor: '#b8692e', cor2: '#f0b27a' },
  { nome: 'Prata', cor: '#7b8aa0', cor2: '#dde3ea' },
  { nome: 'Ouro', cor: '#d18e00', cor2: '#fde68a' },
  { nome: 'Safira', cor: '#1d5fd1', cor2: '#93c0ff' },
  { nome: 'Rubi', cor: '#c81e4a', cor2: '#ff9bb3' },
  { nome: 'Esmeralda', cor: '#0d8f50', cor2: '#86efb8' },
  { nome: 'Ametista', cor: '#7c3aed', cor2: '#d4bcff' },
  { nome: 'Pérola', cor: '#b38f8a', cor2: '#fff4ef' },
  { nome: 'Obsidiana', cor: '#27272a', cor2: '#8a8a94' },
  { nome: 'Diamante', cor: '#0891b2', cor2: '#b9f6ff' },
];
const XP_MIN_PROMOCAO = 50;
const DIAS_CURTOS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CORES_MOLDURA = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0f172a'];

/* ---------------- DATAS (sempre no horário do aparelho) ---------------- */
const pad2 = n => String(n).padStart(2, '0');
const chaveDia = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function inicioSemana(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function somarDias(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const chaveSemana = d => chaveDia(inicioSemana(d));

/* ---------------- XP, OFENSIVA E NÍVEL ---------------- */
// XP = soma dos pontos de TODAS as tentativas (repetir fase também vale, como no Duolingo).
const xpTotal = a => a.tentativas.reduce((s, t) => s + (t.pontos || 0), 0);

function xpPorSemana(a) {
  const m = {};
  a.tentativas.forEach(t => { const k = chaveSemana(new Date(t.data)); m[k] = (m[k] || 0) + (t.pontos || 0); });
  return m;
}
const xpDaSemana = (a, semana = chaveSemana(new Date())) => xpPorSemana(a)[semana] || 0;

function xpPorDia(a, inicio) {
  const dias = DIAS_CURTOS.map((_, i) => chaveDia(somarDias(inicio, i)));
  const v = dias.map(() => 0);
  a.tentativas.forEach(t => { const k = dias.indexOf(chaveDia(new Date(t.data))); if (k >= 0) v[k] += t.pontos || 0; });
  return v;
}

// Ofensiva = dias seguidos com pelo menos uma fase jogada. Vale até o fim de hoje.
function ofensiva(a) {
  const dias = new Set(a.tentativas.map(t => chaveDia(new Date(t.data))));
  const hoje = dias.has(chaveDia(new Date()));
  let d = hoje ? new Date() : somarDias(new Date(), -1), n = 0;
  while (dias.has(chaveDia(d))) { n++; d = somarDias(d, -1); }
  let recorde = 0, atual = 0, anterior = null;
  [...dias].sort().forEach(k => {
    atual = anterior && chaveDia(somarDias(new Date(anterior + 'T12:00'), 1)) === k ? atual + 1 : 1;
    recorde = Math.max(recorde, atual); anterior = k;
  });
  return { dias: n, hoje, recorde };
}

// O nível cresce cada vez mais devagar: nível 2 com 60 XP, 3 com 240, 4 com 540...
function nivelDe(xp) {
  const n = Math.floor(Math.sqrt(xp / 60)) + 1;
  const base = 60 * (n - 1) ** 2, prox = 60 * n ** 2;
  return { n, pct: (xp - base) / (prox - base) * 100, falta: prox - xp };
}

/* ---------------- IDENTIDADE PÚBLICA ---------------- */
function nomePublico(a) {
  const apelido = (a.perfil?.apelido || '').trim();
  if (apelido) return apelido;
  const partes = a.nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : partes[0];
}
const molduraDe = a => CORES_MOLDURA.includes(a.perfil?.moldura) ? a.perfil.moldura : CORES_MOLDURA[0];
function avatarAluno(a, classe = '') {
  const p = personagemDe(a.personagem) || PERSONAGENS[0];
  return `<span class="av-moldura" style="--moldura:${molduraDe(a)}">${avatarSVG(p, classe)}</span>`;
}

/* ---------------- LIGAS ---------------- */
const ordenarXP = (x, y) => y.xp - x.xp || x.a.nome.localeCompare(y.a.nome, 'pt-BR');

// Quantos sobem e quantos descem, conforme o tamanho do grupo.
function regrasZona(n) {
  return { sobe: Math.max(1, Math.min(5, Math.round(n * 0.3))), desce: n >= 5 ? Math.min(5, Math.floor(n * 0.2)) : 0 };
}

// Diz se a posição sobe (1), desce (-1) ou fica (0), com as mesmas regras do fechamento da semana.
function destinoNaLiga(nivel, pos, xp, n) {
  const z = regrasZona(n);
  if (pos < z.sobe && xp >= XP_MIN_PROMOCAO && nivel < LIGAS.length - 1) return 1;
  if (nivel > 0 && (xp === 0 || pos >= n - z.desce)) return -1;
  return 0;
}

function inicioDoAluno(a) {
  const datas = [Date.parse(a.criadoEm), ...a.tentativas.map(t => Date.parse(t.data))].filter(Number.isFinite);
  return new Date(datas.length ? Math.min(...datas) : Date.now());
}

// Recalcula, semana por semana, em que liga cada estudante está.
let cacheLigas = null;
function calcularLigas() {
  const alunos = alunosRanking();
  const atual = chaveSemana(new Date());
  const assinatura = `${atual}|${rankingVersao}|${alunos.length}|${alunos.reduce((s, a) => s + a.tentativas.length, 0)}`;
  if (cacheLigas?.assinatura === assinatura) return cacheLigas;

  const liga = {}, resultado = {}, xps = {}, inicios = {};
  alunos.forEach(a => { liga[a.id] = 0; xps[a.id] = xpPorSemana(a); inicios[a.id] = inicioDoAluno(a); });
  if (alunos.length) {
    let w = inicioSemana(new Date(Math.min(...alunos.map(a => +inicios[a.id]))));
    while (chaveDia(w) < atual) {
      const k = chaveDia(w), fim = somarDias(w, 7), grupos = {};
      alunos.filter(a => inicios[a.id] < fim).forEach(a => (grupos[liga[a.id]] ||= []).push(a));
      Object.entries(grupos).forEach(([nv, lista]) => {
        const nivel = +nv;
        const ord = lista.map(a => ({ a, xp: xps[a.id][k] || 0 })).sort(ordenarXP);
        ord.forEach(({ a, xp }, pos) => {
          const para = nivel + destinoNaLiga(nivel, pos, xp, ord.length);
          liga[a.id] = para;
          resultado[a.id] = { semana: k, posicao: pos + 1, de: nivel, para, xp };
        });
      });
      w = fim;
    }
  }
  return (cacheLigas = { assinatura, liga, resultado });
}

const ligaDe = a => calcularLigas().liga[a.id] ?? 0;

function grupoLiga(nivel) {
  const { liga } = calcularLigas();
  const semana = chaveSemana(new Date());
  return alunosRanking()
    .filter(a => (liga[a.id] ?? 0) === nivel)
    .map(a => ({ a, xp: xpDaSemana(a, semana) }))
    .sort(ordenarXP);
}
const posicaoNaLiga = a => grupoLiga(ligaDe(a)).findIndex(g => g.a.id === a.id) + 1;

function tempoRestante() {
  const ms = somarDias(inicioSemana(new Date()), 7) - Date.now();
  const h = Math.ceil(ms / 36e5);
  return h <= 24 ? `Termina em ${h} h` : `Termina em ${Math.ceil(ms / 864e5)} dias`;
}

function escudoLiga(nivel, ligado = true) {
  const l = LIGAS[nivel], id = `lg${nivel}${ligado ? 'a' : 'b'}`;
  const c1 = ligado ? l.cor2 : '#e2e8f0', c2 = ligado ? l.cor : '#a3b1c2';
  const miolo = ligado
    ? '<path d="M50 34 l6.5 13.2 14.5 2.1 -10.5 10.2 2.5 14.5 -13 -6.8 -13 6.8 2.5 -14.5 -10.5 -10.2 14.5 -2.1z" fill="#fff" opacity=".92"/>'
    : '<path d="M40 54 V46 a10 10 0 0 1 20 0 V54" fill="none" stroke="#fff" stroke-width="5"/><rect x="34" y="53" width="32" height="22" rx="5" fill="#fff"/>';
  return `<svg class="escudo" viewBox="0 0 100 110" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <path d="M50 4 L92 20 V54 C92 80 72 98 50 106 C28 98 8 80 8 54 V20 Z" fill="url(#${id})" stroke="rgba(0,0,0,.14)" stroke-width="3"/>
    <path d="M50 14 L82 26 V54 C82 74 67 88 50 95 C33 88 18 74 18 54 V26 Z" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3"/>
    ${miolo}</svg>`;
}

/* ---------------- TELA DO RANKING ---------------- */
let abaRanking = 'liga';

function abrirRanking() {
  renderRanking();
  mostrar('tela-ranking');
  centralizarFaixaLigas();
  // Mostra o que já tem e busca a versão nova no banco.
  atualizarRanking().then(mudou => {
    if (mudou && $('#tela-ranking').classList.contains('ativa')) { renderRanking(); centralizarFaixaLigas(); }
  });
}

function renderRanking() {
  document.querySelectorAll('#tela-ranking .aba').forEach(b => {
    const on = b.dataset.aba === abaRanking;
    b.classList.toggle('ativa', on); b.setAttribute('aria-selected', on);
  });
  $('#rk-xp').textContent = xpDaSemana(aluno);
  const el = $('#ranking-conteudo');
  el.innerHTML = abaRanking === 'liga' ? htmlLiga() : abaRanking === 'turma' ? htmlTurma() : htmlGeral();
  el.onclick = e => { const b = e.target.closest('[data-aluno]'); if (b) abrirMiniPerfil(b.dataset.aluno); };
}

function centralizarFaixaLigas() {
  const f = $('#faixa-ligas'), at = f?.querySelector('.atual');
  if (at) f.scrollLeft = at.offsetLeft - f.clientWidth / 2 + at.clientWidth / 2;
}

function linhaRanking(a, pos, xp, zona = '') {
  const eu = a.id === aluno.id;
  return `<button class="rk-linha ${eu ? 'eu' : ''} ${zona}" data-aluno="${esc(a.id)}" style="animation-delay:${Math.min(pos, 12) * 35}ms">
    <span class="rk-pos">${['🥇', '🥈', '🥉'][pos - 1] || pos}</span>
    <span class="rk-avatar">${avatarAluno(a, 'rk')}</span>
    <span class="rk-nome"><b>${esc(nomePublico(a))}${eu ? ' <small class="voce">você</small>' : ''}</b><small>Turma ${esc(a.turma)}</small></span>
    <span class="rk-xp">${xp} XP</span></button>`;
}

function podio(lista) {
  return `<div class="podio">${lista.slice(0, 3).map((g, i) => `
    <button class="podio-lugar p${i + 1} ${g.a.id === aluno.id ? 'eu' : ''}" data-aluno="${esc(g.a.id)}">
      <span class="podio-avatar">${avatarAluno(g.a, 'podio')}${i === 0 ? '<span class="coroa">👑</span>' : ''}</span>
      <b>${esc(nomePublico(g.a))}</b><small>${g.xp} XP</small>
      <span class="podio-bloco">${i + 1}</span>
    </button>`).join('')}</div>`;
}

const avisoSozinho = () => Banco.ativo
  ? '<p class="aviso rk-aviso">👋 Por enquanto só você está no ranking. Chame os colegas para jogar!</p>'
  : '<p class="aviso rk-aviso">👋 Por enquanto só você aparece aqui. O ranking mostra quem joga neste aparelho. A professora pode juntar os dados de vários aparelhos pelo painel pedagógico.</p>';

function htmlLiga() {
  const nivel = ligaDe(aluno), L = LIGAS[nivel], grupo = grupoLiga(nivel), z = regrasZona(grupo.length);
  const topo = nivel === LIGAS.length - 1
    ? 'Você chegou à liga mais alta! Continue jogando para não cair.'
    : `${z.sobe === 1 ? 'O 1º lugar sobe' : `Os ${z.sobe} primeiros sobem`} para a Liga ${LIGAS[nivel + 1].nome} (mínimo de ${XP_MIN_PROMOCAO} XP).`;
  let linhas = '';
  grupo.forEach((g, i) => {
    if (i === z.sobe && nivel < LIGAS.length - 1) linhas += '<div class="rk-divisor sobe">⬆ Zona de promoção</div>';
    if (z.desce && nivel > 0 && i === grupo.length - z.desce) linhas += '<div class="rk-divisor desce">⬇ Zona de rebaixamento</div>';
    const d = destinoNaLiga(nivel, i, g.xp, grupo.length);
    linhas += linhaRanking(g.a, i + 1, g.xp, d > 0 ? 'z-sobe' : d < 0 ? 'z-desce' : '');
  });
  return `
    <div class="faixa-ligas" id="faixa-ligas">${LIGAS.map((l, i) => `<div class="escudo-item ${i === nivel ? 'atual' : ''}" title="Liga ${l.nome}">${escudoLiga(i, i <= nivel)}</div>`).join('')}</div>
    <div class="liga-titulo"><h2>Liga ${L.nome}</h2><p>${topo}</p><span class="liga-tempo">⏳ ${tempoRestante()}</span></div>
    <div class="rk-lista">${linhas}</div>
    ${grupo.length >= 2 ? '' : alunosRanking().length < 2 ? avisoSozinho() : `<p class="aviso rk-aviso">🚀 Você é a única pessoa na Liga ${L.nome} por enquanto. Os colegas que subirem de liga vão aparecer aqui. Veja todo mundo nas abas Turma e Geral.</p>`}
    <details class="rk-regras"><summary>Como funcionam as ligas?</summary><ul>
      <li>Cada acerto vale XP: 10 no fácil, 15 no médio e 20 no difícil. Repetir uma fase também soma XP.</li>
      <li>A semana vai de segunda a domingo. À meia-noite de domingo a liga fecha.</li>
      <li>Os primeiros colocados com pelo menos ${XP_MIN_PROMOCAO} XP sobem de liga.</li>
      <li>Quem termina na zona de rebaixamento, ou não joga na semana, desce uma liga.</li>
      <li>São ${LIGAS.length} ligas: ${LIGAS.map(l => l.nome).join(', ')}.</li>
    </ul></details>`;
}

function htmlTurma() {
  const semana = chaveSemana(new Date()), minha = normalizar(aluno.turma);
  const lista = alunosRanking().filter(a => normalizar(a.turma) === minha)
    .map(a => ({ a, xp: xpDaSemana(a, semana) })).sort(ordenarXP);
  return `<div class="rk-cabecalho"><h2>Turma ${esc(aluno.turma)}</h2><p>XP ganho nesta semana · ⏳ ${tempoRestante()}</p></div>
    ${podio(lista)}<div class="rk-lista">${lista.slice(3).map((g, i) => linhaRanking(g.a, i + 4, g.xp)).join('')}</div>
    ${lista.length < 2 ? avisoSozinho() : ''}`;
}

function htmlGeral() {
  const lista = alunosRanking().map(a => ({ a, xp: xpTotal(a) })).sort(ordenarXP);
  return `<div class="rk-cabecalho"><h2>Todos os tempos</h2><p>XP total de todas as turmas</p></div>
    ${podio(lista)}<div class="rk-lista">${lista.slice(3).map((g, i) => linhaRanking(g.a, i + 4, g.xp)).join('')}</div>
    ${lista.length < 2 ? avisoSozinho() : ''}`;
}

function abrirMiniPerfil(id) {
  const a = alunosRanking().find(x => x.id === id); if (!a) return;
  const nivel = ligaDe(a), of = ofensiva(a), eu = id === aluno.id;
  abrirModal(`<div class="mini-perfil">
    <div class="mini-avatar">${avatarAluno(a, 'mini')}</div>
    <h2>${esc(nomePublico(a))}</h2>
    <p class="perfil-sub">Turma ${esc(a.turma)} · Nível ${nivelDe(xpTotal(a)).n}</p>
    <div class="mini-liga">${escudoLiga(nivel)}<span>Liga ${LIGAS[nivel].nome}</span></div>
    <div class="grade-stats mini">
      ${tileStat('🔥', of.dias, of.dias === 1 ? 'dia de ofensiva' : 'dias de ofensiva', of.hoje ? 'fogo' : 'apagado')}
      ${tileStat('⚡', xpTotal(a), 'XP total')}
      ${tileStat('🗺️', fasesConcluidas(a), `de ${FASES.length} fases`)}
      ${tileStat('🏅', a.conquistas.length, 'conquistas')}
    </div>
    ${eu ? '<button class="btn btn-primario btn-grande" id="mini-ver-perfil">Ver meu perfil</button>' : ''}
    <button class="btn btn-texto" onclick="fecharModal()">Fechar</button></div>`);
  if (eu) $('#mini-ver-perfil').onclick = () => { fecharModal(); abrirPerfil(); };
  animarNumeros($('#modal-conteudo'));
}

// Ao abrir a trilha, avisa uma vez como foi a liga da semana passada.
function verificarResultadoLiga() {
  const r = calcularLigas().resultado[aluno.id];
  const passada = chaveDia(somarDias(inicioSemana(new Date()), -7));
  if (!r || r.semana !== passada || aluno.ligaVista === r.semana) return;
  aluno.ligaVista = r.semana; salvarAluno();
  if (r.xp === 0 && r.para === r.de) return;
  const L = LIGAS[r.para];
  const titulo = r.para > r.de ? `Você subiu para a Liga ${L.nome}!` : r.para < r.de ? `Você caiu para a Liga ${L.nome}` : `Você continua na Liga ${L.nome}`;
  const texto = r.para < r.de ? 'Sem problema: jogue nesta semana para subir de novo!' : `Você terminou a semana em ${r.posicao}º lugar com ${r.xp} XP.`;
  abrirModal(`<div class="liga-modal">
    <div class="escudo-grande">${escudoLiga(r.para)}</div>
    <h2>${titulo}</h2><p>${texto}</p>
    <button class="btn btn-primario btn-grande" id="liga-ver">Ver ranking 🏆</button>
    <button class="btn btn-texto" onclick="fecharModal()">Fechar</button></div>`);
  $('#liga-ver').onclick = () => { fecharModal(); abrirRanking(); };
  if (r.para > r.de) confete();
}

function iniciarRanking() {
  document.querySelectorAll('#tela-ranking .aba').forEach(b => b.onclick = () => {
    abaRanking = b.dataset.aba; renderRanking(); centralizarFaixaLigas();
  });
}
