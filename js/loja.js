/* =========================================================
   MOEDAS E LOJINHA — o estudante ganha moedas concluindo fases
   e compra roupas e acessórios para o bichinho.
   As moedas são calculadas a partir das tentativas salvas (como
   o XP). Assim ninguém perde moedas ao trocar de aparelho, e quem
   já tinha jogado recebe as moedas das fases que já concluiu.
   ========================================================= */

const ICONE_MOEDA = '<svg class="ic-moeda" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/><circle cx="10" cy="10" r="5.6" fill="none" stroke="#d97706" stroke-width="1.3"/><path d="M6.4 6.4 Q8 4.8 10 4.7" stroke="#fff7d6" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>';

const REGRAS_MOEDAS = { primeira: 30, estrela: 10, treino: 5, treinosPorDia: 5, dia: 10, multDesafio: 2 };

const estrelasDaTentativa = t => Number.isFinite(+t.estrelas) ? +t.estrelas : calcularEstrelas(t.acertos || 0, t.total || QUESTOES_POR_FASE);
// Uma compra por item (se o mesmo item aparecer duas vezes depois de juntar aparelhos, vale a primeira).
function comprasDe(a) {
  const vistos = new Set();
  return (Array.isArray(a.compras) ? a.compras : []).filter(c => c && ITEM_POR_ID[c.item] && !vistos.has(c.item) && vistos.add(c.item));
}
const temItem = (a, id) => comprasDe(a).some(c => c.item === id);

/* Extrato de moedas: quanto cada tentativa rendeu, quanto foi gasto e o saldo. */
function calcularMoedas(a) {
  const tent = (a.tentativas || []).filter(t => t && t.data).slice().sort((x, y) => String(x.data).localeCompare(String(y.data)));
  const melhor = {}, diasComBonus = new Set(), treinosNoDia = {}, detalhes = new Map();
  let ganho = 0;
  tent.forEach(t => {
    const est = estrelasDaTentativa(t), antes = melhor[t.faseId] || 0, dia = chaveDia(new Date(t.data));
    const partes = [];
    if (est > 0) {
      const desafio = !!FASE_POR_ID[t.faseId]?.final, mult = desafio ? REGRAS_MOEDAS.multDesafio : 1, x2 = desafio ? ' (desafio vale o dobro)' : '';
      if (!antes) partes.push([`Primeira vez concluindo a fase${x2}`, REGRAS_MOEDAS.primeira * mult]);
      if (est > antes) partes.push([`${est - antes} estrela${est - antes > 1 ? 's' : ''} nova${est - antes > 1 ? 's' : ''}${x2}`, REGRAS_MOEDAS.estrela * (est - antes) * mult]);
      else if ((treinosNoDia[dia] || 0) < REGRAS_MOEDAS.treinosPorDia) {
        treinosNoDia[dia] = (treinosNoDia[dia] || 0) + 1;
        partes.push(['Treino de fase já concluída', REGRAS_MOEDAS.treino]);
      }
      if (!diasComBonus.has(dia)) { diasComBonus.add(dia); partes.push(['Bônus da primeira fase do dia', REGRAS_MOEDAS.dia]); }
    }
    melhor[t.faseId] = Math.max(antes, est);
    const moedas = partes.reduce((s, p) => s + p[1], 0);
    ganho += moedas;
    detalhes.set(t, { moedas, partes });
  });
  const compras = comprasDe(a);
  const gasto = compras.reduce((s, c) => s + (Number.isFinite(+c.preco) ? +c.preco : 0), 0);
  return { ganho, gasto, saldo: Math.max(0, ganho - gasto), detalhes, compras, tentativas: tent };
}
const saldoMoedas = a => calcularMoedas(a).saldo;

function premioPrevisto(f, prog) {
  const mult = f.final ? REGRAS_MOEDAS.multDesafio : 1, est = prog?.estrelas || 0;
  if (!est) return `Até ${(REGRAS_MOEDAS.primeira + 3 * REGRAS_MOEDAS.estrela) * mult} moedas ao concluir pela primeira vez`;
  if (est < 3) return `+${REGRAS_MOEDAS.estrela * mult} moedas por estrela nova (falta${3 - est > 1 ? 'm' : ''} ${3 - est})`;
  return `Treino: +${REGRAS_MOEDAS.treino} moedas (até ${REGRAS_MOEDAS.treinosPorDia} treinos por dia)`;
}

