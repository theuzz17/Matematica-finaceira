/* =========================================================
   QUESTÕES DOS MUNDOS 2 E 3 — mesmas regras do questoes.js:
   números, nomes e ordem das alternativas são sorteados na hora.
   ========================================================= */

const FMT_FATOR4 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fator = v => FMT_FATOR4.format(v);
const unid = (um, varios) => v => `${num(v)} ${Math.abs(v) === 1 ? um : varios}`;
const mdc = (a, b) => (b ? mdc(b, a % b) : a);
const lista = itens => itens.length > 1 ? `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}` : itens.join('');

/* ---------------- PROPORÇÃO E REGRA DE TRÊS ---------------- */
const ITENS_UNIDADE = [
  { n: 'pães', e: '🍞', l: 'Na padaria', u: [0.5, 0.6, 0.75, 0.8] },
  { n: 'picolés', e: '🍦', l: 'Na sorveteria', u: [2, 2.5, 3] },
  { n: 'coxinhas', e: '🥟', l: 'Na lanchonete', u: [3, 3.5, 4, 4.5] },
  { n: 'cadernos', e: '📒', l: 'Na papelaria', u: [8, 10, 12, 15] },
];

const G_PROPORCAO = [
  () => {
    const it = R.pick(ITENS_UNIDADE), u = R.pick(it.u);
    const a = R.int(2, 5), b = R.int(6, 12);
    const pa = r2(a * u), ans = r2(b * u);
    return Q('Proporção e regra de três', 'facil',
      `${it.e} ${it.l}, ${a} ${it.n} custam ${brl(pa)}. Quanto custam ${b} ${it.n}?`,
      ans, [pa + (b - a), pa * b, u, ans + u], brl,
      `Primeiro, o preço de cada um: ${brl(pa)} ÷ ${a} = ${brl(u)}. Depois: ${b} × ${brl(u)} = ${brl(ans)}. Quantidade e preço são diretamente proporcionais.`);
  },
  () => {
    const L = R.pick([2, 3]), b = R.pick([15, 20, 25, 30]);
    let m; do { m = R.int(3, 10); } while (m === L);
    const total = L * b, q = m * b;
    return Q('Proporção e regra de três', 'medio',
      `🍫 Para vender na feira, ${L} latas de leite condensado rendem ${total} brigadeiros. Quantas latas são precisas para fazer ${q} brigadeiros?`,
      m, [m + 1, m - 1, m * L, m + L], unid('lata', 'latas'),
      `Cada lata rende ${total} ÷ ${L} = ${b} brigadeiros. Para ${q} brigadeiros: ${q} ÷ ${b} = ${m} latas.`);
  },
  () => {
    const T = R.pick([600, 900, 1200, 1800]);
    const [n1, n2] = R.shuffle([20, 24, 25, 30, 36, 40, 45, 50, 60].filter(n => T % n === 0)).slice(0, 2);
    const v1 = T / n1, v2 = T / n2;
    return Q('Proporção e regra de três', 'dificil',
      `🚌 O ônibus da excursão da escola custa ${brl(T)}, divididos igualmente. Com ${n1} estudantes, cada um paga ${brl(v1)}. Se forem ${n2} estudantes, quanto cada um vai pagar?`,
      v2, [r2(v1 * n2 / n1), v1, r2(2 * v1 - v2), v2 + 5], brl,
      `O total não muda: ${n1} × ${brl(v1)} = ${brl(T)}. Com ${n2} estudantes: ${brl(T)} ÷ ${n2} = ${brl(v2)}. ${n2 > n1 ? 'Mais' : 'Menos'} gente, ${n2 > n1 ? 'menos' : 'mais'} cada um paga: são grandezas inversamente proporcionais.`);
  },
  () => {
    const taxa = R.pick([4.8, 5, 5.2, 5.5, 6]);
    const d = R.pick([10, 20, 30, 40, 50, 80, 100]);
    const ans = r2(d * taxa);
    return Q('Proporção e regra de três', 'medio',
      `💱 Para uma viagem, a família precisa comprar dólares. Se 1 dólar custa ${brl(taxa)}, quantos reais são necessários para comprar ${d} dólares?`,
      ans, [r2(d / taxa), r2(d + taxa), r2(ans + taxa * 10), d * 5], brl,
      `É uma proporção: 1 dólar custa ${brl(taxa)}. Então ${d} dólares custam ${d} × ${brl(taxa)} = ${brl(ans)}.`);
  },
  () => {
    const [n1, n2] = R.shuffle(NOMES).slice(0, 2);
    let a, b; do { a = R.pick([20, 30, 40, 50, 60]); b = R.pick([20, 30, 40, 50, 60]); } while (a === b);
    const k = R.pick([2, 3, 4]);
    const L = (a + b) * k, ans = a * k;
    return Q('Proporção e regra de três', 'dificil',
      `🤝 ${n1} e ${n2} montaram uma barraca de sucos. ${n1} investiu ${brl(a)} e ${n2}, ${brl(b)}. O lucro foi de ${brl(L)}. Dividindo o lucro de forma proporcional ao que cada um investiu, quanto ${n1} recebe?`,
      ans, [L / 2, b * k, L - a, a], brl,
      `Total investido: ${brl(a)} + ${brl(b)} = ${brl(a + b)}. Cada real investido rendeu ${brl(L)} ÷ ${a + b} = ${brl(k)}. ${n1}: ${a} × ${brl(k)} = ${brl(ans)}.`);
  },
  () => {
    const kmL = R.pick([10, 12, 15]), lit = R.int(3, 10), km = kmL * lit;
    const preco = R.pick([5.5, 6, 6.5]);
    const ans = r2(lit * preco);
    return Q('Proporção e regra de três', 'dificil',
      `⛽ Um carro anda ${kmL} km com 1 litro de gasolina, e o litro custa ${brl(preco)}. Quanto se gasta de gasolina numa viagem de ${km} km?`,
      ans, [r2(km * preco), lit, r2(ans + preco), r2(km / preco)], brl,
      `Litros necessários: ${km} ÷ ${kmL} = ${lit} litros. Custo: ${lit} × ${brl(preco)} = ${brl(ans)}.`);
  },
];

/* ---------------- LUCRO E PREJUÍZO ---------------- */
const G_LUCRO = [
  () => {
    const nome = R.pick(NOMES), c = 10 * R.int(2, 8), v = c + 5 * R.int(2, 10);
    return Q('Lucro e prejuízo', 'facil',
      `🧁 ${nome} gastou ${brl(c)} com ingredientes para fazer bolos e vendeu todos por ${brl(v)}. Qual foi o lucro?`,
      v - c, [v + c, v, c, v - c + 5], brl,
      `Lucro = valor da venda − custo = ${brl(v)} − ${brl(c)} = ${brl(v - c)}.`);
  },
  () => {
    const custo = R.pick([0.5, 0.8, 1, 1.2]), venda = R.pick([2, 2.5, 3]), n = R.pick([20, 30, 40, 50, 60]);
    const u = r2(venda - custo), ans = r2(n * u);
    return Q('Lucro e prejuízo', 'medio',
      `🍬 Cada brigadeiro custa ${brl(custo)} para fazer e é vendido por ${brl(venda)}. Vendendo ${n} brigadeiros, qual é o lucro?`,
      ans, [n * venda, n * custo, u, ans + 10], brl,
      `Lucro por brigadeiro: ${brl(venda)} − ${brl(custo)} = ${brl(u)}. Em ${n} brigadeiros: ${n} × ${brl(u)} = ${brl(ans)}. Cuidado: os ${brl(n * venda)} recebidos são o faturamento, não o lucro!`);
  },
  () => {
    const c = 10 * R.int(3, 20), p = R.pick([10, 20, 25, 30, 40, 50]);
    const v = c * (1 + p / 100);
    const prod = R.pick(PRODUTOS);
    return Q('Lucro e prejuízo', 'medio',
      `🏪 Uma loja paga ${brl(c)} por ${prod.um} e quer vender com lucro de ${p}% sobre o custo. Qual deve ser o preço de venda?`,
      v, [c * p / 100, c + p, c * (1 - p / 100), v + 10], brl,
      `Lucro: ${p}% de ${brl(c)} = ${brl(c * p / 100)}. Preço de venda: ${brl(c)} + ${brl(c * p / 100)} = ${brl(v)}.`);
  },
  () => {
    const c = R.pick([20, 40, 50, 80, 100, 200]), p = R.pick([10, 20, 25, 40, 50, 60, 75]);
    const v = c * (1 + p / 100);
    return Q('Lucro e prejuízo', 'dificil',
      `📈 Um produto custou ${brl(c)} e foi vendido por ${brl(v)}. Qual foi a porcentagem de lucro sobre o custo?`,
      p, [r2((v - c) / v * 100), v - c, p / 2, 100 - p], pc,
      `Lucro em reais: ${brl(v)} − ${brl(c)} = ${brl(v - c)}. Sobre o custo: ${brl(v - c)} ÷ ${brl(c)} × 100 = ${pc(p)}.`);
  },
  () => {
    const nome = R.pick(NOMES), prod = R.pick(PRODUTOS);
    const c = 10 * R.int(5, 30);
    let v; do { v = 10 * R.int(3, 35); } while (v === c);
    const lucro = v > c, dif = Math.abs(v - c);
    const frase = (eLucro, valor) => `${eLucro ? 'Lucro' : 'Prejuízo'} de ${brl(valor)}`;
    return Q('Lucro e prejuízo', 'medio',
      `🔁 ${nome} comprou ${prod.um} usad${prod.f ? 'a' : 'o'} por ${brl(c)} e depois vendeu por ${brl(v)}. Teve lucro ou prejuízo? De quanto?`,
      frase(lucro, dif), [frase(!lucro, dif), frase(lucro, v + c), frase(!lucro, v + c)], txt,
      `Vendeu por ${lucro ? 'mais' : 'menos'} do que pagou. A diferença é ${brl(dif)}, então foi ${lucro ? 'lucro' : 'prejuízo'} de ${brl(dif)}.`);
  },
  () => {
    const nome = R.pick(NOMES), m = R.pick([2, 3, 4, 5]), c = R.pick([1, 2, 3]), k = R.int(6, 20);
    const v = c + m, F = m * k;
    return Q('Lucro e prejuízo', 'dificil',
      `🧺 Para ter uma barraca na feira, ${nome} paga ${brl(F)} de aluguel por dia. Cada suco custa ${brl(c)} para fazer e é vendido por ${brl(v)}. Quantos sucos precisa vender no dia para não ter prejuízo?`,
      k, [Math.ceil(F / v), k + 1, k * 2, Math.ceil(F / c)], unid('suco', 'sucos'),
      `Cada suco deixa ${brl(v)} − ${brl(c)} = ${brl(m)} de lucro. Para pagar o aluguel: ${brl(F)} ÷ ${brl(m)} = ${k} sucos. A partir daí, cada suco vendido é lucro!`);
  },
];

