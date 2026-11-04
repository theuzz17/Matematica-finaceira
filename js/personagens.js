/* =========================================================
   PERSONAGENS DE RIO TINTO – PB
   Desenhos em SVG (funcionam sem internet e ficam nítidos no celular).
   Fauna do Vale do Mamanguape e povo Potiguara.
   ========================================================= */

const olhos = (x1, x2, y, r = 4.2) => `
  <circle cx="${x1}" cy="${y}" r="${r}" fill="#1b1b1b"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#1b1b1b"/>
  <circle cx="${x1 + 1.4}" cy="${y - 1.5}" r="${r * .35}" fill="#fff"/><circle cx="${x2 + 1.4}" cy="${y - 1.5}" r="${r * .35}" fill="#fff"/>`;

const bochechas = (x1, x2, y, cor = '#ff8fa3') => `
  <ellipse cx="${x1}" cy="${y}" rx="5" ry="3" fill="${cor}" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="5" ry="3" fill="${cor}" opacity=".55"/>`;

const fundo = (c1, c2) => `<circle cx="50" cy="50" r="50" fill="${c1}"/><path d="M0 72 Q25 62 50 70 T100 68 V100 H0Z" fill="${c2}"/>`;

function svgPeixeBoi() {
  return `${fundo('#bfe8f7', '#7fcbe6')}
    <path d="M6 84 Q18 78 30 84 T54 84 T78 84 T100 82" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/>
    <ellipse cx="22" cy="76" rx="13" ry="6" fill="#7d8c9c" transform="rotate(-25 22 76)"/>
    <ellipse cx="78" cy="76" rx="13" ry="6" fill="#7d8c9c" transform="rotate(25 78 76)"/>
    <ellipse cx="50" cy="54" rx="33" ry="31" fill="#93a2b2"/>
    <ellipse cx="50" cy="44" rx="22" ry="14" fill="#a7b4c2" opacity=".6"/>
    ${olhos(37, 63, 46, 3.8)}
    <ellipse cx="50" cy="66" rx="20" ry="13.5" fill="#c3ccd6"/>
    <ellipse cx="44" cy="62" rx="2.4" ry="3.2" fill="#55606b"/><ellipse cx="56" cy="62" rx="2.4" ry="3.2" fill="#55606b"/>
    <g fill="#6b7783"><circle cx="38" cy="68" r="1"/><circle cx="41" cy="71" r="1"/><circle cx="59" cy="71" r="1"/><circle cx="62" cy="68" r="1"/></g>
    <path d="M44 72 Q50 76 56 72" stroke="#55606b" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${bochechas(30, 70, 58)}`;
}

function svgPreguica() {
  return `${fundo('#d6f0c2', '#9fd57f')}
    <rect x="4" y="12" width="92" height="7" rx="3.5" fill="#7a5230"/>
    <g fill="#3f9b3a"><ellipse cx="14" cy="10" rx="7" ry="3.5" transform="rotate(-20 14 10)"/><ellipse cx="86" cy="10" rx="7" ry="3.5" transform="rotate(20 86 10)"/><ellipse cx="74" cy="8" rx="6" ry="3" transform="rotate(-15 74 8)"/></g>
    <path d="M28 40 Q22 22 30 16" stroke="#8b6646" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M72 40 Q78 22 70 16" stroke="#8b6646" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g stroke="#3b2a1c" stroke-width="2" stroke-linecap="round"><path d="M27 16 Q29 12 32 13"/><path d="M73 16 Q71 12 68 13"/></g>
    <circle cx="50" cy="56" r="31" fill="#a3805d"/>
    <path d="M30 34 Q50 24 70 34 Q60 30 50 33 Q40 30 30 34Z" fill="#8b6646"/>
    <ellipse cx="50" cy="60" rx="24" ry="20" fill="#ecd9b8"/>
    <ellipse cx="38" cy="55" rx="9" ry="5.5" fill="#4a3426" transform="rotate(-18 38 55)"/>
    <ellipse cx="62" cy="55" rx="9" ry="5.5" fill="#4a3426" transform="rotate(18 62 55)"/>
    <circle cx="38" cy="55" r="3.3" fill="#fff"/><circle cx="62" cy="55" r="3.3" fill="#fff"/>
    <circle cx="38.6" cy="55.4" r="2" fill="#1b1b1b"/><circle cx="62.6" cy="55.4" r="2" fill="#1b1b1b"/>
    <ellipse cx="50" cy="64" rx="5" ry="3.4" fill="#3b2a1c"/>
    <path d="M42 70 Q50 77 58 70" stroke="#3b2a1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${bochechas(31, 69, 66, '#e9967a')}`;
}