/* ---------------- DESENHOS DOS ITENS ---------------- */
function pontosEstrela(cx, cy, r, ri = r * 0.45) {
  const p = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? ri : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return p.join(' ');
}
const estrelaSVG = (cx, cy, r, cor, extra = '') => `<polygon points="${pontosEstrela(cx, cy, r)}" fill="${cor}" ${extra}/>`;
const coracaoSVG = (cx, cy, s, cor, extra = '') => `<path d="M${cx} ${cy + 6.5 * s} C${cx - 11 * s} ${cy - s} ${cx - 5 * s} ${cy - 10 * s} ${cx} ${cy - 3.5 * s} C${cx + 5 * s} ${cy - 10 * s} ${cx + 11 * s} ${cy - s} ${cx} ${cy + 6.5 * s}Z" fill="${cor}" ${extra}/>`;
const brilhoSVG = (x, y, r, cor) => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${cor}" stroke="rgba(255,255,255,.7)" stroke-width=".6"/>`;
const florSVG = (x, y, cor) => [0, 72, 144, 216, 288].map(g => `<circle cx="${(x + 2.4 * Math.cos(g * Math.PI / 180)).toFixed(2)}" cy="${(y + 2.4 * Math.sin(g * Math.PI / 180)).toFixed(2)}" r="2.2" fill="${cor}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="1.6" fill="#fde047"/>`;
const conchaSVG = (x, y) => `<path d="M${x} ${y - 3} L${x - 3} ${y + 2} Q${x} ${y + 3.6} ${x + 3} ${y + 2}Z" fill="#fff1f2" stroke="#e8a0a8" stroke-width=".7"/><path d="M${x} ${y - 2.6} V${y + 2.6}" stroke="#e8a0a8" stroke-width=".5"/>`;
const notaSVG = (x, y, cor, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="3" ry="2.2" transform="rotate(-20)" fill="${cor}"/><path d="M2.6 -1 V-11 L8 -9" fill="none" stroke="${cor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const bolhaSVG = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(186,230,253,.35)" stroke="#e0f2fe" stroke-width="1.2"/><path d="M${x - r * 0.55} ${y - r * 0.15} Q${x - r * 0.45} ${y - r * 0.6} ${x - r * 0.05} ${y - r * 0.62}" stroke="#fff" stroke-width="1" fill="none"/>`;
const moedinhaSVG = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><circle r="5" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/><circle r="3.1" fill="none" stroke="#d97706" stroke-width="1"/><path d="M-2.4 -2.6 Q-1 -3.8 .8 -3.8" stroke="#fff7d6" stroke-width="1" fill="none"/></g>`;
const ceuEstrelado = pts => `<g fill="#fff">${pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
function bandeirinhas() {
  const cores = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  let s = '<path d="M0 22 Q50 40 100 22" stroke="#7c2d12" stroke-width="1" fill="none"/>';
  for (let k = 1; k < 10; k++) {
    const t = k / 10, x = 100 * t, y = 22 + 36 * t * (1 - t);
    s += `<path d="M${(x - 4).toFixed(1)} ${y.toFixed(1)} L${(x + 4).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 7).toFixed(1)}Z" fill="${cores[k % 5]}"/>`;
  }
  return s;
}

// Lugares onde se veste um item (um item por lugar). A capa fica atrás do bichinho.
const SLOTS_LOJA = ['capa', 'cabeca', 'olhos', 'pescoco', 'fundo', 'efeito'];
// Prateleiras da loja. As peças de herói ficam todas juntas na prateleira "Heróis".
const ABAS_LOJA = [
  { id: 'heroi', nome: 'Heróis', icone: '🦸' },
  { id: 'cabeca', nome: 'Chapéus', icone: '🎩' },
  { id: 'olhos', nome: 'Óculos', icone: '👓' },
  { id: 'pescoco', nome: 'Roupas', icone: '🎀' },
  { id: 'fundo', nome: 'Fundos', icone: '🏞️' },
  { id: 'efeito', nome: 'Efeitos', icone: '✨' },
];
const abaDoItem = it => it.aba || it.slot;

/* Heróis: todos são personagens originais criados para o jogo. */
const capaSVG = (cor, forro, enfeite = '') => `
  <path d="M-12 0 C-26 2 -42 14 -48 34 L-50 56 Q-41 50 -33 57 Q-25 51 -17 58 Q-8 52 0 58 Q8 52 17 58 Q25 51 33 57 Q41 50 50 56 L48 34 C42 14 26 2 12 0 Z" fill="${cor}"/>
  <path d="M-12 0 C-25 3 -39 15 -44 33 L-46 52 M12 0 C25 3 39 15 44 33 L46 52" stroke="${forro}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M-30 20 Q-34 34 -36 48 M30 20 Q34 34 36 48" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${enfeite}`;
const MASCARA_D = 'M-26 -3 Q-20 -10 -12 -8.5 Q0 -6 12 -8.5 Q20 -10 26 -3 Q25 8.5 13 8.5 Q4 8.5 0 4 Q-4 8.5 -13 8.5 Q-25 8.5 -26 -3 Z M-18.5 0 a5.5 4.5 0 1 0 11 0 a5.5 4.5 0 1 0 -11 0 Z M7.5 0 a5.5 4.5 0 1 0 11 0 a5.5 4.5 0 1 0 -11 0 Z';
const mascaraSVG = (cor, borda, enfeite = '') => `<path fill="${cor}" fill-rule="evenodd" stroke="${borda}" stroke-width="1.2" d="${MASCARA_D}"/>${enfeite}`;
const folhaSVG = (x, y, giro, cor) => `<path d="M${x} ${y} q-5 -9 0 -15 q5 6 0 15Z" fill="${cor}" transform="rotate(${giro} ${x} ${y})"/>`;
const PERNAS_ARANHA = [[-1, -1.2, -4.8, -4.6, -6.8, -3.6], [-1.4, -0.2, -5.6, -1.4, -7.4, 0.6], [-1.4, 0.8, -5.2, 2.8, -6.6, 5], [-1, 1.8, -3.4, 5, -4.2, 7]];
const RARIDADES = {
  comum: { nome: 'Comum', cor: '#64748b' }, raro: { nome: 'Raro', cor: '#2563eb' },
  epico: { nome: 'Épico', cor: '#9333ea' }, lendario: { nome: 'Lendário', cor: '#d97706' },
};

/* Chapéus: o ponto (0,0) fica no alto da cabeça. Óculos: entre os olhos (lentes em x = ±13).
   Roupas: no pescoço. Fundos e efeitos usam o quadro inteiro (0 a 100). */
const ITENS_LOJA = [
  // ---------- CHAPÉUS ----------
  { id: 'bone', slot: 'cabeca', nome: 'Boné do Dinheiro', preco: 50, raridade: 'comum', alto: 21, svg: `
    <path d="M-16 0 Q-16 -20 0 -20 Q16 -20 16 0 Z" fill="#2563eb"/>
    <path d="M6 -1 Q22 -4 29 1.5 Q22 6 6 3 Z" fill="#1e3a8a"/>
    <path d="M-16 0 Q0 -3 16 0 L16 2 Q0 -1 -16 2 Z" fill="#1e40af"/>
    <path d="M-8 -17 Q-12 -10 -12 -3" stroke="#60a5fa" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="-10" r="4.6" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
    <circle cx="0" cy="-20" r="1.8" fill="#1e3a8a"/>` },
  { id: 'lacinho', slot: 'cabeca', nome: 'Lacinho', preco: 50, raridade: 'comum', alto: 15, svg: `
    <g transform="translate(11 -3) rotate(-18)">
      <path d="M0 0 L-13 -8 Q-16 0 -13 8 Z" fill="#f472b6" stroke="#db2777" stroke-width="1"/>
      <path d="M0 0 L13 -8 Q16 0 13 8 Z" fill="#f472b6" stroke="#db2777" stroke-width="1"/>
      <path d="M-10 -4 L-4 -1 M10 -4 L4 -1" stroke="#fbcfe8" stroke-width="1.2"/>
      <circle r="3.6" fill="#db2777"/></g>` },
  { id: 'festa', slot: 'cabeca', nome: 'Chapéu de festa', preco: 60, raridade: 'comum', alto: 31, svg: `
    <g transform="rotate(-10)">
      <path d="M-11 0 L0 -26 L11 0 Z" fill="#8b5cf6"/>
      <path d="M-7.6 -8 L7.6 -8 L5.9 -12 L-5.9 -12 Z" fill="#fde047"/>
      <path d="M-4 -16.5 L4 -16.5 L3 -19 L-3 -19 Z" fill="#fde047"/>
      <g fill="#f472b6"><circle cx="-5" cy="-3.5" r="1.2"/><circle cx="4" cy="-4.5" r="1.2"/><circle cx="0" cy="-14" r="1"/></g>
      <circle cx="0" cy="-27" r="3.5" fill="#f43f5e"/>
      <ellipse cx="0" cy="0" rx="12" ry="2.6" fill="#6d28d9"/></g>` },
  { id: 'palha', slot: 'cabeca', nome: 'Chapéu de palha junino', preco: 80, raridade: 'comum', alto: 19, svg: `
    <ellipse cx="0" cy="-1" rx="27" ry="6" fill="#d9a441"/>
    <path d="M-14 -2 Q-15 -19 0 -19 Q15 -19 14 -2 Z" fill="#eec170"/>
    <path d="M-14.5 -6 Q0 -3 14.5 -6 L14.3 -2.5 Q0 .5 -14.3 -2.5 Z" fill="#dc2626"/>
    <path d="M-24 -1 h4 M-15 2.8 h4 M11 2.8 h4 M20 -1 h4 M-7 -14 h4 M3 -15 h4" stroke="#b7862f" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="5" y="-14.5" width="6" height="5" rx="1" fill="#f59e0b" stroke="#b45309" stroke-width=".8" transform="rotate(12 8 -12)"/>` },
  { id: 'chef', slot: 'cabeca', nome: 'Chapéu de chef', preco: 120, raridade: 'raro', alto: 30, svg: `
    <path d="M-12 -9 C-21 -9 -21 -25 -11 -23 C-9 -32 9 -32 11 -23 C21 -25 21 -9 12 -9 Z" fill="#fff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="-12" y="-10" width="24" height="10" rx="2" fill="#fff" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M-6 -9 V-1 M0 -9 V-1 M6 -9 V-1" stroke="#e2e8f0" stroke-width="1.2"/>` },
  { id: 'tiara', slot: 'cabeca', nome: 'Tiara de flores', preco: 120, raridade: 'raro', alto: 9, svg: `
    <path d="M-19 2 Q0 -9 19 2" stroke="#15803d" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="-10" cy="-2" rx="2.8" ry="1.3" fill="#22c55e" transform="rotate(-25 -10 -2)"/>
    <ellipse cx="6.5" cy="-3.6" rx="2.8" ry="1.3" fill="#22c55e" transform="rotate(20 6.5 -3.6)"/>
    ${florSVG(-14, -1.5, '#f472b6')}${florSVG(-6, -4, '#facc15')}${florSVG(2.5, -4.4, '#60a5fa')}${florSVG(10.5, -2.8, '#f472b6')}${florSVG(16.5, -0.4, '#a78bfa')}` },
  { id: 'cartola', slot: 'cabeca', nome: 'Cartola elegante', preco: 180, raridade: 'raro', alto: 27, svg: `
    <rect x="-12" y="-25" width="24" height="25" rx="2.5" fill="#1f2937"/>
    <rect x="-12" y="-8.5" width="24" height="4.5" fill="#dc2626"/>
    <ellipse cx="0" cy="-25" rx="12" ry="2.6" fill="#374151"/>
    <ellipse cx="0" cy="0" rx="19" ry="3.6" fill="#111827"/>
    <path d="M-8 -22 V-11" stroke="#4b5563" stroke-width="2" stroke-linecap="round"/>` },
  { id: 'cangaceiro', slot: 'cabeca', nome: 'Chapéu de cangaceiro', preco: 250, raridade: 'epico', alto: 24, svg: `
    <path d="M-11 -6 Q0 -22 11 -6 Z" fill="#6b4423"/>
    <path d="M-25 1 Q-23 -21 0 -23 Q23 -21 25 1 Q13 -6 0 -6 Q-13 -6 -25 1 Z" fill="#9a6a3a" stroke="#5b3a1a" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M-21 -3 Q-19 -18 0 -19.5 Q19 -18 21 -3" stroke="#e7b871" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
    ${estrelaSVG(0, -12.5, 5.4, '#fbbf24', 'stroke="#92400e" stroke-width=".7"')}
    <circle cx="-12" cy="-10" r="1.9" fill="#fde68a" stroke="#b45309" stroke-width=".6"/><circle cx="12" cy="-10" r="1.9" fill="#fde68a" stroke="#b45309" stroke-width=".6"/>
    <path d="M-25 1 Q0 6 25 1" stroke="#5b3a1a" stroke-width="2" fill="none"/>` },
  { id: 'coroa', slot: 'cabeca', nome: 'Coroa de ouro', preco: 400, raridade: 'lendario', alto: 21, req: { mundo: 2 }, svg: `
    <path d="M-15 0 L-15 -14 L-8 -6 L0 -18 L8 -6 L15 -14 L15 0 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.3" stroke-linejoin="round"/>
    <rect x="-15" y="-4" width="30" height="4.5" rx="1" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
    <circle cx="0" cy="-18" r="2.2" fill="#ef4444"/><circle cx="-15" cy="-14" r="1.8" fill="#3b82f6"/><circle cx="15" cy="-14" r="1.8" fill="#3b82f6"/>
    <circle cx="0" cy="-8" r="2.4" fill="#22c55e" stroke="#15803d" stroke-width=".6"/>
    <path d="M-11 -9 L-11 -5" stroke="#fde68a" stroke-width="1.4" stroke-linecap="round"/>` },
  { id: 'capelo', slot: 'cabeca', nome: 'Capelo de formatura', preco: 500, raridade: 'lendario', alto: 16, req: { mundo: 3 }, svg: `
    <path d="M-11 -6 L-11 1 Q0 4.5 11 1 L11 -6 Z" fill="#1f2937"/>
    <path d="M0 -15 L25 -8 L0 -1 L-25 -8 Z" fill="#111827" stroke="#374151" stroke-width="1"/>
    <circle cx="0" cy="-8" r="1.7" fill="#fbbf24"/>
    <path d="M0 -8 L19 -5 L19 6" stroke="#fbbf24" stroke-width="1.3" fill="none"/>
    <path d="M17 5 L21 5 L22 12 L16 12 Z" fill="#fbbf24"/>` },

  // ---------- ÓCULOS ----------
  { id: 'redondo', slot: 'olhos', nome: 'Óculos redondos', preco: 40, raridade: 'comum', svg: `
    <g fill="rgba(255,255,255,.2)" stroke="#7c2d12" stroke-width="2.2"><circle cx="-13" cy="0" r="7.5"/><circle cx="13" cy="0" r="7.5"/></g>
    <path d="M-5.5 -1 Q0 -4 5.5 -1" stroke="#7c2d12" stroke-width="2.2" fill="none"/>
    <path d="M-20.5 -1.5 L-25 -3.5 M20.5 -1.5 L25 -3.5" stroke="#7c2d12" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M-16.5 -4 Q-14.5 -5.5 -12.5 -5" stroke="#fff" stroke-width="1.3" fill="none"/>` },
  { id: 'escuros', slot: 'olhos', nome: 'Óculos escuros', preco: 70, raridade: 'comum', svg: `
    <g fill="#0f172a" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"><path d="M-22 -5 H-4 V0 Q-4 7 -13 7 Q-22 7 -22 0 Z"/><path d="M4 -5 H22 V0 Q22 7 13 7 Q4 7 4 0 Z"/></g>
    <path d="M-4 -3.5 H4" stroke="#0f172a" stroke-width="2.6"/>
    <path d="M-22 -4 L-26 -5.5 M22 -4 L26 -5.5" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <path d="M-19 -2.5 L-14 -2.5 M7 -2.5 L12 -2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>` },
  { id: 'coracao', slot: 'olhos', nome: 'Óculos de coração', preco: 110, raridade: 'raro', svg: `
    ${coracaoSVG(-13, 0.5, 0.95, 'rgba(244,63,94,.78)', 'stroke="#be123c" stroke-width="1.6"')}${coracaoSVG(13, 0.5, 0.95, 'rgba(244,63,94,.78)', 'stroke="#be123c" stroke-width="1.6"')}
    <path d="M-5.5 -2 Q0 -4.5 5.5 -2" stroke="#be123c" stroke-width="1.8" fill="none"/>
    <path d="M-17 -3 Q-15.5 -4.5 -14 -4" stroke="#fff" stroke-width="1.3" fill="none"/>` },
  { id: 'estrela', slot: 'olhos', nome: 'Óculos de estrela', preco: 120, raridade: 'raro', svg: `
    ${estrelaSVG(-13, 0.5, 9, 'rgba(250,204,21,.8)', 'stroke="#ca8a04" stroke-width="1.5" stroke-linejoin="round"')}${estrelaSVG(13, 0.5, 9, 'rgba(250,204,21,.8)', 'stroke="#ca8a04" stroke-width="1.5" stroke-linejoin="round"')}
    <path d="M-5 -1 Q0 -3.5 5 -1" stroke="#ca8a04" stroke-width="1.8" fill="none"/>` },
  { id: 'mergulho', slot: 'olhos', nome: 'Máscara de mergulho', preco: 150, raridade: 'raro', svg: `
    <path d="M-27 -1 L-22 -1 M22 -1 L27 -1" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="-22" y="-9" width="44" height="17" rx="7" fill="rgba(186,230,253,.45)" stroke="#0ea5e9" stroke-width="3"/>
    <path d="M-4 8.5 Q0 3 4 8.5 Z" fill="#0ea5e9"/>
    <path d="M-17 -5 L-11 -5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
    <path d="M25 6 V-16 Q25 -21 30 -21" stroke="#f97316" stroke-width="3.2" fill="none" stroke-linecap="round"/>` },
  { id: 'heroi', slot: 'olhos', aba: 'heroi', nome: 'Máscara de herói', preco: 200, raridade: 'epico', svg: `
    <path fill="#dc2626" fill-rule="evenodd" d="M-26 -3 Q-20 -10 -12 -8.5 Q0 -6 12 -8.5 Q20 -10 26 -3 Q25 8.5 13 8.5 Q4 8.5 0 4 Q-4 8.5 -13 8.5 Q-25 8.5 -26 -3 Z M-18.5 0 a5.5 4.5 0 1 0 11 0 a5.5 4.5 0 1 0 -11 0 Z M7.5 0 a5.5 4.5 0 1 0 11 0 a5.5 4.5 0 1 0 -11 0 Z"/>
    <path d="M26 -3 L33 -8 L31 1 Z" fill="#b91c1c"/>` },

  // ---------- ROUPAS ----------
  { id: 'gravatinha', slot: 'pescoco', nome: 'Gravata-borboleta', preco: 50, raridade: 'comum', svg: `
    <path d="M0 0 L-11 -6.5 Q-13.5 0 -11 6.5 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
    <path d="M0 0 L11 -6.5 Q13.5 0 11 6.5 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
    <rect x="-3" y="-3.5" width="6" height="7" rx="1.8" fill="#991b1b"/>
    <g fill="#fff" opacity=".75"><circle cx="-7" cy="-2" r="1"/><circle cx="-6" cy="2.5" r="1"/><circle cx="7" cy="-2" r="1"/><circle cx="6" cy="2.5" r="1"/></g>` },
  { id: 'lenco', slot: 'pescoco', nome: 'Lenço azul', preco: 60, raridade: 'comum', svg: `
    <path d="M-16 -4 Q0 2 16 -4 L1 13 Q0 14 -1 13 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
    <g fill="#fff" opacity=".85"><circle cx="-7" cy="1" r="1.2"/><circle cx="6" cy="1.5" r="1.2"/><circle cx="0" cy="6" r="1.2"/><circle cx="-2.5" cy="1.8" r=".8"/></g>` },
  { id: 'cachecol', slot: 'pescoco', nome: 'Cachecol listrado', preco: 100, raridade: 'raro', svg: `
    <path d="M-18 -5 Q0 3 18 -5 L18 1.5 Q0 9.5 -18 1.5 Z" fill="#f97316"/>
    <path d="M7 2 L14 1 L15 16 L8 17 Z" fill="#ea580c"/>
    <path d="M-11 -1.8 V4.8 M-1 0 V6.8 M9 -1 V5.5" stroke="#fde047" stroke-width="2.4"/>
    <path d="M7.6 8 L14.5 7.2 M7.9 12.5 L14.8 11.7" stroke="#fde047" stroke-width="2"/>
    <path d="M8.5 17 v3 M10.5 16.8 v3 M12.5 16.5 v3 M14.5 16.2 v3" stroke="#ea580c" stroke-width="1.1" stroke-linecap="round"/>` },
  { id: 'colar', slot: 'pescoco', nome: 'Colar de conchas', preco: 120, raridade: 'raro', svg: `
    <path d="M-17 -5 Q0 9 17 -5" stroke="#a16207" stroke-width="1.2" fill="none"/>
    ${conchaSVG(-11, 1.3)}${conchaSVG(-5.5, 3.5)}${conchaSVG(5.5, 3.5)}${conchaSVG(11, 1.3)}
    ${estrelaSVG(0, 4.5, 4, '#fb923c', 'stroke="#c2410c" stroke-width=".6"')}` },
  { id: 'gravata', slot: 'pescoco', nome: 'Gravata social', preco: 140, raridade: 'raro', svg: `
    <path d="M-9 -5 L-3 -3 L-5.5 2.5 Z M9 -5 L3 -3 L5.5 2.5 Z" fill="#fff" stroke="#cbd5e1" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M-3.5 -3.5 L3.5 -3.5 L2.6 1.2 L-2.6 1.2 Z" fill="#1e40af"/>
    <path d="M-2.6 1.2 L2.6 1.2 L5 14 L0 18.5 L-5 14 Z" fill="#2563eb"/>
    <path d="M-3.4 6 L3.8 3.6 M-4.4 11.5 L4.7 8.5" stroke="#93c5fd" stroke-width="1.5"/>` },
  { id: 'medalha', slot: 'pescoco', nome: 'Medalha de ouro', preco: 300, raridade: 'lendario', req: { mundo: 1 }, svg: `
    <path d="M-10 -6 L-2.5 7 L2.5 7 L10 -6 L5 -6 L0 2.5 L-5 -6 Z" fill="#2563eb" stroke="#1e40af" stroke-width=".8" stroke-linejoin="round"/>
    <circle cx="0" cy="11" r="6.8" fill="#fbbf24" stroke="#b45309" stroke-width="1.3"/>
    <circle cx="0" cy="11" r="4.8" fill="none" stroke="#fde68a" stroke-width=".9"/>
    ${estrelaSVG(0, 11.2, 3.4, '#fff7cc')}` },

  // ---------- FUNDOS ----------
  { id: 'praia', slot: 'fundo', nome: 'Praia de Rio Tinto', preco: 80, raridade: 'comum', svg: `
    <circle cx="50" cy="50" r="50" fill="#bae6fd"/>
    <circle cx="78" cy="24" r="13" fill="#fde047" opacity=".3"/><circle cx="78" cy="24" r="9" fill="#fde047"/>
    <g fill="#fff" opacity=".9"><ellipse cx="24" cy="24" rx="9" ry="3.5"/><ellipse cx="30" cy="21" rx="6" ry="3"/></g>
    <path d="M0 60 Q25 56 50 60 T100 60 V100 H0Z" fill="#38bdf8"/>
    <path d="M0 66 Q12 63 24 66 M40 65 Q52 62 64 65 M76 66 Q88 63 100 66" stroke="#e0f2fe" stroke-width="1.6" fill="none"/>
    <path d="M0 74 Q30 68 60 74 T100 72 V100 H0Z" fill="#fde68a"/>
    <path d="M10 40 Q12 52 11 66" stroke="#92400e" stroke-width="2.2" fill="none"/>
    <path d="M11 40 q-8 -2 -12 4 M11 40 q8 -3 12 2 M11 40 q-3 -7 -9 -8 M11 40 q4 -6 10 -6" stroke="#16a34a" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
  { id: 'mangue', slot: 'fundo', nome: 'Manguezal', preco: 80, raridade: 'comum', svg: `
    <circle cx="50" cy="50" r="50" fill="#dcfce7"/>
    <path d="M0 66 Q50 60 100 66 V100 H0Z" fill="#86efac" opacity=".6"/>
    <path d="M0 78 Q50 72 100 78 V100 H0Z" fill="#8b6b4a"/>
    <g stroke="#6b4423" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M14 40 Q16 58 8 78"/><path d="M14 50 Q22 64 20 79"/><path d="M14 52 Q8 62 4 70"/><path d="M86 40 Q84 58 92 78"/><path d="M86 50 Q78 64 80 79"/><path d="M86 52 Q92 62 96 70"/></g>
    <g fill="#15803d"><ellipse cx="13" cy="34" rx="13" ry="8"/><ellipse cx="87" cy="34" rx="13" ry="8"/></g>
    <g fill="#22c55e"><ellipse cx="18" cy="30" rx="7" ry="4.5"/><ellipse cx="82" cy="30" rx="7" ry="4.5"/></g>
    <g fill="#e8771a"><circle cx="30" cy="86" r="2.2"/><circle cx="70" cy="88" r="2"/></g>` },
  { id: 'junina', slot: 'fundo', nome: 'Festa junina', preco: 120, raridade: 'raro', svg: `
    <circle cx="50" cy="50" r="50" fill="#fed7aa"/>
    <path d="M0 0 H100 V40 Q50 46 0 40Z" fill="#fdba74" opacity=".6"/>
    <path d="M0 84 H100 V100 H0Z" fill="#c2410c" opacity=".35"/>
    ${bandeirinhas()}
    <path d="M22 86 Q17 78 22 71 Q23 77 26 75 Q29 81 25 86Z" fill="#f97316"/><path d="M22.5 86 Q20.5 81 23.5 78 Q24.5 82 25.5 86Z" fill="#fde047"/>
    <path d="M16 88 L30 84 M16 84 L30 88" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>` },
  { id: 'arcoiris', slot: 'fundo', nome: 'Arco-íris', preco: 140, raridade: 'raro', svg: `
    <circle cx="50" cy="50" r="50" fill="#e0f2fe"/>
    ${['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'].map((c, k) => { const r = 44 - k * 5; return `<path d="M${50 - r} 72 A${r} ${r} 0 0 1 ${50 + r} 72" stroke="${c}" stroke-width="5.2" fill="none"/>`; }).join('')}
    <g fill="#fff"><circle cx="10" cy="72" r="8"/><circle cx="19" cy="75" r="7"/><circle cx="4" cy="77" r="6"/><circle cx="90" cy="72" r="8"/><circle cx="81" cy="75" r="7"/><circle cx="96" cy="77" r="6"/></g>` },
  { id: 'noite', slot: 'fundo', nome: 'Céu estrelado', preco: 160, raridade: 'raro', svg: `
    <circle cx="50" cy="50" r="50" fill="#1e1b4b"/>
    <circle cx="74" cy="22" r="9" fill="#fef9c3"/><circle cx="78.5" cy="18.5" r="8" fill="#1e1b4b"/>
    ${ceuEstrelado([[18, 20, 1.2], [30, 12, .9], [44, 8, 1], [12, 40, 1], [88, 44, 1.1], [62, 12, .8], [24, 30, .7], [92, 30, .8]])}
    ${estrelaSVG(20, 58, 3.2, '#fde68a')}${estrelaSVG(84, 62, 2.6, '#fde68a')}
    <path d="M0 84 Q50 76 100 84 V100 H0Z" fill="#312e81"/>` },
  { id: 'mar', slot: 'fundo', nome: 'Fundo do mar', preco: 180, raridade: 'raro', svg: `
    <circle cx="50" cy="50" r="50" fill="#0284c7"/>
    <path d="M0 0 H100 V34 Q50 40 0 34Z" fill="#38bdf8" opacity=".55"/>
    <path d="M0 86 Q50 80 100 86 V100 H0Z" fill="#fcd34d"/>
    <g stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"><path d="M12 92 Q6 80 12 70 Q18 60 12 50"/><path d="M20 94 Q16 86 20 78"/><path d="M88 92 Q94 80 88 70 Q82 60 88 52"/></g>
    <g fill="none" stroke="#e0f2fe" stroke-width="1.3"><circle cx="22" cy="30" r="2.6"/><circle cx="27" cy="22" r="1.7"/><circle cx="80" cy="56" r="2.2"/><circle cx="76" cy="48" r="1.4"/></g>
    <path d="M70 30 q7 -6 14 0 q-7 6 -14 0Z" fill="#fb923c"/><path d="M84 30 l5 -4 v8Z" fill="#fb923c"/><circle cx="74" cy="29" r=".9" fill="#1b1b1b"/>` },
  { id: 'espaco', slot: 'fundo', nome: 'Galáxia', preco: 300, raridade: 'epico', req: { nivel: 5 }, svg: `
    <circle cx="50" cy="50" r="50" fill="#0f0a2e"/>
    <circle cx="26" cy="34" r="24" fill="#7c3aed" opacity=".28"/><circle cx="76" cy="70" r="20" fill="#db2777" opacity=".2"/>
    ${ceuEstrelado([[14, 30, 1], [36, 12, .8], [58, 8, 1.1], [90, 44, .9], [10, 56, .8], [30, 86, .9], [70, 90, .8], [86, 80, 1]])}
    <circle cx="76" cy="24" r="9" fill="#f472b6"/><ellipse cx="76" cy="24" rx="15" ry="3.6" fill="none" stroke="#fde68a" stroke-width="2" transform="rotate(-18 76 24)"/>
    ${estrelaSVG(18, 66, 3, '#fde68a')}
    <path d="M14 18 l10 4" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>` },

  // ---------- EFEITOS ----------
  { id: 'brilhos', slot: 'efeito', nome: 'Brilhos', preco: 60, raridade: 'comum', svg: `
    ${brilhoSVG(19, 26, 6, '#fde047')}${brilhoSVG(82, 30, 5, '#fde047')}${brilhoSVG(22, 76, 4.5, '#fff')}${brilhoSVG(80, 74, 6, '#fde047')}${brilhoSVG(50, 9, 4, '#fff')}${brilhoSVG(10, 52, 3, '#fff')}` },
  { id: 'coracoes', slot: 'efeito', nome: 'Corações', preco: 80, raridade: 'comum', svg: `
    ${coracaoSVG(17, 30, 0.55, '#f43f5e')}${coracaoSVG(84, 26, 0.45, '#fb7185')}${coracaoSVG(14, 66, 0.4, '#fb7185')}${coracaoSVG(86, 68, 0.6, '#f43f5e')}${coracaoSVG(50, 10, 0.35, '#fda4af')}` },
  { id: 'notas', slot: 'efeito', nome: 'Notas musicais', preco: 90, raridade: 'raro', svg: `
    ${notaSVG(14, 36, '#7c3aed')}${notaSVG(80, 30, '#2563eb', 0.9)}${notaSVG(18, 74, '#db2777', 0.8)}${notaSVG(82, 72, '#7c3aed', 1.1)}` },
  { id: 'bolhas', slot: 'efeito', nome: 'Bolhas', preco: 90, raridade: 'raro', svg: `
    ${bolhaSVG(16, 34, 5)}${bolhaSVG(22, 22, 3)}${bolhaSVG(84, 40, 4.5)}${bolhaSVG(80, 28, 2.6)}${bolhaSVG(18, 70, 3.6)}${bolhaSVG(84, 72, 5)}` },
  { id: 'chuva', slot: 'efeito', nome: 'Chuva de moedas', preco: 250, raridade: 'epico', req: { ofensiva: 3 }, svg: `
    ${moedinhaSVG(16, 30, 1, -15)}${moedinhaSVG(84, 26, 0.8, 20)}${moedinhaSVG(14, 62, 0.75, 10)}${moedinhaSVG(86, 66, 1.05, -25)}${moedinhaSVG(50, 9, 0.7, 0)}${moedinhaSVG(24, 82, 0.7, 30)}` },

  // ---------- HERÓIS ----------
  { id: 'capa-vermelha', slot: 'capa', aba: 'heroi', nome: 'Capa vermelha', preco: 120, raridade: 'raro', svg: capaSVG('#dc2626', '#fbbf24') },

  // Super Poupador
  { id: 'capa-poupador', slot: 'capa', aba: 'heroi', nome: 'Capa do Super Poupador', preco: 140, raridade: 'epico', req: { fase: 'f7' },
    svg: capaSVG('#db2777', '#fbbf24', `${moedinhaSVG(-40, 44, 0.8, -10)}${moedinhaSVG(40, 44, 0.8, 10)}${moedinhaSVG(-33, 30, 0.6, 0)}${moedinhaSVG(33, 30, 0.6, 0)}`) },
  { id: 'emblema-poupador', slot: 'pescoco', aba: 'heroi', nome: 'Emblema do Cofrinho', preco: 90, raridade: 'epico', req: { fase: 'f7' }, svg: `
    <circle r="9.5" fill="#fbbf24" stroke="#b45309" stroke-width="1.4"/><circle r="7.4" fill="none" stroke="#fde68a" stroke-width="1"/>
    <ellipse cx=".8" cy=".8" rx="5" ry="3.8" fill="#f472b6"/><circle cx="-4.2" cy=".4" r="2.1" fill="#f9a8d4"/>
    <circle cx="-4.7" cy=".1" r=".45" fill="#9d174d"/><circle cx="-3.7" cy=".1" r=".45" fill="#9d174d"/>
    <path d="M-1.2 -2.6 L-.2 -4.6 L1.2 -2.8Z" fill="#f472b6"/><rect x="0" y="-3" width="3" height=".9" rx=".4" fill="#9d174d"/>
    <circle cx="-1.6" cy="-.4" r=".55" fill="#1b1b1b"/>
    <path d="M-1.5 4.2 v1.8 M3 4.2 v1.8" stroke="#f472b6" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M5.7 .2 q1.8 -.6 1.2 -2.2" stroke="#f472b6" stroke-width="1" fill="none" stroke-linecap="round"/>` },
  { id: 'mascara-poupador', slot: 'olhos', aba: 'heroi', nome: 'Máscara dourada', preco: 100, raridade: 'epico', req: { fase: 'f7' },
    svg: mascaraSVG('#fbbf24', '#b45309', moedinhaSVG(29, -7, 0.5, 0)) },

  // Guardião Antigolpe
  { id: 'capa-guardiao', slot: 'capa', aba: 'heroi', nome: 'Capa do Guardião', preco: 140, raridade: 'epico', req: { fase: 'f8' },
    svg: capaSVG('#1e3a8a', '#94a3b8', `${estrelaSVG(-38, 40, 2.6, '#cbd5e1')}${estrelaSVG(38, 40, 2.6, '#cbd5e1')}`) },
  { id: 'emblema-guardiao', slot: 'pescoco', aba: 'heroi', nome: 'Escudo do Guardião', preco: 90, raridade: 'epico', req: { fase: 'f8' }, svg: `
    <path d="M0 -10 L9 -6.5 V0 C9 6 4.5 9.5 0 11 C-4.5 9.5 -9 6 -9 0 V-6.5 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.4"/>
    <path d="M0 -7.4 L6.4 -4.9 V0 C6.4 4.4 3.2 7 0 8.2 C-3.2 7 -6.4 4.4 -6.4 0 V-4.9 Z" fill="#1e3a8a"/>
    <path d="M-2.4 0 V-2 a2.4 2.4 0 0 1 4.8 0 V0" stroke="#fbbf24" stroke-width="1.3" fill="none"/>
    <rect x="-3.4" y="-.2" width="6.8" height="5.2" rx="1.2" fill="#fbbf24"/><circle cx="0" cy="2" r=".9" fill="#1e3a8a"/>` },
  { id: 'elmo-guardiao', slot: 'cabeca', aba: 'heroi', nome: 'Elmo do Guardião', preco: 150, raridade: 'epico', alto: 34, req: { fase: 'f8' }, svg: `
    <path d="M-18 1 Q-19 -21 0 -22 Q19 -21 18 1 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.4"/>
    <path d="M-2.5 -21.5 Q2 -34 12 -31 Q6 -27 3.5 -21 Z" fill="#2563eb"/>
    <path d="M-11 -16 Q-13.5 -9 -13 -3" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M-18 1 H18" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
    ${estrelaSVG(0, -10, 4.4, '#fbbf24', 'stroke="#b45309" stroke-width=".6"')}` },

  // Capitã Mangue
  { id: 'capa-mangue', slot: 'capa', aba: 'heroi', nome: 'Capa da Capitã Mangue', preco: 140, raridade: 'epico', req: { fase: 'f11' },
    svg: capaSVG('#15803d', '#86efac', `${folhaSVG(-42, 54, -20, '#86efac')}${folhaSVG(42, 54, 20, '#86efac')}${folhaSVG(-34, 44, -10, '#4ade80')}${folhaSVG(34, 44, 10, '#4ade80')}`) },
  { id: 'emblema-mangue', slot: 'pescoco', aba: 'heroi', nome: 'Emblema da Folha', preco: 90, raridade: 'epico', req: { fase: 'f11' }, svg: `
    <circle r="9.5" fill="#166534" stroke="#14532d" stroke-width="1.2"/>
    <path d="M-5 5.5 C-6.5 -2 -1 -7.5 6.5 -6.5 C6.5 1 1 6.5 -5 5.5 Z" fill="#4ade80"/>
    <path d="M-5 5.5 Q0 0 5.5 -5.5 M-1.5 1.5 L-2.5 -1.5 M1.5 -1.5 L3.8 -1" stroke="#166534" stroke-width="1" fill="none"/>` },
  { id: 'mascara-mangue', slot: 'olhos', aba: 'heroi', nome: 'Máscara de folhas', preco: 100, raridade: 'epico', req: { fase: 'f11' },
    svg: mascaraSVG('#16a34a', '#14532d', `${folhaSVG(-27, 0, -70, '#4ade80')}${folhaSVG(27, 0, 70, '#4ade80')}`) },

  // Cometa
  { id: 'capa-cometa', slot: 'capa', aba: 'heroi', nome: 'Capa do Cometa', preco: 140, raridade: 'epico', req: { nivel: 6 },
    svg: capaSVG('#6d28d9', '#c4b5fd', `${estrelaSVG(-38, 34, 3.2, '#fde047')}${estrelaSVG(40, 40, 2.6, '#fde047')}${estrelaSVG(-30, 50, 2, '#fff')}${estrelaSVG(32, 26, 2, '#fff')}`) },
  { id: 'emblema-cometa', slot: 'pescoco', aba: 'heroi', nome: 'Emblema do Cometa', preco: 90, raridade: 'epico', req: { nivel: 6 }, svg: `
    <circle r="9.5" fill="#4c1d95" stroke="#2e1065" stroke-width="1.2"/>
    <path d="M-7 5.5 Q-2.5 2.5 .5 -.5" stroke="#c4b5fd" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M-5.5 7.5 Q-2.5 5 -.5 3.5" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    ${estrelaSVG(2.4, -2.4, 5.2, '#fde047', 'stroke="#ca8a04" stroke-width=".5"')}` },
  { id: 'mascara-cometa', slot: 'olhos', aba: 'heroi', nome: 'Máscara do Cometa', preco: 100, raridade: 'epico', req: { nivel: 6 },
    svg: mascaraSVG('#7c3aed', '#4c1d95', estrelaSVG(24, -9, 3.6, '#fde047')) },

  // Caranguejeira (heroína inspirada na aranha caranguejeira da mata)
  { id: 'capa-caranguejeira', slot: 'capa', aba: 'heroi', nome: 'Capa da Caranguejeira', preco: 140, raridade: 'epico', req: { fase: 'f12' },
    svg: capaSVG('#3f2a1d', '#fb923c', '<g fill="#fb923c"><circle cx="-38" cy="36" r="1.8"/><circle cx="38" cy="36" r="1.8"/><circle cx="-33" cy="48" r="1.6"/><circle cx="33" cy="48" r="1.6"/><circle cx="-44" cy="48" r="1.4"/><circle cx="44" cy="48" r="1.4"/></g>') },
  { id: 'emblema-caranguejeira', slot: 'pescoco', aba: 'heroi', nome: 'Emblema da Caranguejeira', preco: 90, raridade: 'epico', req: { fase: 'f12' }, svg: `
    <circle r="9.5" fill="#3f2a1d" stroke="#1c0a00" stroke-width="1.2"/>
    <g stroke="#fb923c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" fill="none">${PERNAS_ARANHA.map(([a, b, c, d, e, f]) => `<path d="M${a} ${b} L${c} ${d} L${e} ${f}"/><path d="M${-a} ${b} L${-c} ${d} L${-e} ${f}"/>`).join('')}</g>
    <ellipse cx="0" cy="-1.4" rx="2" ry="1.8" fill="#fb923c"/><ellipse cx="0" cy="2.6" rx="2.7" ry="3.1" fill="#fb923c"/>
    <circle cx="-.7" cy="-1.8" r=".45" fill="#1c0a00"/><circle cx=".7" cy="-1.8" r=".45" fill="#1c0a00"/>` },
  { id: 'mascara-caranguejeira', slot: 'olhos', aba: 'heroi', nome: 'Máscara da Caranguejeira', preco: 100, raridade: 'epico', req: { fase: 'f12' },
    svg: mascaraSVG('#ea580c', '#7c2d12', '<path d="M-20 -9.2 l-1 -3 M-15 -8.8 l-.4 -3 M-10 -8.2 l0 -3 M10 -8.2 l0 -3 M15 -8.8 l.4 -3 M20 -9.2 l1 -3" stroke="#7c2d12" stroke-width="1.2" stroke-linecap="round"/>') },
];

/* Kits de herói: as peças juntas saem mais baratas do que compradas separadas (como um combo). */
const DESCONTO_KIT = 0.2;
const KITS = [
  { id: 'kit-poupador', nome: 'Super Poupador', desc: 'Guarda cada moedinha e nunca cai em compra por impulso!', pecas: ['capa-poupador', 'emblema-poupador', 'mascara-poupador'] },
  { id: 'kit-guardiao', nome: 'Guardião Antigolpe', desc: 'Protege todo mundo dos golpes da internet.', pecas: ['capa-guardiao', 'emblema-guardiao', 'elmo-guardiao'] },
  { id: 'kit-mangue', nome: 'Capitã Mangue', desc: 'Defende o manguezal e o consumo consciente.', pecas: ['capa-mangue', 'emblema-mangue', 'mascara-mangue'] },
  { id: 'kit-cometa', nome: 'Cometa', desc: 'Rápido como um cometa nas contas de cabeça.', pecas: ['capa-cometa', 'emblema-cometa', 'mascara-cometa'] },
  { id: 'kit-caranguejeira', nome: 'Caranguejeira', desc: 'A heroína aranha da mata: sobe em qualquer desafio!', pecas: ['capa-caranguejeira', 'emblema-caranguejeira', 'mascara-caranguejeira'] },
];
const KIT_POR_ID = Object.fromEntries(KITS.map(k => [k.id, k]));
const ITEM_POR_ID = Object.fromEntries(ITENS_LOJA.map(i => [i.id, i]));

/* Onde cada item fica em cada bichinho: [x, y, escala]. */
const ANCORAS_COBRA = { capa: [40, 36, 0.8], cabeca: [42, 16, 0.75], olhos: [42, 24, 0.55], pescoco: [56, 45, 0.7] };
const ANCORAS_POTIGUARA = { capa: [50, 70, 1], cabeca: [50, 38, 0.95], olhos: [50, 58, 0.7], pescoco: [50, 84, 0.95] };
const ANCORAS = {
  peixeboi: { capa: [50, 48, 1], cabeca: [50, 27, 1], olhos: [50, 46, 1], pescoco: [50, 85, 1.05] },
  preguica: { capa: [50, 56, 1], cabeca: [50, 28, 1], olhos: [50, 55, 0.92], pescoco: [50, 88, 1] },
  guariba: { capa: [50, 54, 1], cabeca: [50, 21, 1.05], olhos: [50, 50, 0.85], pescoco: [50, 90, 1] },
  jiboia: ANCORAS_COBRA, coral: ANCORAS_COBRA,
  caranguejo: { capa: [50, 54, 1], cabeca: [50, 43, 0.6], olhos: [50, 28, 1], pescoco: [50, 80, 0.9] },
  cavalomarinho: { capa: [46, 46, 0.85], cabeca: [49, 19, 0.62], olhos: [60, 29, 0.7], pescoco: [47, 46, 0.65] },
  tartaruga: { capa: [50, 44, 1], cabeca: [50, 21, 0.85], olhos: [50, 37, 0.62], pescoco: [50, 57, 0.8] },
  sagui: { capa: [50, 62, 1], cabeca: [50, 24, 0.9], olhos: [50, 50, 0.62], pescoco: [50, 75, 0.9] },
  jaci: ANCORAS_POTIGUARA, ibere: ANCORAS_POTIGUARA,
};

// Só vale item que existe e que é do lugar certo (um aparelho antigo nunca quebra o desenho).
function visualLimpo(v) {
  const out = {};
  if (v && typeof v === 'object') SLOTS_LOJA.forEach(s => { const it = ITEM_POR_ID[v[s]]; if (it && it.slot === s) out[s] = it.id; });
  return out;
}
const visualDe = a => visualLimpo(a?.visual);
const qtdVestidos = v => Object.keys(visualLimpo(v)).length;

// Desenho do bichinho com as roupas (usado por avatarSVG).
// Ordem das camadas: fundo, capa, bichinho, roupa, óculos, chapéu e efeito.
function vestir(p, visual) {
  const v = visualLimpo(visual), anc = ANCORAS[p.id] || ANCORAS.peixeboi;
  const noLugar = (slot, it) => {
    const [x, y, s0] = anc[slot];
    const s = slot === 'cabeca' && it.alto ? Math.min(s0, (y - 1.5) / it.alto) : s0;
    return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})">${it.svg}</g>`;
  };
  const capa = v.capa ? noLugar('capa', ITEM_POR_ID[v.capa]) : '';
  let corpo = p.svg.replace(/<g class="av-fundo">[\s\S]*?<\/g>/, orig => (v.fundo ? ITEM_POR_ID[v.fundo].svg : orig) + capa);
  ['pescoco', 'olhos', 'cabeca'].forEach(slot => { const it = ITEM_POR_ID[v[slot]]; if (it) corpo += noLugar(slot, it); });
  if (v.efeito) corpo += ITEM_POR_ID[v.efeito].svg;
  return corpo;
}