/* ---------------- TROCO E DIVISÃO DE CONTAS ---------------- */
const G_TROCO = [
  () => {
    const preco = r2(R.int(4, 17) + R.pick([0, 0.25, 0.5, 0.75, 0.9]));
    const nota = R.pick([20, 50]);
    const ans = r2(nota - preco);
    return Q('Troco e divisão de contas', 'facil',
      `💵 Seu lanche custou ${brl(preco)} e você pagou com uma nota de ${brl(nota)}. Quanto deve receber de troco?`,
      ans, [preco, r2(nota + preco), r2(ans + 1), r2(ans - 0.5)], brl,
      `Troco = valor pago − preço = ${brl(nota)} − ${brl(preco)} = ${brl(ans)}. Confira sempre o troco!`);
  },
  () => {
    const v = R.pick([40, 48, 50, 60, 72, 80, 90]);
    const n = R.pick([2, 3, 4, 5, 6].filter(x => (v * 110) % x === 0));
    const total = r2(v * 1.1), ans = r2(total / n);
    return Q('Troco e divisão de contas', 'medio',
      `🍕 A conta de ${R.pick(COMIDAS)} da turma deu ${brl(v)}, mais 10% de taxa de serviço. Dividindo igualmente entre ${n} amigos, quanto cada um paga?`,
      ans, [r2(v / n), total, r2(v / n + 10 / n), r2(ans + 1)], brl,
      `Taxa: 10% de ${brl(v)} = ${brl(v * 0.1)}. Total: ${brl(v)} + ${brl(v * 0.1)} = ${brl(total)}. Por pessoa: ${brl(total)} ÷ ${n} = ${brl(ans)}.`);
  },
  () => {
    const nomes = R.shuffle(NOMES).slice(0, 4);
    const vals = nomes.map(() => R.int(8, 25));
    const soma = vals.reduce((s, x) => s + x, 0), ans = soma / 4;
    return Q('Troco e divisão de contas', 'medio',
      `🧾 Quatro amigos foram à lanchonete: ${lista(nomes.map((n, k) => `${n} pediu ${brl(vals[k])}`))}. Se dividirem a conta igualmente, quanto cada um paga?`,
      ans, [soma, Math.max(...vals), Math.min(...vals), ans + 2], brl,
      `Total: ${vals.map(brl).join(' + ')} = ${brl(soma)}. Dividindo por 4: ${brl(soma)} ÷ 4 = ${brl(ans)}.`);
  },
  () => {
    const [n1, n2] = R.shuffle(NOMES).slice(0, 2);
    let a, b; do { a = 2 * R.int(10, 40); b = 2 * R.int(5, 30); } while (a <= b);
    const cada = (a + b) / 2, ans = cada - b;
    return Q('Troco e divisão de contas', 'dificil',
      `📲 ${n1} e ${n2} vão dividir igualmente as compras da festa. ${n1} pagou ${brl(a)} e ${n2} pagou ${brl(b)}. Quanto ${n2} precisa mandar por Pix para ${n1} para ficar justo?`,
      ans, [a - b, a / 2, b / 2, cada], brl,
      `Total: ${brl(a)} + ${brl(b)} = ${brl(a + b)}. Cada um deveria pagar ${brl(cada)}. ${n2} pagou ${brl(b)}, então falta ${brl(cada)} − ${brl(b)} = ${brl(ans)}.`);
  },
  () => {
    const M = R.pick([20, 50, 100]), n = R.pick([2, 3, 4]);
    let p, total; do { p = r2(R.int(4, Math.floor(M / n) + 6) + R.pick([0.5, 0.9, 0.99])); total = r2(n * p); } while (total === M);
    const ok = total < M, dif = r2(Math.abs(M - total));
    const frase = (bom, v) => bom ? `Dá, e ainda sobram ${brl(v)}` : `Não dá, faltam ${brl(v)}`;
    let errado = r2(Math.abs(M - n * Math.floor(p)));
    if (errado === dif) errado = r2(dif + 1);
    return Q('Troco e divisão de contas', 'medio',
      `🛍️ Você tem ${brl(M)} e quer comprar ${n} pacotes de figurinhas de ${brl(p)} cada. Dá para comprar? Sobra ou falta quanto?`,
      frase(ok, dif), [frase(!ok, dif), frase(ok, errado), frase(ok, r2(dif + 10))], txt,
      `${n} × ${brl(p)} = ${brl(total)}. ${ok ? `Sobram ${brl(M)} − ${brl(total)} = ${brl(dif)}.` : `Faltam ${brl(total)} − ${brl(M)} = ${brl(dif)}.`}`);
  },
  () => {
    const v = R.pick([40, 50, 60, 70, 80, 90, 120]), t = r2(v * 1.1);
    return Q('Troco e divisão de contas', 'dificil',
      `🍽️ A conta do restaurante, já com 10% de taxa de serviço, deu ${brl(t)}. Qual era o valor da conta sem a taxa?`,
      v, [r2(t * 0.9), r2(t - 10), r2(t * 1.1), v - 5], brl,
      `Com a taxa, a conta é 110% do valor original. Então: ${brl(t)} ÷ 1,1 = ${brl(v)}. Tirar 10% de ${brl(t)} daria ${brl(t * 0.9)}, que está errado!`);
  },
];

/* ---------------- PREÇO POR MEDIDA ---------------- */
const G_UNIDADES = [
  () => {
    const kg = R.pick([2, 5]), u = R.pick([4.5, 5, 5.5, 6, 6.5]), total = r2(kg * u);
    return Q('Preço por medida', 'facil',
      `🍚 Um pacote de ${kg} kg de arroz custa ${brl(total)}. Qual é o preço de cada quilo?`,
      u, [total, r2(u + 1), r2(total / 10), r2(u - 0.5)], brl,
      `Preço do quilo: ${brl(total)} ÷ ${kg} = ${brl(u)}.`);
  },
  () => {
    const it = R.pick([
      { n: 'o queijo coalho', e: '🧀', kg: [40, 48, 60] }, { n: 'a carne de sol', e: '🥩', kg: [40, 50, 60] },
      { n: 'a castanha de caju', e: '🥜', kg: [60, 80, 100] }, { n: 'o camarão', e: '🦐', kg: [50, 60, 80] },
    ]);
    const pk = R.pick(it.kg), g = R.pick([100, 200, 250, 300, 500, 750]);
    const ans = r2(pk * g / 1000);
    return Q('Preço por medida', 'medio',
      `${it.e} Na feira, ${it.n} custa ${brl(pk)} o quilo. Quanto você paga por ${g} g?`,
      ans, [r2(pk * g / 100), r2(ans * 2), r2(pk - ans), r2(ans / 10)], brl,
      `1 kg = 1.000 g, então ${g} g = ${num(g / 1000)} kg. Preço: ${num(g / 1000)} × ${brl(pk)} = ${brl(ans)}.`);
  },
  () => {
    const beb = R.pick([{ n: 'refrigerante', m: 'O mesmo' }, { n: 'suco de caju', m: 'O mesmo' }, { n: 'água de coco', m: 'A mesma' }]);
    const L1 = R.pick([1, 1.5, 2]), u1 = R.pick([3, 3.5, 4, 4.5, 5]);
    const ml = R.pick([200, 250, 350, 500]);
    let u2; do { u2 = R.pick([2.5, 3, 6, 8, 10]); } while (u2 === u1 || !Number.isInteger(ml * u2 / 10));
    const p1 = r2(L1 * u1), p2 = r2(ml / 1000 * u2);
    const A = `A embalagem de ${num(L1)} L`, B = `A embalagem de ${ml} mL`;
    const melhorA = u1 < u2;
    const [mN, pN] = melhorA ? [A, B] : [B, A];
    const [mu, pu] = melhorA ? [u1, u2] : [u2, u1];
    return Q('Preço por medida', 'dificil',
      `🥤 ${beb.m} ${beb.n} é vendid${beb.m === 'A mesma' ? 'a' : 'o'} em duas embalagens:\n• ${num(L1)} L por ${brl(p1)}\n• ${ml} mL por ${brl(p2)}\nQual tem o menor preço por litro?`,
      `${mN}: ${brl(mu)} por litro`, [`${pN}: ${brl(pu)} por litro`, `${pN}: ${brl(mu)} por litro`, `${mN}: ${brl(pu)} por litro`], txt,
      `${num(L1)} L: ${brl(p1)} ÷ ${num(L1)} = ${brl(u1)} por litro. ${ml} mL = ${num(ml / 1000)} L: ${brl(p2)} ÷ ${num(ml / 1000)} = ${brl(u2)} por litro. O menor preço por litro é ${brl(mu)}.`);
  },
  () => {
    const g = R.pick([200, 250, 400, 500, 800]), u = R.pick([0.8, 1.2, 1.5, 2, 2.5]);
    const p = r2(g / 100 * u);
    const prod = R.pick(['café', 'biscoito', 'cereal', 'feijão']);
    return Q('Preço por medida', 'medio',
      `🛒 Um pacote de ${g} g de ${prod} custa ${brl(p)}. Qual é o preço de cada 100 g?`,
      u, [p, r2(u * 10), r2(u + 0.5), r2(p / 2)], brl,
      `${g} g são ${num(g / 100)} partes de 100 g. ${brl(p)} ÷ ${num(g / 100)} = ${brl(u)} a cada 100 g. Muitos mercados mostram esse "preço por 100 g" na etiqueta da prateleira!`);
  },
  () => {
    const d = R.pick([0.2, 0.25, 0.5]);
    const g1 = R.pick([200, 250, 500, 1000].filter(x => Number.isInteger(x * (1 - d))));
    const g2 = g1 * (1 - d), p = R.pick([4, 5, 6, 8, 10]);
    const ans = r2((g1 / g2 - 1) * 100);
    return Q('Preço por medida', 'dificil',
      `🍪 Um pacote de biscoito tinha ${num(g1)} g e custava ${brl(p)}. Agora tem ${num(g2)} g e continua custando ${brl(p)}. Em quantos por cento o preço por grama aumentou?`,
      ans, [d * 100, r2(ans / 2), r2(ans + 10), 100 - d * 100], pc,
      `Antes: ${brl(p)} por ${num(g1)} g. Agora: ${brl(p)} por ${num(g2)} g. O preço por grama ficou ${fator(g1 / g2)} vezes maior: aumento de ${pc(ans)}, e não de ${pc(d * 100)}. Isso é a reduflação: o preço é o mesmo, mas vem menos produto!`);
  },
  () => {
    const p = R.pick([12, 14, 15, 16, 18]), desc = R.pick([4, 6, 8, 10]), grande = 4 * p - desc;
    return Q('Preço por medida', 'medio',
      `🥜 Castanha de caju: o pacote de 250 g custa ${brl(p)} e o pacote de 1 kg custa ${brl(grande)}. Quanto se economiza comprando o pacote de 1 kg em vez de 4 pacotes pequenos?`,
      desc, [4 * p, grande - p, p - desc, desc * 4], brl,
      `1 kg = 4 × 250 g. Quatro pacotes pequenos: 4 × ${brl(p)} = ${brl(4 * p)}. Economia: ${brl(4 * p)} − ${brl(grande)} = ${brl(desc)}. Mas só vale a pena se você for usar tudo!`);
  },
];

