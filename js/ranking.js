/* =========================================================
   RANKING — XP, ofensiva, nível e patentes.
   Tudo é calculado a partir das tentativas salvas. Assim o
   resultado é o mesmo em qualquer aparelho que tenha os dados,
   inclusive depois de a professora importar backups.
   ========================================================= */

/* Patentes: sobem na hora em que o estudante junta o XP total pedido e nunca descem. */
const PATENTES = [
  { nome: 'Bronze', xp: 0, cor: '#b8692e', cor2: '#f0b27a' },
  { nome: 'Prata', xp: 100, cor: '#7b8aa0', cor2: '#dde3ea' },
  { nome: 'Ouro', xp: 300, cor: '#d18e00', cor2: '#fde68a' },
  { nome: 'Safira', xp: 600, cor: '#1d5fd1', cor2: '#93c0ff' },
  { nome: 'Rubi', xp: 1000, cor: '#c81e4a', cor2: '#ff9bb3' },
  { nome: 'Esmeralda', xp: 1500, cor: '#0d8f50', cor2: '#86efb8' },
  { nome: 'Ametista', xp: 2100, cor: '#7c3aed', cor2: '#d4bcff' },
  { nome: 'Pérola', xp: 2800, cor: '#b38f8a', cor2: '#fff4ef' },
  { nome: 'Obsidiana', xp: 3600, cor: '#27272a', cor2: '#8a8a94' },
  { nome: 'Diamante', xp: 4500, cor: '#0891b2', cor2: '#b9f6ff' },
];
const DIAS_CURTOS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CORES_MOLDURA = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0f172a'];