// Item com requisito: devolve o que falta fazer, ou null se já pode comprar.
function requisitoItem(a, item) {
  const r = item.req;
  if (!r) return null;
  if (r.fase) return faseConcluida(a, r.fase) ? null : `Conclua a fase "${FASE_POR_ID[r.fase].nome}"`;
  if (r.mundo) { const m = MUNDOS[r.mundo - 1]; return faseConcluida(a, chefeDoMundo(m).id) ? null : `Conclua o Mundo ${r.mundo} (${m.nome})`; }
  if (r.nivel) return nivelDe(xpTotal(a)).n >= r.nivel ? null : `Chegue ao nível ${r.nivel}`;
  if (r.ofensiva) return ofensiva(a).recorde >= r.ofensiva ? null : `Faça uma ofensiva de ${r.ofensiva} dias seguidos`;
  return null;
}

/* ---------------- KITS DE HERÓI ---------------- */
// Preço do kit: só as peças que faltam, com desconto. Quem já tem uma peça não paga por ela de novo.
function precoKit(a, kit) {
  const faltam = kit.pecas.filter(id => !temItem(a, id));
  const cheio = faltam.reduce((s, id) => s + ITEM_POR_ID[id].preco, 0);
  const preco = Math.round(cheio * (1 - DESCONTO_KIT) / 5) * 5;
  return { faltam, cheio, preco, economia: cheio - preco };
}
const requisitoKit = (a, kit) => kit.pecas.map(id => requisitoItem(a, ITEM_POR_ID[id])).find(Boolean) || null;
const vestirKit = (vis, kit) => ({ ...vis, ...Object.fromEntries(kit.pecas.map(id => [ITEM_POR_ID[id].slot, id])) });
const usandoKit = (vis, kit) => kit.pecas.every(id => vis[ITEM_POR_ID[id].slot] === id);