/* ---------------- MÉDIA, MODA E MEDIANA ---------------- */
const G_MEDIA = [
  () => {
    const nome = R.pick(NOMES);
    const v = Array.from({ length: 4 }, () => 5 * R.int(2, 8));
    const soma = v.reduce((s, x) => s + x, 0), ans = soma / 4;
    return Q('Média, moda e mediana', 'facil',
      `🥤 Nas últimas 4 semanas, ${nome} gastou ${lista(v.map(brl))} com lanche. Qual foi o gasto médio por semana?`,
      ans, [soma, Math.max(...v), Math.min(...v), ans + 5], brl,
      `Média = soma ÷ quantidade. ${v.map(brl).join(' + ')} = ${brl(soma)}. ${brl(soma)} ÷ 4 = ${brl(ans)}.`);
  },
  () => {
    const m = R.int(35, 41);
    const outros = R.shuffle([34, 35, 36, 37, 38, 39, 40, 41, 42].filter(x => x !== m)).slice(0, 3);
    const nums = R.shuffle([m, m, m, outros[0], outros[0], outros[1], outros[2]]);
    return Q('Média, moda e mediana', 'medio',
      `👟 Uma loja anotou os números dos tênis vendidos no sábado: ${nums.join(', ')}. Qual é a moda desses números?`,
      m, outros, num,
      `A moda é o valor que mais aparece. O número ${m} aparece 3 vezes, mais que qualquer outro. A loja deve ter mais tênis desse número no estoque!`);
  },
  () => {
    const prod = R.pick(PRODUTOS);
    let precos;
    do {
      precos = R.shuffle([...new Set(Array.from({ length: 8 }, () => 5 * R.int(10, 30)))]).slice(0, 5);
    } while (precos.length < 5 || [...precos].sort((a, b) => a - b)[2] === precos[2]);
    const ord = [...precos].sort((a, b) => a - b), mediana = ord[2];
    const media = r2(precos.reduce((s, x) => s + x, 0) / 5);
    return Q('Média, moda e mediana', 'medio',
      `🔎 O preço de ${prod.um} em 5 lojas é: ${lista(precos.map(brl))}. Qual é a mediana desses preços?`,
      mediana, [precos[2], media, Math.max(...precos), Math.min(...precos)], brl,
      `A mediana é o valor do meio depois de colocar em ordem: ${ord.map(brl).join(' < ')}. O do meio é ${brl(mediana)}. Atenção: primeiro é preciso ordenar!`);
  },
  () => {
    const nome = R.pick(NOMES);
    const v = Array.from({ length: 3 }, () => 5 * R.int(2, 6));
    const x = 5 * R.int(3, 12);
    const ja = v[0] + v[1] + v[2], T = (ja + x) / 4;
    return Q('Média, moda e mediana', 'dificil',
      `🐷 Nas 3 primeiras semanas do mês, ${nome} guardou ${lista(v.map(brl))}. Quanto precisa guardar na 4ª semana para que a média das 4 semanas seja ${brl(T)}?`,
      x, [T, r2(3 * T - ja), x + 5, r2(ja / 3)], brl,
      `Para ter média ${brl(T)} em 4 semanas, a soma precisa ser 4 × ${brl(T)} = ${brl(4 * T)}. Já tem ${brl(ja)}. Falta: ${brl(4 * T)} − ${brl(ja)} = ${brl(x)}.`);
  },
  () => {
    let n1, n2, a, b;
    do {
      n1 = R.int(1, 4); n2 = R.int(1, 4); a = 5 * R.int(4, 10); b = 5 * R.int(4, 10);
    } while (n1 === n2 || a === b || (n1 * a + n2 * b) % (n1 + n2) !== 0);
    const total = n1 * a + n2 * b, ans = total / (n1 + n2);
    const s = n => (n > 1 ? 's' : '');
    return Q('Média, moda e mediana', 'dificil',
      `👕 Para o time da escola, compraram ${n1} camiseta${s(n1)} de ${brl(a)} e ${n2} camiseta${s(n2)} de ${brl(b)}. Qual foi o preço médio de cada camiseta?`,
      ans, [r2((a + b) / 2), total, Math.max(a, b), ans + 5], brl,
      `Total gasto: ${n1} × ${brl(a)} + ${n2} × ${brl(b)} = ${brl(total)}. Total de camisetas: ${n1 + n2}. Média: ${brl(total)} ÷ ${n1 + n2} = ${brl(ans)}. Não dá para fazer só (${brl(a)} + ${brl(b)}) ÷ 2, porque as quantidades são diferentes!`);
  },
  () => {
    const v = MESES.map(() => 5 * R.int(3, 12));
    const soma = v.reduce((s, x) => s + x, 0), ans = soma / 5;
    const visual = tabelaHTML('Gasto com recarga de celular', ['Mês', 'Gasto'], MESES.map((m, k) => [m, brl(v[k])]));
    return QV(visual, 'Média, moda e mediana', 'medio',
      '📋 A tabela mostra quanto uma família gastou com recarga de celular em 5 meses. Qual foi o gasto médio por mês?',
      ans, [soma, Math.max(...v), ans + 5, [...v].sort((a, b) => a - b)[2]], brl,
      `Soma: ${v.map(brl).join(' + ')} = ${brl(soma)}. Média: ${brl(soma)} ÷ 5 = ${brl(ans)}.`);
  },
];