function svgCobra(corpo, faixa1, faixa2, cabeca, f1, f2) {
  const d = 'M18 86 C 18 66, 82 74, 80 56 C 78 40, 28 50, 34 34';
  return `${fundo(f1, f2)}
    <path d="${d}" stroke="${corpo}" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="${faixa1}" stroke-width="17" fill="none" stroke-dasharray="5 15" stroke-dashoffset="2"/>
    ${faixa2 ? `<path d="${d}" stroke="${faixa2}" stroke-width="17" fill="none" stroke-dasharray="2.5 17.5" stroke-dashoffset="-4"/>` : ''}
    <ellipse cx="42" cy="28" rx="19" ry="14" fill="${cabeca}"/>
    <ellipse cx="42" cy="33" rx="13" ry="7" fill="#fff" opacity=".18"/>
    ${olhos(35, 49, 24, 3.8)}
    <circle cx="38" cy="32" r="1" fill="#1b1b1b" opacity=".6"/><circle cx="46" cy="32" r="1" fill="#1b1b1b" opacity=".6"/>
    <path d="M42 41 V47 M42 47 L38.5 51 M42 47 L45.5 51" stroke="#e5383b" stroke-width="2" stroke-linecap="round" fill="none"/>
    ${bochechas(29, 55, 31)}`;
}

function svgGuariba() {
  return `${fundo('#ffe1cc', '#f6b38d')}
    <circle cx="17" cy="50" r="10" fill="#3a2418"/><circle cx="83" cy="50" r="10" fill="#3a2418"/>
    <circle cx="17" cy="50" r="5" fill="#a86a4c"/><circle cx="83" cy="50" r="5" fill="#a86a4c"/>
    <circle cx="50" cy="48" r="32" fill="#3a2418"/>
    <path d="M24 66 Q30 92 50 94 Q70 92 76 66 Q66 76 50 76 Q34 76 24 66Z" fill="#b5542c"/>
    <path d="M28 30 Q50 14 72 30 Q62 24 50 26 Q38 24 28 30Z" fill="#5a3726"/>
    <ellipse cx="50" cy="54" rx="21" ry="21" fill="#8a5a42"/>
    <path d="M32 44 Q38 40 44 44 M56 44 Q62 40 68 44" stroke="#2a1810" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${olhos(39, 61, 50, 3.6)}
    <ellipse cx="46" cy="60" rx="1.6" ry="2.2" fill="#2a1810"/><ellipse cx="54" cy="60" rx="1.6" ry="2.2" fill="#2a1810"/>
    <ellipse cx="50" cy="69" rx="6.5" ry="7" fill="#2a1810"/>
    <ellipse cx="50" cy="72" rx="4" ry="3" fill="#e5383b"/>`;
}