function estadoKit(a, kit, ext, vis) {
  const pk = precoKit(a, kit);
  if (!pk.faltam.length) return usandoKit(vis, kit) ? 'usando' : 'seu';
  if (requisitoKit(a, kit)) return 'bloqueado';
  return ext.saldo >= pk.preco ? 'compravel' : 'caro';
}

// Conquistas de visual: 4 itens ao mesmo tempo, ou um kit de herói completo.
function conferirConquistasVisual() {
  const v = visualDe(aluno);
  if (qtdVestidos(v) >= 4) darConquista('estiloso');
  if (KITS.some(k => usandoKit(v, k))) darConquista('superheroi');
}

/* ---------------- TELA DA LOJINHA ---------------- */
let abaLoja = 'heroi';
let itemProvando = null;   // id de um item ou de um kit
const DICAS_COMPRA = [
  'Consumidor consciente pensa antes: você vai mesmo usar esse item?',
  'Já comparou com os outros itens desta prateleira?',
  'Guardar moedas também é uma escolha esperta: dá para comprar algo maior depois!',
  'Essas moedas são do jogo, não são dinheiro de verdade. Mas a regra é a mesma: planeje antes de gastar!',
  'Experimentou no provador? Compre só se gostou de verdade.',
];

function abrirLoja() {
  itemProvando = null;
  renderLoja();
  mostrar('tela-loja');
}