/* ---------------- CONTAS DA CASA ---------------- */
const G_CONTAS = [
  () => {
    const t = R.pick([0.7, 0.8, 0.9, 1]), k = R.pick([100, 120, 150, 180, 200, 250]);
    const ans = r2(t * k);
    return Q('Contas da casa', 'facil',
      `💡 A conta de luz cobra ${brl(t)} por kWh (quilowatt-hora). Uma casa consumiu ${k} kWh no mês. Quanto vai pagar?`,
      ans, [k, r2(k / t), r2(ans + 10), r2(ans * 2)], brl,
      `Valor = consumo × preço do kWh = ${k} × ${brl(t)} = ${brl(ans)}.`);
  },
  () => {
    const W = R.pick([50, 100, 150, 200]), h = R.int(2, 8);
    const kwh = r2(W * h * 30 / 1000);
    const ap = R.pick([['uma TV', '📺', 'ligada'], ['um videogame', '🎮', 'ligado'], ['um computador', '💻', 'ligado']]);
    return Q('Contas da casa', 'dificil',
      `${ap[1]} ${ap[0][0].toUpperCase() + ap[0].slice(1)} de ${W} W (watts) fica ${ap[2]} ${h} horas por dia. Quantos kWh gasta em 30 dias? (Lembre: 1 kW = 1.000 W)`,
      kwh, [W * h * 30, r2(W * h / 1000), r2(kwh * 10), r2(kwh / 2)], unid('kWh', 'kWh'),
      `Por dia: ${W} W × ${h} h = ${num(W * h)} Wh. Em 30 dias: ${num(W * h * 30)} Wh. Dividindo por 1.000: ${num(kwh)} kWh.`);
  },
  () => {
    const t1 = R.pick([10, 15, 20]), t2 = R.pick([5, 8]), vz = R.pick([6, 8, 9, 10, 12]);
    const ans = (t1 - t2) * vz;
    return Q('Contas da casa', 'medio',
      `🚿 O chuveiro gasta ${vz} litros de água por minuto. Se você diminuir o banho de ${t1} para ${t2} minutos, quantos litros economiza em cada banho?`,
      ans, [t1 * vz, t2 * vz, t1 - t2, ans + vz], unid('litro', 'litros'),
      `Minutos a menos: ${t1} − ${t2} = ${t1 - t2}. Economia: ${t1 - t2} × ${vz} = ${ans} litros por banho. Bom para o planeta e para a conta de água!`);
  },
  () => {
    const v = R.pick([80, 100, 120, 150, 200]), p = R.pick([5, 8, 10, 12, 15]);
    const ans = r2(v * (1 + p / 100));
    return Q('Contas da casa', 'medio',
      `🚩 Com a bandeira tarifária vermelha, a conta de luz de uma família, que era ${brl(v)}, ficou ${p}% mais cara. Qual é o novo valor?`,
      ans, [r2(v * p / 100), v + p, r2(v * (1 - p / 100)), r2(ans + 10)], brl,
      `Aumento: ${p}% de ${brl(v)} = ${brl(v * p / 100)}. Novo valor: ${brl(v)} + ${brl(v * p / 100)} = ${brl(ans)}. A bandeira vermelha avisa que gerar energia ficou mais caro: hora de economizar!`);
  },
  () => {
    const n = R.int(3, 6), W2 = R.pick([8, 9, 10]), h = R.int(3, 6), t = R.pick([0.8, 1]);
    const kwh = n * (60 - W2) * h * 30 / 1000, ans = r2(kwh * t);
    return Q('Contas da casa', 'dificil',
      `💡 Uma casa trocou ${n} lâmpadas comuns de 60 W por lâmpadas de LED de ${W2} W. Elas ficam acesas ${h} horas por dia. Com o kWh a ${brl(t)}, quanto a família economiza em 30 dias?`,
      ans, [r2(n * 60 * h * 30 / 1000 * t), r2(kwh), r2(ans * 2), r2(ans / n)], brl,
      `Cada lâmpada gasta ${60 - W2} W a menos. Economia por dia: ${n} × ${60 - W2} W × ${h} h = ${num(n * (60 - W2) * h)} Wh. Em 30 dias: ${num(kwh)} kWh. Em reais: ${num(kwh)} × ${brl(t)} = ${brl(ans)}.`);
  },
  () => {
    const al = 50 * R.int(8, 14), luz = 10 * R.int(8, 18), ag = 10 * R.int(5, 10), net = R.pick([80, 90, 100, 120]);
    const ans = al + luz + ag + net;
    return Q('Contas da casa', 'facil',
      `🏠 As contas fixas de uma casa no mês são: aluguel ${brl(al)}, luz ${brl(luz)}, água ${brl(ag)} e internet ${brl(net)}. Qual é o total?`,
      ans, [ans - net, ans + 100, al + luz, ans - ag], brl,
      `${brl(al)} + ${brl(luz)} + ${brl(ag)} + ${brl(net)} = ${brl(ans)}.`);
  },
];

/* ---------------- CASHBACK E PONTOS ---------------- */
const G_CASHBACK = [
  () => {
    const p = R.pick([2, 3, 5, 10]), v = R.pick([40, 60, 80, 100, 120, 150, 200]);
    const ans = r2(v * p / 100);
    return Q('Cashback e pontos', 'facil',
      `💸 Um aplicativo devolve ${p}% de cashback (dinheiro de volta) nas compras. Numa compra de ${brl(v)}, quanto volta?`,
      ans, [r2(v - ans), r2(ans * 10), p, r2(ans * 2)], brl,
      `${p}% de ${brl(v)} = ${p}/100 × ${brl(v)} = ${brl(ans)}.`);
  },
  () => {
    const v = 20 * R.int(5, 15), d = 5 * R.int(2, 6), c = R.pick([10, 15, 20]);
    return Q('Cashback e pontos', 'medio',
      `🤔 Numa compra de ${brl(v)}, a Loja A dá ${brl(d)} de desconto na hora. A Loja B dá ${c}% de cashback, mas só para usar numa próxima compra na mesma loja. Se você NÃO pretende comprar de novo, qual é a melhor escolha?`,
      'Loja A: o desconto vale agora, e o cashback só serve se você comprar de novo',
      [`Loja B: ${c}% sempre vale mais que qualquer desconto`, 'As duas são iguais, porque as duas devolvem dinheiro', 'Loja B: cashback é dinheiro que vai direto para o seu bolso'], txt,
      `O cashback da Loja B (${brl(v * c / 100)}) só vale se você gastar de novo naquela loja. Para quem não vai voltar, o desconto de ${brl(d)} na hora é melhor. O cashback é uma estratégia para fazer o cliente comprar mais!`);
  },
  () => {
    const ppr = R.pick([1, 2, 3]);
    const pts = R.pick([1200, 1500, 3000, 4500, 6000]);
    const ans = pts / ppr, s = ppr > 1 ? 's' : '';
    return Q('Cashback e pontos', 'medio',
      `🎧 Um programa de pontos dá ${ppr} ponto${s} a cada R$ 1,00 gasto. Para trocar por um fone, são precisos ${num(pts)} pontos. Quanto é preciso gastar para juntar esses pontos?`,
      ans, [pts * ppr, pts, r2(ans / 2), ans + 100], brl,
      `${num(pts)} pontos ÷ ${ppr} ponto${s} por real = ${brl(ans)}. Gastar ${brl(ans)} só para ganhar um fone quase nunca compensa!`);
  },
  () => {
    const v = R.pick([100, 150, 200, 300, 400]), d = R.pick([5, 10]), c = R.pick([5, 10]);
    const pago = r2(v * (1 - d / 100)), volta = r2(pago * c / 100), ans = r2(pago - volta);
    return Q('Cashback e pontos', 'dificil',
      `📲 Um fone custa ${brl(v)}. Pagando no Pix, tem ${d}% de desconto. Depois, o app ainda devolve ${c}% de cashback sobre o valor pago. Quanto o fone custa de verdade, no final?`,
      ans, [r2(v * (1 - (d + c) / 100)), pago, r2(v - v * c / 100), r2(ans + 5)], brl,
      `Com desconto: ${brl(v)} − ${d}% = ${brl(pago)}. Cashback: ${c}% de ${brl(pago)} = ${brl(volta)}. Custo final: ${brl(pago)} − ${brl(volta)} = ${brl(ans)}. Não é a mesma coisa que somar ${d}% + ${c}%!`);
  },
  () => {
    const v = R.pick([80, 120, 150, 200, 240, 300]), p = R.pick([2, 4, 5, 10]);
    const c = r2(v * p / 100);
    return Q('Cashback e pontos', 'medio',
      `🧾 Numa compra de ${brl(v)}, você recebeu ${brl(c)} de cashback. Qual foi a porcentagem de cashback?`,
      p, [c, r2(v / c), p * 10, p + 1], pc,
      `Porcentagem = parte ÷ todo × 100 = ${brl(c)} ÷ ${brl(v)} × 100 = ${pc(p)}.`);
  },
  () => {
    let pA, c, pB, efA;
    do {
      pA = 20 * R.int(10, 25); c = R.pick([5, 10]);
      pB = pA - R.pick([5, 10, 15, 20, 25, 30]);
      efA = r2(pA * (1 - c / 100));
    } while (efA === pB);
    const aMelhor = efA < pB, dif = r2(Math.abs(efA - pB));
    const [lA, lB] = R.shuffle(LOJAS);
    const melhor = aMelhor ? lA : lB, pior = aMelhor ? lB : lA;
    return Q('Cashback e pontos', 'dificil',
      `🛒 O mesmo tênis:\n• ${lA}: ${brl(pA)} com ${c}% de cashback\n• ${lB}: ${brl(pB)} sem cashback\nContando o cashback (você vai usar), qual sai mais barato e por quanto?`,
      `${melhor}, ${brl(dif)} mais barato`, [`${pior}, ${brl(dif)} mais barato`, `${melhor}, ${brl(r2(dif + 5))} mais barato`, `${pior}, ${brl(r2(dif + 5))} mais barato`], txt,
      `${lA}: ${brl(pA)} − ${c}% de cashback = ${brl(efA)}. ${lB}: ${brl(pB)}. Diferença: ${brl(dif)} a favor da ${melhor}.`);
  },
];