/* ---------------- DATAS (sempre no horário do aparelho) ---------------- */
const pad2 = n => String(n).padStart(2, '0');
const chaveDia = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function inicioSemana(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function somarDias(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const chaveSemana = d => chaveDia(inicioSemana(d));

/* ---------------- XP, OFENSIVA E NÍVEL ---------------- */
// XP = soma dos pontos de TODAS as tentativas (repetir fase também vale)
// mais o XP bônus dado pela professora (que não é partida e não conta como dia de ofensiva).
const bonusDe = a => (Array.isArray(a.bonusXp) ? a.bonusXp : []).filter(b => b && Number.isFinite(+b.pontos) && b.data);
const ganhosXP = a => [...a.tentativas.map(t => ({ data: t.data, pontos: t.pontos || 0 })), ...bonusDe(a).map(b => ({ data: b.data, pontos: +b.pontos }))];
const xpBonus = a => bonusDe(a).reduce((s, b) => s + +b.pontos, 0);
const xpTotal = a => ganhosXP(a).reduce((s, g) => s + g.pontos, 0);

function xpPorSemana(a) {
  const m = {};
  ganhosXP(a).forEach(g => { const k = chaveSemana(new Date(g.data)); m[k] = (m[k] || 0) + g.pontos; });
  return m;
}
const xpDaSemana = (a, semana = chaveSemana(new Date())) => xpPorSemana(a)[semana] || 0;

function xpPorDia(a, inicio) {
  const dias = DIAS_CURTOS.map((_, i) => chaveDia(somarDias(inicio, i)));
  const v = dias.map(() => 0);
  ganhosXP(a).forEach(g => { const k = dias.indexOf(chaveDia(new Date(g.data))); if (k >= 0) v[k] += g.pontos; });
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

/* ---------------- PATENTES ---------------- */
function patentePorXP(xp) {
  let n = 0;
  PATENTES.forEach((p, i) => { if (xp >= p.xp) n = i; });
  return n;
}
const patenteDe = a => patentePorXP(xpTotal(a));

// Patente atual, a próxima e quanto falta para ela.
function infoPatente(a) {
  const xp = xpTotal(a), n = patentePorXP(xp), atual = PATENTES[n], prox = PATENTES[n + 1] || null;
  return { xp, n, atual, prox, falta: prox ? prox.xp - xp : 0, pct: prox ? (xp - atual.xp) / (prox.xp - atual.xp) * 100 : 100 };
}

function escudoPatente(nivel, ligado = true) {
  const l = PATENTES[nivel], id = `pt${nivel}${ligado ? 'a' : 'b'}`;
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
  return `<span class="av-moldura" style="--moldura:${molduraDe(a)}">${avatarSVG(p, classe, a.visual)}</span>`;
}

const ordenarXP = (x, y) => y.xp - x.xp || x.a.nome.localeCompare(y.a.nome, 'pt-BR');

function tempoRestante() {
  const ms = somarDias(inicioSemana(new Date()), 7) - Date.now();
  const h = Math.ceil(ms / 36e5);
  return h <= 24 ? `Termina em ${h} h` : `Termina em ${Math.ceil(ms / 864e5)} dias`;
}

/* ---------------- TELA DO RANKING ----------------
   Patentes e Turma: só os colegas da mesma turma. Geral: todas as turmas juntas. */
let abaRanking = 'patente';
let periodoTurma = 'semana';   // aba Turma: 'semana' (XP desta semana) ou 'total' (desde o início)
const daMinhaTurma = a => chaveTurma(a.turma) === chaveTurma(aluno.turma);

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
  el.innerHTML = avisoAprovacao() + (abaRanking === 'patente' ? htmlPatente() : abaRanking === 'turma' ? htmlTurma() : htmlGeral());
  el.onclick = e => {
    const b = e.target.closest('[data-aluno]'); if (b) abrirMiniPerfil(b.dataset.aluno);
    if (e.target.closest('#rk-escolher-turma')) abrirEscolhaTurma();
  };
  el.onchange = e => { if (e.target.name === 'rk-periodo') { periodoTurma = e.target.value; renderRanking(); } };
}

function centralizarFaixaLigas() {
  const f = $('#faixa-ligas'), at = f?.querySelector('.atual');
  if (at) f.scrollLeft = at.offsetLeft - f.clientWidth / 2 + at.clientWidth / 2;
}

function linhaRanking(a, pos, xp) {
  const eu = a.id === aluno.id;
  return `<button class="rk-linha ${eu ? 'eu' : ''}" data-aluno="${esc(a.id)}" style="animation-delay:${Math.min(pos, 12) * 35}ms">
    <span class="rk-pos">${['🥇', '🥈', '🥉'][pos - 1] || pos}</span>
    <span class="rk-avatar">${avatarAluno(a, 'rk')}</span>
    <span class="rk-nome"><b>${esc(nomePublico(a))}${eu ? ' <small class="voce">você</small>' : ''}</b>${tagTurma(a.turma)}</span>
    <span class="rk-xp"><span class="rk-escudo" title="Patente ${PATENTES[patenteDe(a)].nome}">${escudoPatente(patenteDe(a))}</span>${xp} XP</span></button>`;
}

function podio(lista, comTurma) {
  return `<div class="podio">${lista.slice(0, 3).map((g, i) => `
    <button class="podio-lugar p${i + 1} ${g.a.id === aluno.id ? 'eu' : ''}" data-aluno="${esc(g.a.id)}">
      <span class="podio-avatar">${avatarAluno(g.a, 'podio')}${i === 0 ? '<span class="coroa">👑</span>' : ''}</span>
      <b>${esc(nomePublico(g.a))}</b>
      ${comTurma ? tagTurma(g.a.turma) : ''}
      <small class="podio-xp"><span class="rk-escudo" title="Patente ${PATENTES[patenteDe(g.a)].nome}">${escudoPatente(patenteDe(g.a))}</span>${g.xp} XP</small>
      <span class="podio-bloco">${i + 1}</span>
    </button>`).join('')}</div>`;
}

// Pódio com os 3 primeiros e, embaixo, a lista completa com TODO mundo (do 1º ao último).
function classificacao(lista, comTurma = false) {
  return `${podio(lista, comTurma)}
    ${lista.length ? `<h3 class="rk-subtitulo">Classificação completa <small>${lista.length} ${lista.length === 1 ? 'pessoa' : 'pessoas'}</small></h3>` : ''}
    <div class="rk-lista">${lista.map((g, i) => linhaRanking(g.a, i + 1, g.xp)).join('')}</div>
    ${lista.length < 2 ? avisoSozinho() : ''}`;
}

// Conta que espera a professora confirmar a turma: joga normalmente, mas ainda não aparece no ranking.
const avisoAprovacao = () => aguardandoAprovacao(aluno)
  ? `<div class="rk-espera" role="status"><span aria-hidden="true">⏳</span><p><b>Sua turma ainda vai ser confirmada.</b>
      A professora precisa confirmar que você é do ${esc(nomeTurma(aluno.turma))}. Até lá, você joga normalmente e o seu progresso fica salvo, mas o seu nome ainda não aparece no ranking.</p></div>`
  : '';

const avisoSozinho = () => aguardandoAprovacao(aluno) ? '' : Banco.ativo
  ? '<p class="aviso rk-aviso">👋 Por enquanto só você está no ranking. Chame os colegas para jogar!</p>'
  : '<p class="aviso rk-aviso">👋 Por enquanto só você aparece aqui. O ranking mostra quem joga neste aparelho. A professora pode juntar os dados de vários aparelhos pelo painel pedagógico.</p>';

function htmlPatente() {
  const info = infoPatente(aluno), P = info.atual, todos = alunosRanking().filter(daMinhaTurma);
  const grupo = todos.filter(a => patenteDe(a) === info.n).map(a => ({ a, xp: xpTotal(a) })).sort(ordenarXP);
  const porPatente = PATENTES.map((_, i) => todos.filter(a => patenteDe(a) === i).length);
  const turma = turmaOficial(aluno.turma) ? `do ${esc(nomeTurma(aluno.turma))}` : 'da sua turma';
  return `
    <div class="faixa-ligas" id="faixa-ligas">${PATENTES.map((p, i) => `<div class="escudo-item ${i === info.n ? 'atual' : ''}" title="Patente ${p.nome}: ${p.xp} XP">${escudoPatente(i, i <= info.n)}</div>`).join('')}</div>
    <div class="liga-titulo"><h2>Patente ${P.nome}</h2>
      ${info.prox
        ? `<p>Faltam <b>${info.falta} XP</b> para a Patente ${info.prox.nome}</p>
           <div class="patente-progresso"><span class="barra"><i style="width:${info.pct.toFixed(1)}%"></i></span><small>${info.xp} de ${info.prox.xp} XP</small></div>`
        : `<p>Você chegou à patente mais alta do jogo, com ${info.xp} XP! 💎</p>`}
    </div>
    <h3 class="rk-subtitulo">Colegas ${turma} na Patente ${P.nome}</h3>
    <div class="rk-lista">${grupo.map((g, i) => linhaRanking(g.a, i + 1, g.xp)).join('')}</div>
    ${grupo.length >= 2 || aguardandoAprovacao(aluno) ? '' : todos.length < 2 ? avisoSozinho() : `<p class="aviso rk-aviso">🚀 Você é a única pessoa ${turma} na Patente ${P.nome} por enquanto. Veja a turma toda na aba Turma, e todas as turmas na aba Geral.</p>`}
    <details class="rk-regras" open><summary>Como funcionam as patentes?</summary>
      <p class="rk-regras-texto">Cada acerto vale XP: 10 no fácil, 15 no médio e 20 no difícil. Repetir uma fase também soma. A patente sobe na hora em que você junta o XP e nunca desce. Ao lado de cada patente está quantas pessoas ${turma} estão nela.</p>
      <ul class="escada-patentes">${PATENTES.map((p, i) => `
        <li class="${i === info.n ? 'atual' : i < info.n ? 'feita' : ''}">${escudoPatente(i, i <= info.n)}
          <b>${p.nome}</b><span>${p.xp} XP</span><small>${porPatente[i]} ${porPatente[i] === 1 ? 'pessoa' : 'pessoas'}</small></li>`).join('')}
      </ul></details>`;
}

// Ranking só da minha turma: XP desta semana (recomeça toda segunda) ou desde o início.
function htmlTurma() {
  if (!turmaOficial(aluno.turma)) {
    return `<div class="rk-cabecalho"><h2>Qual é a sua turma?</h2><p>Escolha a sua turma para ver o ranking dos colegas.</p></div>
      <button class="btn btn-primario btn-grande rk-escolher" id="rk-escolher-turma">👥 Escolher minha turma</button>`;
  }
  const semana = chaveSemana(new Date()), total = periodoTurma === 'total';
  const lista = alunosRanking().filter(daMinhaTurma)
    .map(a => ({ a, xp: total ? xpTotal(a) : xpDaSemana(a, semana) })).sort(ordenarXP);
  return `<div class="rk-cabecalho"><h2>Turma ${esc(nomeTurma(aluno.turma))}</h2>
      <p>${total ? 'XP total desde o início' : `XP ganho nesta semana · ⏳ ${tempoRestante()}`}</p></div>
    <div class="segmentado rk-periodo" role="radiogroup" aria-label="Período do ranking">
      <label><input type="radio" name="rk-periodo" value="semana" ${total ? '' : 'checked'}><span>📅 Esta semana</span></label>
      <label><input type="radio" name="rk-periodo" value="total" ${total ? 'checked' : ''}><span>🏅 Desde o início</span></label>
    </div>
    ${classificacao(lista)}`;
}

// Ranking geral: todas as turmas juntas, pelo XP total.
function htmlGeral() {
  const lista = alunosRanking().map(a => ({ a, xp: xpTotal(a) })).sort(ordenarXP);
  return `<div class="rk-cabecalho"><h2>Geral</h2><p>${TURMAS.map(tagTurma).join(' ')} juntas · XP total desde o início</p></div>
    ${classificacao(lista, true)}`;
}

function abrirMiniPerfil(id) {
  const a = alunosRanking().find(x => x.id === id); if (!a) return;
  const nivel = patenteDe(a), of = ofensiva(a), eu = id === aluno.id;
  abrirModal(`<div class="mini-perfil">
    <div class="mini-avatar">${avatarAluno(a, 'mini')}</div>
    <h2>${esc(nomePublico(a))}</h2>
    <p class="perfil-sub">${tagTurma(a.turma)} · Nível ${nivelDe(xpTotal(a)).n}</p>
    <div class="mini-liga">${escudoPatente(nivel)}<span>Patente ${PATENTES[nivel].nome}</span></div>
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

function iniciarRanking() {
  document.querySelectorAll('#tela-ranking .aba').forEach(b => b.onclick = () => {
    abaRanking = b.dataset.aba; renderRanking(); centralizarFaixaLigas();
  });
}