function estadoItem(a, item, ext, vis) {
  if (temItem(a, item.id)) return vis[item.slot] === item.id ? 'usando' : 'seu';
  if (requisitoItem(a, item)) return 'bloqueado';
  return ext.saldo >= item.preco ? 'compravel' : 'caro';
}

function precoHTML(v) { return `<span class="preco">${ICONE_MOEDA}${v}</span>`; }
const RODAPE_CARTAO = {
  usando: () => '<span class="tag-usando">✓ Usando</span>',
  seu: () => '<span class="tag-seu">Seu</span>',
  bloqueado: preco => `<span class="tag-bloq">🔒 ${precoHTML(preco)}</span>`,
  compravel: preco => precoHTML(preco),
  caro: preco => precoHTML(preco),
};

function cartaoItem(item, ext, vis, p) {
  const est = estadoItem(aluno, item, ext, vis), rar = RARIDADES[item.raridade];
  return `<button class="item-card ${est} ${itemProvando === item.id ? 'sel' : ''}" data-item="${item.id}" style="--rar:${rar.cor}" aria-label="${esc(item.nome)}">
    <span class="item-raridade">${rar.nome}</span>
    <span class="item-avatar">${avatarSVG(p, 'item', { ...vis, [item.slot]: item.id })}</span>
    <b>${esc(item.nome)}</b>${RODAPE_CARTAO[est](item.preco)}</button>`;
}