/* ---------------- JUROS COMPOSTOS ---------------- */
const G_COMPOSTOS = [
  () => {
    const c = R.pick([100, 200, 500, 1000, 2000]), i = R.pick([5, 10, 20]);
    const m1 = c * (1 + i / 100), m2 = r2(m1 * (1 + i / 100));
    return Q('Juros compostos', 'medio',
      `🌱 Você aplicou ${brl(c)} a juros compostos de ${i}% ao mês. Quanto terá depois de 2 meses?`,
      m2, [c * (1 + 2 * i / 100), m1, r2(m2 + c * i / 100), c * i / 100 * 2], brl,
      `1º mês: ${brl(c)} + ${i}% = ${brl(m1)}. 2º mês: ${brl(m1)} + ${i}% = ${brl(m2)}. Nos juros compostos, os juros do 2º mês são calculados sobre ${brl(m1)}, e não sobre ${brl(c)}.`);
  },
  () => Q('Juros compostos', 'facil',
    '🔁 Nos juros compostos ("juros sobre juros"), os juros de cada mês são calculados sobre:',
    'O valor do mês anterior, já com os juros somados', ['Sempre só o valor inicial', 'Só os juros do mês anterior', 'Um valor sorteado pelo banco'], txt,
    'Nos juros simples, os juros são sempre sobre o valor inicial. Nos compostos, os juros de cada mês entram na conta e passam a render também.'),
  () => {
    const c = R.pick([500, 1000, 2000]), i = R.pick([10, 20]);
    const f = (1 + i / 100) ** 3, m = r2(c * f);
    return Q('Juros compostos', 'dificil',
      `📈 Uma aplicação de ${brl(c)} rende ${i}% ao mês, em juros compostos. Qual será o valor depois de 3 meses?`,
      m, [c * (1 + 3 * i / 100), r2(c * (1 + i / 100) ** 2), r2(m + c * i / 100), c * 3 * i / 100], brl,
      `Mês 1: ${brl(c * (1 + i / 100))}. Mês 2: ${brl(c * (1 + i / 100) ** 2)}. Mês 3: ${brl(m)}. Atalho: ${brl(c)} × ${fator(1 + i / 100)}³ = ${brl(c)} × ${fator(f)} = ${brl(m)}.`);
  },
  () => {
    const c = R.pick([1000, 2000, 5000]), i = R.pick([10, 20]);
    const comp = r2(c * (1 + i / 100) ** 3), simp = c * (1 + 3 * i / 100), ans = r2(comp - simp);
    return Q('Juros compostos', 'dificil',
      `⚖️ ${brl(c)} ficam aplicados por 3 meses a ${i}% ao mês. Quanto rendem A MAIS nos juros compostos do que nos juros simples?`,
      ans, [r2(comp - c), r2(simp - c), r2(ans * 2), c * i / 100], brl,
      `Simples: ${brl(c)} + 3 × ${i}% = ${brl(simp)}. Compostos: ${brl(c)} × ${fator(1 + i / 100)}³ = ${brl(comp)}. Diferença: ${brl(comp)} − ${brl(simp)} = ${brl(ans)}. Quanto mais tempo, maior a diferença!`);
  },
  () => {
    const c = R.pick([100, 200, 300, 400, 500]), i = R.pick([10, 12, 15]);
    const m1 = r2(c * (1 + i / 100)), m2 = r2(c * (1 + i / 100) ** 2);
    return Q('Juros compostos', 'medio',
      `💳 Uma dívida de ${brl(c)} no cartão de crédito cresce ${i}% ao mês (juros compostos). Quanto será a dívida depois de 2 meses sem pagar?`,
      m2, [c * (1 + 2 * i / 100), m1, r2(c * i / 100 * 2), r2(m2 + 10)], brl,
      `1º mês: ${brl(c)} + ${i}% = ${brl(m1)}. 2º mês: ${brl(m1)} + ${i}% = ${brl(m2)}. É por isso que dívida de cartão cresce tão rápido!`);
  },
  () => {
    const i = R.pick([5, 10, 20]);
    const f2 = (1 + i / 100) ** 2;
    return Q('Juros compostos', 'medio',
      `✖️ Em juros compostos de ${i}% ao mês, por quanto um valor fica multiplicado depois de 2 meses?`,
      fator(f2), [fator(1 + 2 * i / 100), fator(1 + i / 100), fator(2 * (1 + i / 100))], txt,
      `Cada mês multiplica por ${fator(1 + i / 100)}. Em 2 meses: ${fator(1 + i / 100)} × ${fator(1 + i / 100)} = ${fator(f2)}.`);
  },
];

/* ---------------- INFLAÇÃO ---------------- */
const G_INFLACAO = [
  () => {
    const v = R.pick([20, 40, 50, 80, 100, 120]), p = R.pick([4, 5, 6, 10]);
    const ans = r2(v * (1 + p / 100));
    const prod = R.pick(PRODUTOS);
    return Q('Inflação', 'facil',
      `🎈 Com uma inflação de ${p}% no ano, ${prod.um} que custava ${brl(v)} passa a custar quanto?`,
      ans, [r2(v * p / 100), v + p, r2(v * (1 - p / 100)), r2(ans + 5)], brl,
      `Aumento: ${p}% de ${brl(v)} = ${brl(v * p / 100)}. Novo preço: ${brl(v)} + ${brl(v * p / 100)} = ${brl(ans)}.`);
  },
  () => {
    const p0 = R.pick([4, 8, 12, 16, 20]), p1 = p0 * 1.25;
    const M = (p0 * p1 / mdc(p0, p1)) * R.int(1, 3);
    const n0 = M / p0, n1 = M / p1;
    return Q('Inflação', 'medio',
      `🛒 Com ${brl(M)}, você comprava ${n0} pacotes de biscoito de ${brl(p0)}. O preço subiu 25%. Quantos pacotes consegue comprar agora, com os mesmos ${brl(M)}?`,
      n1, [n0, Math.round(n0 * 0.75), n1 + 1, n0 - 1], unid('pacote', 'pacotes'),
      `Novo preço: ${brl(p0)} + 25% = ${brl(p1)}. ${brl(M)} ÷ ${brl(p1)} = ${n1} pacotes (antes eram ${n0}). O dinheiro é o mesmo, mas compra menos: é a perda do poder de compra.`);
  },
  () => {
    const p1 = R.pick([4, 5, 6, 10]), p2 = R.pick([5, 10, 20]);
    const total = r2(((1 + p1 / 100) * (1 + p2 / 100) - 1) * 100);
    return Q('Inflação', 'dificil',
      `📆 A inflação foi de ${p1}% em um ano e de ${p2}% no ano seguinte. Qual foi a inflação acumulada nos dois anos?`,
      total, [p1 + p2, r2(total + 1), r2(p1 * p2 / 100), 100 + p1 + p2], pc,
      `Fatores: ${fator(1 + p1 / 100)} × ${fator(1 + p2 / 100)} = ${fator(1 + total / 100)}. Inflação acumulada: ${pc(total)}. É mais que ${p1 + p2}%, porque a inflação do 2º ano incide sobre preços que já tinham subido.`);
  },
  () => {
    let r, inf; do { r = R.pick([4, 6, 8, 10, 12]); inf = R.pick([3, 5, 6, 9, 11]); } while (r === inf);
    const ganhou = r > inf;
    const ok = 'Ganhou poder de compra: rendeu mais do que a inflação';
    const no = 'Perdeu poder de compra: a inflação foi maior que o rendimento';
    return Q('Inflação', 'medio',
      `🏦 Seu dinheiro guardado rendeu ${r}% em um ano, mas a inflação nesse ano foi de ${inf}%. O que aconteceu com o seu poder de compra?`,
      ganhou ? ok : no, [ganhou ? no : ok, 'Ficou igual: dinheiro guardado nunca perde valor', 'Não dá para saber sem ir ao banco'], txt,
      `Os preços subiram ${inf}% e o seu dinheiro cresceu ${r}%. ${ganhou ? 'Como o rendimento foi maior, você consegue comprar um pouco mais do que antes.' : 'Como os preços subiram mais, você consegue comprar menos do que antes, mesmo tendo mais reais.'}`);
  },
  () => {
    const v0 = R.pick([4, 5, 8, 10]), p = R.pick([10, 20, 25, 50]);
    const v1 = r2(v0 * (1 + p / 100));
    const prod = R.pick(['o quilo do feijão', 'o litro do leite', 'a passagem de ônibus', 'o pacote de café']);
    return Q('Inflação', 'medio',
      `🧾 Em um ano, ${prod} passou de ${brl(v0)} para ${brl(v1)}. Qual foi a inflação desse produto no ano?`,
      p, [r2(v1 - v0), r2((v1 - v0) / v1 * 100), p / 2, 100 + p], pc,
      `Aumento: ${brl(v1)} − ${brl(v0)} = ${brl(v1 - v0)}. Em porcentagem: ${brl(v1 - v0)} ÷ ${brl(v0)} × 100 = ${pc(p)}.`);
  },
  () => {
    const inf = R.pick([25, 60, 100]), v = R.pick([100, 200, 400]);
    const ans = r2(v / (1 + inf / 100));
    return Q('Inflação', 'dificil',
      `⏳ Desde que ${R.pick(NOMES)} nasceu, os preços subiram ${inf}% (inflação acumulada). Hoje, ${brl(v)} compram o mesmo que quantos reais compravam naquela época?`,
      ans, [r2(v * (1 - inf / 100)), r2(v * (1 + inf / 100)), v, r2(ans + 10)], brl,
      `Os preços ficaram ${fator(1 + inf / 100)} vezes maiores. Então ${brl(v)} ÷ ${fator(1 + inf / 100)} = ${brl(ans)}. Cuidado: os preços subirem ${inf}% não é o mesmo que o dinheiro perder ${inf}% do valor!`);
  },
];