function svgPotiguara(menina) {
  const penas = [-64, -42, -21, 0, 21, 42, 64];
  const cores = ['#e63946', '#f4c430', '#2a9d8f', '#e63946', '#2a9d8f', '#f4c430', '#e63946'];
  const cocar = penas.map((a, k) => `
    <g transform="rotate(${a} 50 52)"><ellipse cx="50" cy="15" rx="6" ry="15" fill="${cores[k]}"/><path d="M50 3 V30" stroke="#fff" stroke-width="1" opacity=".55"/></g>`).join('');
  const cabelo = menina
    ? `<path d="M24 44 Q22 82 30 90 L40 90 Q36 70 38 52Z M76 44 Q78 82 70 90 L60 90 Q64 70 62 52Z" fill="#141414"/>`
    : '';
  const colar = menina
    ? `<path d="M34 86 Q50 96 66 86" stroke="#7a3e1d" stroke-width="1.6" fill="none"/>
       <g fill="#e63946"><circle cx="38" cy="89" r="2.2"/><circle cx="50" cy="92.5" r="2.4"/><circle cx="62" cy="89" r="2.2"/></g>
       <g fill="#f4c430"><circle cx="44" cy="91.5" r="2"/><circle cx="56" cy="91.5" r="2"/></g>`
    : `<g fill="#f2efe6"><path d="M43 86 L46 94 L49 86Z"/><path d="M51 86 L54 94 L57 86Z"/></g>`;
  return `${fundo(menina ? '#ffe9a8' : '#c8efe2', menina ? '#ffcf5c' : '#86d3b9')}
    ${cocar}
    ${cabelo}
    <path d="M30 80 Q50 74 70 80 L74 100 H26Z" fill="${menina ? '#c0612b' : '#2a6f97'}"/>
    <circle cx="50" cy="58" r="24" fill="#a8704a"/>
    <path d="M26 54 Q26 32 50 32 Q74 32 74 54 Q70 46 62 46 L38 46 Q30 46 26 54Z" fill="#141414"/>
    <rect x="25" y="38" width="50" height="8" rx="4" fill="#7a3e1d"/>
    <path d="M28 46 L32 39 L36 46 L40 39 L44 46 L48 39 L52 46 L56 39 L60 46 L64 39 L68 46 L72 39" stroke="#f2efe6" stroke-width="1.6" fill="none"/>
    ${olhos(41, 59, 58, 3.6)}
    <g stroke="#d62828" stroke-width="2.2" stroke-linecap="round"><path d="M30 63 H36 M30 67 H36 M64 63 H70 M64 67 H70"/></g>
    <path d="M44 71 Q50 76 56 71" stroke="#4a2614" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${colar}`;
}

const PERSONAGENS = [
  { id: 'peixeboi', nome: 'Peixe-boi Marinho', apelido: 'Mamá', frase: 'Sem pressa: compra boa é compra pensada!',
    info: 'Vive na Barra do Rio Mamanguape, em Rio Tinto.', svg: svgPeixeBoi() },
  { id: 'preguica', nome: 'Bicho-preguiça', apelido: 'Lentinha', frase: 'Devagar e sempre, a meta chega!',
    info: 'Mora nas árvores da Mata Atlântica.', svg: svgPreguica() },
  { id: 'guariba', nome: 'Macaco Guariba', apelido: 'Guará', frase: 'Eu grito bem alto: compare antes de comprar!',
    info: 'O guariba de mãos ruivas é da Mata Atlântica da Paraíba.', svg: svgGuariba() },
  { id: 'jiboia', nome: 'Jiboia', apelido: 'Jibi', frase: 'Fique esperto e não caia no bote do golpista!',
    info: 'Cobra que não tem veneno e vive na mata.', svg: svgCobra('#5e9e3f', '#2f5d22', null, '#6aae48', '#fdeab8', '#f3cd72') },
  { id: 'coral', nome: 'Cobra-coral', apelido: 'Corá', frase: 'Minhas cores avisam. Os sinais de golpe também!',
    info: 'Suas cores fortes avisam: mantenha distância!', svg: svgCobra('#e5383b', '#1b1b1b', '#f7e9a0', '#e5383b', '#e4e9ff', '#b9c4f5') },
  { id: 'jaci', nome: 'Jaci Potiguara', apelido: 'Jaci', frase: 'Na aldeia a gente planeja junto e cuida do futuro!',
    info: 'O povo Potiguara vive em Rio Tinto, Baía da Traição e Marcação.', svg: svgPotiguara(true) },
  { id: 'ibere', nome: 'Iberê Potiguara', apelido: 'Iberê', frase: 'Quem cuida da terra consome com consciência!',
    info: 'O povo Potiguara vive em Rio Tinto, Baía da Traição e Marcação.', svg: svgPotiguara(false) },
];

/* Devolve o desenho do personagem pronto para colocar no HTML. */
function avatarSVG(p, classe = '') {
  return `<svg class="avatar-svg av-${classe}" viewBox="0 0 100 100" role="img" aria-label="${p.nome}"><defs><clipPath id="clip-${p.id}-${classe || 'x'}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#clip-${p.id}-${classe || 'x'})">${p.svg}</g></svg>`;
}