function cartaoKit(kit, ext, vis, p) {
  const est = estadoKit(aluno, kit, ext, vis), pk = precoKit(aluno, kit);
  const preco = pk.faltam.length ? `<span class="kit-precos"><s>${pk.cheio}</s>${RODAPE_CARTAO[est](pk.preco)}</span>` : RODAPE_CARTAO[est](0);
  return `<button class="item-card kit-card ${est} ${itemProvando === kit.id ? 'sel' : ''}" data-item="${kit.id}" aria-label="Kit ${esc(kit.nome)}">
    <span class="item-raridade kit-selo">Kit −${Math.round(DESCONTO_KIT * 100)}%</span>
    <span class="item-avatar">${avatarSVG(p, 'kit', vestirKit(vis, kit))}</span>
    <b>${esc(kit.nome)}</b>${preco}</button>`;
}

function painelProvador(sel, ext, vis, p) {
  if (!sel) {
    return `<b>Vista o ${esc(p.apelido)}!</b>
      <small>Toque num item para experimentar no provador. Conclua fases para ganhar moedas.</small>
      ${qtdVestidos(vis) ? '<button class="btn btn-texto" data-acao="tirar-tudo">Tirar tudo</button>' : ''}`;
  }
  if (sel.pecas) {
    const est = estadoKit(aluno, sel, ext, vis), pk = precoKit(aluno, sel), req = requisitoKit(aluno, sel);
    const acao = {
      usando: '<button class="btn btn-secundario" data-acao="tirar-kit">Tirar</button>',
      seu: '<button class="btn btn-primario" data-acao="vestir-kit">Vestir o kit</button>',
      bloqueado: `<span class="prov-aviso">🔒 ${esc(req || '')}</span>`,
      compravel: `<button class="btn btn-primario" data-acao="comprar-kit">Comprar kit ${precoHTML(pk.preco)}</button>`,
      caro: `<span class="prov-aviso">Faltam ${precoHTML(pk.preco - ext.saldo)} moedas</span>`,
    }[est];
    return `<span class="prov-raridade kit-selo">Kit de herói</span>
      <b>${esc(sel.nome)}</b>
      <small>${esc(sel.desc)}</small>
      ${pk.faltam.length ? `<small class="kit-conta">Separado: <s>${pk.cheio}</s> · No kit: <b>${pk.preco}</b> · Economia de ${pk.economia} moedas</small>` : '<small>Você já tem as 3 peças.</small>'}
      <div class="prov-acoes">${acao}<button class="btn btn-texto" data-acao="cancelar">Voltar</button></div>`;
  }
  const est = estadoItem(aluno, sel, ext, vis), req = requisitoItem(aluno, sel), rar = RARIDADES[sel.raridade];
  const acao = {
    usando: '<button class="btn btn-secundario" data-acao="tirar">Tirar</button>',
    seu: '<button class="btn btn-primario" data-acao="usar">Vestir</button>',
    bloqueado: `<span class="prov-aviso">🔒 ${esc(req || '')}</span>`,
    compravel: `<button class="btn btn-primario" data-acao="comprar">Comprar ${precoHTML(sel.preco)}</button>`,
    caro: `<span class="prov-aviso">Faltam ${precoHTML(sel.preco - ext.saldo)} moedas</span>`,
  }[est];
  return `<span class="prov-raridade" style="--rar:${rar.cor}">${rar.nome}</span>
    <b>${esc(sel.nome)}</b>
    <small>${est === 'usando' ? 'Seu bichinho está usando.' : est === 'seu' ? 'Você já tem este item.' : `Preço: ${sel.preco} moedas`}</small>
    <div class="prov-acoes">${acao}<button class="btn btn-texto" data-acao="cancelar">Voltar</button></div>`;
}