/* ---------------- CARTÃO DE CRÉDITO E DÍVIDAS ---------------- */
const G_CREDITO = [
  () => {
    const a = R.int(15, 40), b = R.int(20, 50), c = R.int(10, 60);
    const ans = a + b + c;
    return Q('Cartão de crédito', 'facil',
      `💳 A fatura do cartão de crédito veio com três compras: lanche ${brl(a)}, recarga ${brl(b)} e jogo ${brl(c)}. Qual é o valor total da fatura?`,
      ans, [a + b, ans + 10, ans - c, Math.max(a, b, c)], brl,
      `${brl(a)} + ${brl(b)} + ${brl(c)} = ${brl(ans)}. Cartão de crédito não é dinheiro extra: tudo chega junto na fatura!`);
  },
  () => {
    let L, n, q; do { L = 100 * R.int(4, 10); n = R.pick([3, 4, 5, 6, 10]); q = 5 * R.int(6, 16); } while (L - n * q <= 0);
    const total = n * q, ans = L - total;
    return Q('Cartão de crédito', 'medio',
      `🧮 Seu limite no cartão é ${brl(L)}. Você comprou um fone em ${n}x de ${brl(q)}. Logo depois da compra, quanto sobra de limite para usar?`,
      ans, [L - q, L, total, ans + q], brl,
      `Na compra parcelada, o cartão reserva o valor TOTAL: ${n} × ${brl(q)} = ${brl(total)}. Sobra ${brl(L)} − ${brl(total)} = ${brl(ans)}. O limite vai voltando conforme as parcelas são pagas.`);
  },
  () => {
    const F = 50 * R.int(4, 12), P = 50 * R.int(1, 3), i = R.pick([10, 12, 15]);
    const resto = F - P, ans = r2(resto * (1 + i / 100));
    return Q('Cartão de crédito', 'dificil',
      `⚠️ A fatura do cartão era ${brl(F)}, mas você pagou só ${brl(P)}. Sobre o que ficou faltando, o banco cobra juros do rotativo de ${i}% ao mês. Quanto você vai dever no mês seguinte?`,
      ans, [r2(F * (1 + i / 100)), resto, r2(resto * i / 100), r2(F - P * (1 + i / 100))], brl,
      `Ficou faltando: ${brl(F)} − ${brl(P)} = ${brl(resto)}. Juros: ${i}% de ${brl(resto)} = ${brl(resto * i / 100)}. Nova dívida: ${brl(ans)}, sem contar as compras novas!`);
  },
  () => {
    const r = R.pick([1200, 1500, 2000, 2500, 3000]), p = R.pick([10, 20, 25, 30, 40, 50]);
    const parc = r * p / 100;
    return Q('Cartão de crédito', 'medio',
      `📉 Uma pessoa ganha ${brl(r)} por mês e paga ${brl(parc)} em parcelas. Que porcentagem da renda está comprometida com parcelas?`,
      p, [r2(parc / 100), p / 2, 100 - p, p + 10], pc,
      `${brl(parc)} ÷ ${brl(r)} × 100 = ${pc(p)}. ${p > 30 ? 'Passou de 30%: é um sinal de alerta para o endividamento!' : 'Especialistas recomendam não passar de 30% da renda com dívidas.'}`);
  },
  () => {
    const c = R.pick([100, 200, 500]), i = R.pick([10, 15, 20]);
    let v = c, n = 0; const passos = [];
    while (v <= c * 1.5) { v = r2(v * (1 + i / 100)); n++; passos.push(`${n}º mês: ${brl(v)}`); }
    return Q('Cartão de crédito', 'dificil',
      `❄️ Uma dívida de ${brl(c)} no rotativo do cartão cresce ${i}% ao mês (juros compostos). Depois de quantos meses ela passa de ${brl(c * 1.5)}?`,
      n, [Math.ceil(50 / i), n + 1, n - 1, n + 2], unid('mês', 'meses'),
      `Mês a mês: ${passos.join(' → ')}. No ${n}º mês ela passa de ${brl(c * 1.5)}. A dívida vira uma bola de neve!`);
  },
  () => {
    const F = 50 * R.int(4, 12), n = R.pick([3, 4, 6]), j = R.pick([0.1, 0.15, 0.2]);
    const q = Math.ceil(F * (1 + j) / n), tot = n * q, ans = tot - F;
    return Q('Cartão de crédito', 'medio',
      `🗓️ A fatura do cartão deu ${brl(F)}. O banco oferece parcelar a fatura em ${n}x de ${brl(q)}. Quanto você pagaria a mais parcelando, em vez de pagar tudo agora?`,
      ans, [tot, q, r2(q - F / n), ans * 2], brl,
      `Parcelado: ${n} × ${brl(q)} = ${brl(tot)}. A mais: ${brl(tot)} − ${brl(F)} = ${brl(ans)}. Quando der, pague a fatura inteira: é o jeito mais barato.`);
  },
];

/* ---------------- POUPANÇA E INVESTIMENTOS ---------------- */
const G_RESERVA = [
  () => {
    const g = R.pick([1500, 2000, 2500, 3000]), m = R.pick([3, 6]);
    return Q('Poupança e investimentos', 'facil',
      `🆘 Uma família gasta ${brl(g)} por mês. Para imprevistos, é recomendado ter uma reserva de emergência de ${m} meses de gastos. De quanto deve ser essa reserva?`,
      g * m, [g, g * 12, g * m / 2, g + m * 100], brl,
      `Reserva = gasto do mês × número de meses = ${brl(g)} × ${m} = ${brl(g * m)}.`);
  },
  () => {
    const S = R.pick([800, 1000, 1200, 1500, 2000]), p = R.pick([10, 15, 20]), ja = R.pick([0, 100, 200, 300]), k = R.int(4, 12);
    const porMes = S * p / 100, M = ja + porMes * k;
    return Q('Poupança e investimentos', 'dificil',
      `🎯 ${R.pick(NOMES)} ganha ${brl(S)} como jovem aprendiz e guarda ${p}% todo mês. ${ja ? `Já tem ${brl(ja)} guardados` : 'Ainda não tem nada guardado'} e quer chegar a ${brl(M)}. Em quantos meses chega lá?`,
      k, [Math.ceil(M / porMes), k + 1, k - 1, Math.ceil(M / S)], unid('mês', 'meses'),
      `Guarda por mês: ${p}% de ${brl(S)} = ${brl(porMes)}. Falta juntar: ${ja ? `${brl(M)} − ${brl(ja)} = ` : ''}${brl(M - ja)}. Meses: ${brl(M - ja)} ÷ ${brl(porMes)} = ${k}.`);
  },
  () => {
    const c = R.pick([200, 400, 500, 1000, 2000]), i = R.pick([0.5, 0.6, 0.7, 1]);
    const ans = r2(c * i / 100);
    return Q('Poupança e investimentos', 'medio',
      `🐷 ${brl(c)} estão guardados numa aplicação que rende ${num(i)}% ao mês. Quanto rendem em 1 mês?`,
      ans, [r2(c * i), r2(c * i / 10), r2(c + ans), r2(ans * 12)], brl,
      `${num(i)}% de ${brl(c)} = ${num(i)} ÷ 100 × ${brl(c)} = ${brl(ans)}.`);
  },
  () => {
    let a, b; do { a = R.pick([0.5, 0.8, 1]); b = R.pick([5, 8, 10, 12]); } while (a * 12 === b);
    const c = 1000, ra = r2(c * a * 12 / 100), rb = c * b / 100;
    const aMelhor = ra > rb;
    const fA = `Investimento A: rende ${brl(ra)} em 1 ano`, fB = `Investimento B: rende ${brl(rb)} em 1 ano`;
    return Q('Poupança e investimentos', 'dificil',
      `📊 Você tem ${brl(c)} para investir por 1 ano:\n• Investimento A: ${num(a)}% ao mês (juros simples)\n• Investimento B: ${b}% ao ano\nQual rende mais?`,
      aMelhor ? fA : fB, [aMelhor ? fB : fA, `Investimento ${aMelhor ? 'B' : 'A'}: rende ${brl(Math.max(ra, rb))} em 1 ano`, 'Os dois rendem igual, porque os dois têm juros'], txt,
      `A: ${num(a)}% × 12 meses = ${num(a * 12)}% ao ano, ou seja, ${brl(ra)}. B: ${b}% de ${brl(c)} = ${brl(rb)}. Compare sempre as taxas no mesmo período (mês com mês, ano com ano)!`);
  },
  () => Q('Poupança e investimentos', 'medio',
    '🚨 Um site promete DOBRAR o seu dinheiro em 1 mês, "sem risco nenhum". O que pensar?',
    'Desconfiar: ganho alto, rápido e "sem risco" é sinal de golpe', ['É uma ótima chance, tem que investir logo', 'É seguro se o site tiver muitos seguidores', 'É normal, todo investimento dobra em 1 mês'], txt,
    'Investimentos de verdade costumam render cerca de 1% ao mês. Quem promete dobrar o dinheiro rápido e sem risco geralmente está aplicando um golpe ou uma pirâmide.'),
  () => Q('Poupança e investimentos', 'medio',
    '🧰 Onde é melhor deixar a reserva de emergência?',
    'Numa aplicação segura, de onde dá para tirar o dinheiro rápido quando precisar', ['Em ações que podem cair muito de preço', 'Emprestada para um amigo', 'Em apostas, para tentar multiplicar'], txt,
    'Emergência não avisa! A reserva precisa estar num lugar seguro e com resgate rápido (liquidez), como a poupança ou aplicações com resgate diário.'),
];

/* ---------------- ORÇAMENTO FAMILIAR ---------------- */
const G_ORCAMENTO = [
  () => {
    let r, al, com, ct, tr;
    do { r = 100 * R.int(18, 35); al = 50 * R.int(10, 16); com = 50 * R.int(10, 16); ct = 10 * R.int(20, 35); tr = 10 * R.int(10, 25); } while (r <= al + com + ct + tr);
    const g = al + com + ct + tr;
    return Q('Orçamento familiar', 'facil',
      `📒 Uma família ganha ${brl(r)} por mês. Gasta ${brl(al)} com aluguel, ${brl(com)} com comida, ${brl(ct)} com contas e ${brl(tr)} com transporte. Quanto sobra no fim do mês?`,
      r - g, [g, r, r - g + 100, r - al - com], brl,
      `Gastos: ${brl(al)} + ${brl(com)} + ${brl(ct)} + ${brl(tr)} = ${brl(g)}. Sobra: ${brl(r)} − ${brl(g)} = ${brl(r - g)}.`);
  },
  () => {
    const r = 100 * R.int(10, 30);
    return Q('Orçamento familiar', 'medio',
      `🧩 Pela regra 50-30-20 (50% necessidades, 30% desejos e 20% poupança), com uma renda de ${brl(r)}, quanto vai para desejos A MAIS do que para a poupança?`,
      r * 0.1, [r * 0.3, r * 0.2, r * 0.5, r * 0.01], brl,
      `Desejos: 30% de ${brl(r)} = ${brl(r * 0.3)}. Poupança: 20% = ${brl(r * 0.2)}. Diferença: ${brl(r * 0.1)}, ou seja, 10% da renda.`);
  },
  () => {
    const r = R.pick([1600, 2000, 2400, 3000, 3200]), p = R.pick([15, 20, 25, 30, 40]);
    const g = r * p / 100;
    const cat = R.pick(['alimentação', 'aluguel', 'transporte', 'lazer']);
    return Q('Orçamento familiar', 'medio',
      `🥧 Uma família ganha ${brl(r)} e gasta ${brl(g)} com ${cat}. Que porcentagem da renda vai para ${cat}?`,
      p, [r2(g / 100), 100 - p, p / 2, p + 5], pc,
      `${brl(g)} ÷ ${brl(r)} × 100 = ${pc(p)}.`);
  },
  () => {
    const G = R.pick([2000, 2500, 3000, 4000]), p = R.pick([10, 20, 25]);
    const renda = G * (1 - p / 100);
    return Q('Orçamento familiar', 'dificil',
      `✂️ Uma família ganha ${brl(renda)}, mas está gastando ${brl(G)} por mês. Em quantos por cento precisa cortar os gastos para gastar exatamente o que ganha?`,
      p, [r2((G - renda) / renda * 100), 100 - p, p / 2, p + 5], pc,
      `Precisa cortar ${brl(G)} − ${brl(renda)} = ${brl(G - renda)}. Em relação aos gastos: ${brl(G - renda)} ÷ ${brl(G)} × 100 = ${pc(p)}.`);
  },
  () => {
    const meta = 100 * R.int(6, 15), m = R.pick([4, 5, 6]), renda = 100 * R.int(18, 30);
    let sobra; do { sobra = 10 * R.int(10, 30); } while (sobra * m === meta);
    const gasto = renda - sobra, junta = sobra * m, ok = junta >= meta;
    const sim = v => `Sim, vai juntar ${brl(v)}`, nao = v => `Não, vai juntar só ${brl(v)}`;
    return Q('Orçamento familiar', 'dificil',
      `🎒 Uma família quer juntar ${brl(meta)} em ${m} meses para o material escolar. Ela ganha ${brl(renda)} e gasta ${brl(gasto)} por mês. Vai conseguir?`,
      ok ? sim(junta) : nao(junta), [ok ? nao(junta) : sim(junta), (renda * m >= meta ? sim : nao)(renda * m), (ok ? sim : nao)(junta + sobra)], txt,
      `Sobra por mês: ${brl(renda)} − ${brl(gasto)} = ${brl(sobra)}. Em ${m} meses: ${m} × ${brl(sobra)} = ${brl(junta)}. ${ok ? `Dá, porque ${brl(junta)} é pelo menos ${brl(meta)}.` : `Faltam ${brl(meta - junta)}: dá para cortar gastos ou esticar o prazo.`}`);
  },
  () => Q('Orçamento familiar', 'facil',
    '📌 Qual destes é um gasto VARIÁVEL (que muda de um mês para outro)?',
    'Lanche e passeios no fim de semana', ['Aluguel da casa', 'Mensalidade da internet', 'Prestação fixa da geladeira'], txt,
    'Gastos fixos têm o mesmo valor todo mês (aluguel, internet). Gastos variáveis mudam (lazer, lanche). Costuma ser mais fácil economizar nos variáveis.'),
];

/* ---------------- DIREITOS DO CONSUMIDOR ---------------- */
const BANCO_DIREITOS = [
  { n: 'facil', t: '🧾 Por que é importante pedir a nota fiscal?',
    c: 'Ela prova a compra e garante seus direitos, como troca e garantia', e: ['Para gastar mais papel', 'Ela só serve para a loja', 'Para não precisar pagar o produto'],
    x: 'Sem a nota fiscal fica difícil provar a compra. Ela também mostra os impostos pagos.' },
  { n: 'medio', t: '🔧 Seu fone parou de funcionar 20 dias depois da compra, por defeito de fábrica. Pelo Código de Defesa do Consumidor, qual é o prazo para reclamar de defeito em produto durável?',
    c: '90 dias', e: ['7 dias', '30 dias', 'Não existe prazo: a loja decide'],
    x: 'Para produtos duráveis (eletrônicos, roupas, móveis), o prazo é de 90 dias. Para produtos não duráveis (como alimentos), é de 30 dias.' },
  { n: 'medio', t: '🏷️ A etiqueta na prateleira mostra R$ 9,90, mas no caixa cobram R$ 12,90. O que diz a lei?',
    c: 'O consumidor paga o menor preço anunciado', e: ['Paga o preço do caixa', 'Paga a média dos dois preços', 'A loja escolhe qual preço vale'],
    x: 'Quando há dois preços diferentes para o mesmo produto, a lei garante que o consumidor pague o menor.' },
  { n: 'dificil', t: '📦 Você comprou pela internet e desistiu dentro de 7 dias (direito de arrependimento). O que deve receber de volta?',
    c: 'Todo o valor pago, inclusive o frete', e: ['Só metade do valor', 'Só um vale-compras da loja', 'Nada, compra pela internet não tem devolução'],
    x: 'Pelo artigo 49 do Código de Defesa do Consumidor, quem desiste em até 7 dias recebe de volta tudo o que pagou, com correção.' },
  { n: 'medio', t: '📞 Uma loja se recusa a resolver um problema que é seu direito. A quem você pode recorrer?',
    c: 'Ao Procon ou ao site consumidor.gov.br', e: ['À polícia rodoviária', 'Ao banco onde você tem conta', 'Não há nada a fazer'],
    x: 'O Procon e o consumidor.gov.br ajudam a resolver conflitos entre consumidores e empresas, de graça.' },
  { n: 'dificil', t: '🛒 A "venda casada" é proibida pelo Código de Defesa do Consumidor. Qual destes exemplos é venda casada?',
    c: 'A loja só vender o celular se você comprar também a capinha', e: ['A loja dar desconto para quem leva dois produtos', 'O mercado vender o pacote com 6 unidades e também a unidade avulsa', 'A loja oferecer uma garantia extra que você pode recusar'],
    x: 'Venda casada é obrigar o cliente a comprar um produto ou serviço para poder levar outro. Isso é proibido.' },
  { n: 'dificil', t: '📬 Chegou na sua casa um cartão de crédito que ninguém pediu. Pelo Código de Defesa do Consumidor, isso é:',
    c: 'Uma prática abusiva: é proibido enviar produto ou serviço sem pedido', e: ['Um presente que é obrigatório aceitar', 'Uma promoção normal', 'Uma dívida que precisa ser paga'],
    x: 'Enviar produto ou serviço sem o consumidor pedir é prática abusiva. O que chega assim é tratado como amostra grátis.' },
  { n: 'medio', t: '🍞 Você chegou em casa e viu que o pão de forma que comprou está vencido. O que fazer?',
    c: 'Voltar à loja e pedir a troca ou o dinheiro de volta', e: ['Comer assim mesmo', 'Jogar fora e não reclamar', 'Pagar de novo para poder trocar'],
    x: 'Vender produto vencido é proibido. Você tem direito à troca ou à devolução do dinheiro.' },
  { n: 'medio', t: '🎨 Numa loja física, a loja é obrigada a trocar um produto SEM defeito só porque você não gostou da cor?',
    c: 'Não, a não ser que a loja tenha prometido aceitar a troca', e: ['Sim, sempre e em qualquer prazo', 'Sim, mas só no Natal', 'Sim, mesmo sem a nota fiscal'],
    x: 'Em loja física, a troca de produto sem defeito depende da política da loja. Se ela prometeu (por exemplo, na etiqueta), tem que cumprir.' },
  { n: 'dificil', t: '💳 Um site cobra mais barato no Pix do que no cartão. Isso é permitido?',
    c: 'Sim: a lei permite preços diferentes conforme a forma de pagamento, desde que informados', e: ['Não, é sempre crime', 'Só é permitido em lojas físicas', 'Só se a diferença for menor que R$ 10'],
    x: 'Desde a Lei 13.455, de 2017, as lojas podem dar preços diferentes para Pix, dinheiro e cartão, desde que avisem o cliente de forma clara.' },
  { n: 'medio', t: '📃 Num contrato, como o de um plano de celular, o que precisa aparecer com destaque, fácil de ver?',
    c: 'As regras que limitam os direitos do consumidor', e: ['Só o nome da empresa', 'A cor preferida do cliente', 'Nada, o contrato pode esconder as regras'],
    x: 'O Código de Defesa do Consumidor exige que as cláusulas que limitam direitos sejam escritas com destaque, para o consumidor entender antes de assinar.' },
];
BANCO_DIREITOS.forEach(b => { b.tema = 'Direitos do consumidor'; });