function extratoHTML(ext) {
  const movs = [
    ...ext.tentativas.map(t => ({ t, d: ext.detalhes.get(t) })).filter(x => x.d?.moedas)
      .map(({ t, d }) => ({ data: t.data, texto: FASE_POR_ID[t.faseId]?.nome || t.fase || 'Fase', valor: d.moedas })),
    ...ext.compras.map(c => ({ data: c.data, texto: `Compra: ${ITEM_POR_ID[c.item].nome}`, valor: -(+c.preco || 0) })),
  ].sort((x, y) => String(y.data).localeCompare(String(x.data))).slice(0, 15);
  const quando = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };
  return `<details class="extrato"><summary>📜 Meu extrato de moedas</summary>
    <div class="res-numeros extrato-nums">
      <div><b>${ext.ganho}</b><small>ganhei</small></div><div><b>${ext.gasto}</b><small>gastei</small></div><div><b>${ext.saldo}</b><small>tenho</small></div>
    </div>
    ${movs.length ? `<ul class="extrato-lista">${movs.map(m => `<li><small>${quando(m.data)}</small><span>${esc(m.texto)}</span><b class="${m.valor < 0 ? 'neg' : 'pos'}">${m.valor < 0 ? '−' : '+'}${Math.abs(m.valor)}</b></li>`).join('')}</ul>` : '<p class="vazio">Ainda não há movimentos. Conclua uma fase para ganhar suas primeiras moedas!</p>'}
    <p class="dica">Um extrato mostra tudo o que entrou e saiu, igual ao extrato de uma conta no banco.</p>
  </details>
  <details class="extrato"><summary>${ICONE_MOEDA} Como ganhar moedas</summary><ul class="regras-moedas">
    <li>Concluir uma fase pela primeira vez: <b>+${REGRAS_MOEDAS.primeira}</b></li>
    <li>Cada estrela nova numa fase: <b>+${REGRAS_MOEDAS.estrela}</b></li>
    <li>Desafio do mundo: vale <b>o dobro</b></li>
    <li>Primeira fase concluída no dia: <b>+${REGRAS_MOEDAS.dia}</b></li>
    <li>Treinar uma fase que já tem 3 estrelas (ou repetir sem estrela nova): <b>+${REGRAS_MOEDAS.treino}</b> (até ${REGRAS_MOEDAS.treinosPorDia} por dia)</li>
  </ul></details>`;
}