/* ---------------- SEGURANÇA DIGITAL 2.0 ---------------- */
const BANCO_GOLPES2 = [
  { n: 'facil', t: '📷 Numa barraca, alguém colou um QR Code por cima do original para receber o Pix. O que conferir antes de pagar?',
    c: 'O nome de quem vai receber, que aparece no app antes de confirmar', e: ['A cor do QR Code', 'Nada, QR Code é sempre seguro', 'Se o QR Code é grande'],
    x: 'Antes de confirmar um Pix, o aplicativo mostra o nome de quem vai receber. Se o nome for estranho, não pague!' },
  { n: 'facil', t: '🔐 Você deve contar a senha das suas redes sociais para o melhor amigo?',
    c: 'Não: senha é pessoal, só os responsáveis podem saber', e: ['Sim, amigos sempre podem saber', 'Sim, se ele prometer segredo', 'Sim, só a senha do jogo'],
    x: 'Mesmo sem querer, um amigo pode deixar a senha vazar. Senha é só sua e dos seus responsáveis.' },
  { n: 'medio', t: '🎰 Por que alguns influenciadores mostram ganhos enormes em jogos de aposta?',
    c: 'Muitos são pagos pelas casas de apostas e às vezes usam contas de demonstração', e: ['Porque é fácil ficar rico apostando', 'Porque as apostas são um tipo de poupança', 'Porque o governo paga para eles'],
    x: 'As casas de apostas lucram com quem perde. Propaganda com "ganhos fáceis" quer atrair novos apostadores, e menores de 18 anos não podem apostar.' },
  { n: 'medio', t: '🧑‍💻 Alguém que você conheceu num jogo online pede fotos e o endereço da sua casa. O que fazer?',
    c: 'Não enviar, bloquear e contar para um adulto de confiança', e: ['Enviar só o endereço', 'Enviar, porque vocês já jogaram juntos', 'Mandar a foto de um amigo no lugar'],
    x: 'Nunca envie dados pessoais ou fotos para quem você conheceu na internet. Converse sempre com um adulto de confiança.' },
  { n: 'medio', t: '📧 Um e-mail diz que sua conta será bloqueada em 1 hora se você não clicar no link. O que fazer?',
    c: 'Não clicar e verificar a conta entrando pelo aplicativo oficial', e: ['Clicar rápido para não perder a conta', 'Responder o e-mail com a sua senha', 'Encaminhar para todos os contatos'],
    x: 'Criar pressa é uma tática comum de golpe. Empresas sérias não ameaçam bloquear a conta por e-mail com link.' },
  { n: 'medio', t: '🛍️ No site de vendas, o vendedor pede para você fechar a compra pelo WhatsApp, fora do site. O que fazer?',
    c: 'Recusar: fora da plataforma você perde a proteção da compra', e: ['Aceitar, sai mais barato', 'Aceitar, se ele mandar foto do produto', 'Mandar os dados do cartão pelo WhatsApp'],
    x: 'Dentro da plataforma, o pagamento fica protegido até você receber o produto. Fora dela, se for golpe, é difícil recuperar o dinheiro.' },
  { n: 'medio', t: '🎁 Uma mensagem diz que você ganhou um vale de R$ 500 de um mercado famoso. Basta responder uma pesquisa e compartilhar com 10 amigos.',
    c: 'É golpe: serve para espalhar o link e roubar seus dados', e: ['É um prêmio oficial', 'Só é golpe se pedir dinheiro', 'É seguro porque o mercado é famoso'],
    x: 'Golpistas usam nomes de empresas conhecidas. Pedir para compartilhar com amigos faz o golpe se espalhar.' },
  { n: 'dificil', t: '📱 Você vende um videogame usado. O comprador mostra um "comprovante de Pix", mas o dinheiro não aparece na sua conta. O que pode ser?',
    c: 'Um Pix agendado ou um comprovante falso: só entregue quando o dinheiro estiver na sua conta', e: ['O Pix sempre demora 3 dias', 'É normal, pode entregar o produto', 'O banco esqueceu de mostrar o valor'],
    x: 'O Pix cai na hora. Golpistas mostram comprovantes de Pix agendados (que eles cancelam depois) ou montagens. Confira no app do seu banco.' },
  { n: 'dificil', t: '🎭 O que é deepfake?',
    c: 'Vídeo ou áudio falso, feito com inteligência artificial, que imita uma pessoa real', e: ['Um vídeo muito antigo', 'Um filtro de beleza oficial', 'Um tipo de senha forte'],
    x: 'Golpistas usam deepfakes de famosos anunciando "investimentos" ou de parentes pedindo dinheiro. Desconfie e confirme por outro canal.' },
  { n: 'dificil', t: '💼 Uma "oportunidade" paga para você convidar amigos, e cada amigo precisa pagar para entrar. Isso é:',
    c: 'Pirâmide financeira: é crime e quase todo mundo perde dinheiro', e: ['Um investimento garantido', 'Um tipo de poupança do governo', 'Um emprego com carteira assinada'],
    x: 'Na pirâmide, o dinheiro de quem entra paga quem entrou antes. Quando param de entrar pessoas, ela desmorona e a maioria perde.' },
  { n: 'dificil', t: '🔦 Um aplicativo de lanterna pede acesso aos seus contatos, mensagens e localização. O que pensar?',
    c: 'Desconfiar: ele pede permissões que não precisa para funcionar', e: ['É normal, todo app precisa de tudo', 'Aceitar, senão a lanterna não acende', 'Aceitar só a localização'],
    x: 'Antes de instalar, veja as permissões. Um app que pede acesso demais pode estar coletando seus dados.' },
];
BANCO_GOLPES2.forEach(b => { b.tema = 'Segurança digital'; });

/* ---------------- DINHEIRO E ECONOMIA ---------------- */
const BANCO_ECONOMIA = [
  { n: 'facil', t: '🐚 Antes de existir dinheiro, as pessoas trocavam produtos entre si. Como se chama essa troca?',
    c: 'Escambo', e: ['Pix', 'Cashback', 'Inflação'],
    x: 'No escambo, trocava-se uma coisa por outra, como peixe por farinha. O dinheiro surgiu para facilitar essas trocas.' },
  { n: 'facil', t: '🇧🇷 Qual é a moeda oficial do Brasil desde 1994?',
    c: 'O Real', e: ['O Cruzeiro', 'O Dólar', 'O Peso'],
    x: 'O Real foi criado em 1994, no Plano Real, para controlar uma inflação que chegava a mais de 1.000% ao ano.' },
  { n: 'facil', t: '🪪 O que é o CPF?',
    c: 'O cadastro que identifica cada pessoa na Receita Federal', e: ['Um cartão de crédito', 'Um tipo de conta no banco', 'A senha do aplicativo do banco'],
    x: 'O CPF é um número único de cada pessoa. Ele é pedido para abrir conta, comprar com nota fiscal e muito mais. Cuide bem dele!' },
  { n: 'medio', t: '🏛️ Qual instituição controla a quantidade de dinheiro no país e cuida da inflação no Brasil?',
    c: 'O Banco Central', e: ['A prefeitura', 'O supermercado', 'O Procon'],
    x: 'O Banco Central define a taxa básica de juros (Selic) e cuida para que os preços não subam demais. Foi ele também que criou o Pix.' },
  { n: 'medio', t: '🧾 Quando você compra um produto, parte do preço é imposto. Para que servem os impostos?',
    c: 'Para pagar serviços públicos, como escolas, saúde e estradas', e: ['Para dar lucro às lojas', 'Para pagar o frete', 'Não servem para nada'],
    x: 'Os impostos pagam escolas, hospitais, estradas e outros serviços. A nota fiscal mostra quanto de imposto tem na compra.' },
  { n: 'medio', t: '🏦 O que um banco faz com o dinheiro que as pessoas depositam?',
    c: 'Guarda uma parte e empresta outra parte, cobrando juros', e: ['Guarda tudo numa caixa e nunca mexe', 'Queima o dinheiro velho', 'Distribui de graça'],
    x: 'O banco paga um pouco de juros a quem guarda e cobra juros maiores de quem pega emprestado. A diferença é o lucro do banco.' },
  { n: 'medio', t: '🤝 Produtores de Rio Tinto se juntam numa cooperativa para vender juntos. Qual é a vantagem?',
    c: 'Juntos negociam preços melhores e dividem os custos', e: ['Cada um paga mais caro', 'Ninguém pode vender sozinho nunca mais', 'Não há vantagem nenhuma'],
    x: 'Na cooperativa, os associados dividem custos de transporte e embalagem e ganham força para negociar.' },
  { n: 'dificil', t: '🧮 O que é o Imposto de Renda?',
    c: 'Um imposto cobrado sobre o que as pessoas e as empresas ganham', e: ['Um desconto para quem compra muito', 'Uma taxa de entrega', 'Uma aplicação do banco'],
    x: 'Quem ganha acima de um certo valor paga uma parte da renda como imposto. Quem ganha mais paga uma porcentagem maior.' },
  { n: 'dificil', t: '💵 Por que o governo não pode imprimir muito dinheiro e dar para todo mundo ficar rico?',
    c: 'Com muito dinheiro e a mesma quantidade de produtos, os preços sobem (inflação)', e: ['Porque falta papel para imprimir', 'Porque os bancos não deixam', 'Pode, e todo mundo ficaria rico'],
    x: 'Se todos têm mais dinheiro, mas não existem mais produtos, os vendedores aumentam os preços. O dinheiro perde valor.' },
  { n: 'dificil', t: '📊 O que significa PIB?',
    c: 'A soma de tudo que um país produz de bens e serviços em um período', e: ['O dinheiro guardado no Banco Central', 'O número de pessoas que trabalham', 'O preço da gasolina'],
    x: 'PIB é o Produto Interno Bruto. Quando o PIB cresce, a economia do país está produzindo mais.' },
  { n: 'dificil', t: '💱 Se o dólar sobe de R$ 5 para R$ 6, o que acontece com os produtos importados?',
    c: 'Ficam mais caros em reais', e: ['Ficam mais baratos', 'Não mudam nada', 'Passam a ser de graça'],
    x: 'Quem importa paga em dólar. Se cada dólar custa mais reais, o produto chega mais caro às lojas do Brasil.' },
];
BANCO_ECONOMIA.forEach(b => { b.tema = 'Dinheiro e economia'; });

const G_DIREITOS = deBanco(BANCO_DIREITOS);
const G_GOLPES2 = deBanco(BANCO_GOLPES2);
const G_ECONOMIA = deBanco(BANCO_ECONOMIA);