function renderLoja() {
  const ext = calcularMoedas(aluno), vis = visualDe(aluno), p = personagem();
  const sel = itemProvando ? (KIT_POR_ID[itemProvando] || ITEM_POR_ID[itemProvando]) : null;
  const provador = !sel ? vis : sel.pecas ? vestirKit(vis, sel) : { ...vis, [sel.slot]: sel.id };
  const itens = ITENS_LOJA.filter(i => abaDoItem(i) === abaLoja);
  const grade = lista => `<div class="grade-itens">${lista}</div>`;
  const prateleira = abaLoja === 'heroi'
    ? `<h3 class="loja-secao">🦸 Kits de herói <small>${Math.round(DESCONTO_KIT * 100)}% mais barato que comprar as peças separadas</small></h3>
       ${grade(KITS.map(k => cartaoKit(k, ext, vis, p)).join(''))}
       <h3 class="loja-secao">Peças separadas</h3>
       ${grade(itens.map(i => cartaoItem(i, ext, vis, p)).join(''))}`
    : grade(itens.map(i => cartaoItem(i, ext, vis, p)).join(''));
  $('#loja-saldo').textContent = ext.saldo;
  $('#loja-conteudo').innerHTML = `
    <div class="provador">
      <span class="provador-avatar" style="--moldura:${molduraDe(aluno)}">${avatarSVG(p, 'provador', provador)}</span>
      <div class="provador-info">${painelProvador(sel, ext, vis, p)}</div>
    </div>
    <div class="abas abas-loja" role="tablist" aria-label="Prateleiras da loja">${ABAS_LOJA.map(s => `
      <button class="aba ${s.id === abaLoja ? 'ativa' : ''}" role="tab" aria-selected="${s.id === abaLoja}" data-aba="${s.id}"><span aria-hidden="true">${s.icone}</span>${s.nome}</button>`).join('')}
    </div>
    ${prateleira}
    <p class="loja-resumo">🎒 Você tem ${comprasDe(aluno).length} de ${ITENS_LOJA.length} itens.</p>
    ${extratoHTML(ext)}
    <p class="aviso">As moedas são do jogo e não valem dinheiro de verdade.</p>`;
}

function iniciarLoja() {
  $('#loja-conteudo').onclick = e => {
    const aba = e.target.closest('[data-aba]');
    if (aba) { abaLoja = aba.dataset.aba; itemProvando = null; renderLoja(); return; }
    const card = e.target.closest('[data-item]');
    if (card) { itemProvando = itemProvando === card.dataset.item ? null : card.dataset.item; renderLoja(); return; }
    const b = e.target.closest('[data-acao]'); if (!b) return;
    const item = itemProvando && ITEM_POR_ID[itemProvando], kit = itemProvando && KIT_POR_ID[itemProvando];
    const acao = b.dataset.acao;
    if (acao === 'cancelar') { itemProvando = null; renderLoja(); }
    else if (acao === 'tirar-tudo') { aluno.visual = {}; salvarAluno(); renderLoja(); }
    else if (acao === 'usar' && item) vestirItem(item);
    else if (acao === 'tirar' && item) { const v = visualDe(aluno); delete v[item.slot]; aluno.visual = v; salvarAluno(); renderLoja(); }
    else if (acao === 'comprar' && item) confirmarCompra(item);
    else if (acao === 'vestir-kit' && kit) { aluno.visual = vestirKit(visualDe(aluno), kit); salvarAluno(); conferirConquistasVisual(); renderLoja(); }
    else if (acao === 'tirar-kit' && kit) { const v = visualDe(aluno); kit.pecas.forEach(id => { delete v[ITEM_POR_ID[id].slot]; }); aluno.visual = v; salvarAluno(); renderLoja(); }
    else if (acao === 'comprar-kit' && kit) confirmarCompraKit(kit);
  };
}

function vestirItem(item) {
  aluno.visual = { ...visualDe(aluno), [item.slot]: item.id };
  salvarAluno();
  conferirConquistasVisual();
  renderLoja();
}

const comprasSalvas = () => (Array.isArray(aluno.compras) ? aluno.compras : []);

function confirmarCompra(item) {
  const ext = calcularMoedas(aluno);
  if (ext.saldo < item.preco || requisitoItem(aluno, item) || temItem(aluno, item.id)) { renderLoja(); return; }
  const p = personagem();
  abrirModal(`<div class="compra">
    <h2>🛍️ Comprar ${esc(item.nome)}?</h2>
    <span class="compra-avatar" style="--moldura:${molduraDe(aluno)}">${avatarSVG(p, 'compra', { ...visualDe(aluno), [item.slot]: item.id })}</span>
    <div class="res-numeros">
      <div><b>${ext.saldo}</b><small>você tem</small></div>
      <div><b>−${item.preco}</b><small>preço</small></div>
      <div><b>${ext.saldo - item.preco}</b><small>vai sobrar</small></div>
    </div>
    <p class="dica-consciente">💭 ${R.pick(DICAS_COMPRA)}</p>
    <button class="btn btn-primario btn-grande" id="btn-confirmar-compra">Comprar e vestir</button>
    <button class="btn btn-texto" onclick="fecharModal()">Agora não</button></div>`);
  $('#btn-confirmar-compra').onclick = () => {
    if (calcularMoedas(aluno).saldo < item.preco || temItem(aluno, item.id)) { fecharModal(); renderLoja(); return; }
    aluno.compras = [...comprasSalvas(), { item: item.id, preco: item.preco, data: new Date().toISOString() }];
    aluno.visual = { ...visualDe(aluno), [item.slot]: item.id };
    salvarAluno();
    fecharModal();
    toast(`🎉 ${esc(item.nome)} é seu!`);
    confete();
    darConquista('comprador');
    conferirConquistasVisual();
    renderLoja();
  };
}

function confirmarCompraKit(kit) {
  const ext = calcularMoedas(aluno), pk = precoKit(aluno, kit);
  if (!pk.faltam.length || ext.saldo < pk.preco || requisitoKit(aluno, kit)) { renderLoja(); return; }
  const p = personagem();
  abrirModal(`<div class="compra">
    <h2>🦸 Comprar o kit ${esc(kit.nome)}?</h2>
    <span class="compra-avatar" style="--moldura:${molduraDe(aluno)}">${avatarSVG(p, 'compra', vestirKit(visualDe(aluno), kit))}</span>
    <div class="kit-comparacao">
      <div><small>Peças separadas</small><b><s>${pk.cheio}</s></b></div>
      <div><small>No kit</small><b>${pk.preco}</b></div>
      <div class="kit-eco"><small>Você economiza</small><b>${pk.economia}</b></div>
    </div>
    <div class="res-numeros">
      <div><b>${ext.saldo}</b><small>você tem</small></div>
      <div><b>−${pk.preco}</b><small>preço do kit</small></div>
      <div><b>${ext.saldo - pk.preco}</b><small>vai sobrar</small></div>
    </div>
    <p class="dica-consciente">💭 Kit é como um combo: sai mais barato, mas só vale a pena se você quiser usar as ${pk.faltam.length} peças!</p>
    <button class="btn btn-primario btn-grande" id="btn-confirmar-compra">Comprar e vestir o kit</button>
    <button class="btn btn-texto" onclick="fecharModal()">Agora não</button></div>`);
  $('#btn-confirmar-compra').onclick = () => {
    const agora = precoKit(aluno, kit);
    if (!agora.faltam.length || calcularMoedas(aluno).saldo < agora.preco) { fecharModal(); renderLoja(); return; }
    // O preço do kit é dividido entre as peças (a última fica com o resto), para o extrato fechar certinho.
    const data = new Date().toISOString();
    let resto = agora.preco;
    const novas = agora.faltam.map((id, k) => {
      const parte = k === agora.faltam.length - 1 ? resto : Math.round(ITEM_POR_ID[id].preco * (1 - DESCONTO_KIT));
      resto -= parte;
      return { item: id, preco: parte, data, kit: kit.id };
    });
    aluno.compras = [...comprasSalvas(), ...novas];
    aluno.visual = vestirKit(visualDe(aluno), kit);
    salvarAluno();
    fecharModal();
    toast(`🦸 Kit ${esc(kit.nome)} é seu! Você economizou ${agora.economia} moedas.`);
    confete();
    darConquista('comprador');
    conferirConquistasVisual();
    renderLoja();
  };
}
