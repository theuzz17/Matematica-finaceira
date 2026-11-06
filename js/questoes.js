/* =========================================================
   BANCO DE QUESTÕES — Conectados com o Dinheiro
   Cada questão é GERADA na hora: números, nomes, produtos,
   ordem das questões e ordem das alternativas são sorteados.
   Assim, cada estudante (e cada tentativa) recebe uma prova diferente.
   ========================================================= */

const R = {
  int(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
};

const FMT_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FMT_NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const FMT_FATOR = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 });
const r2 = v => Math.round(v * 100) / 100;
const brl = v => FMT_BRL.format(r2(v));
const num = v => FMT_NUM.format(r2(v));
const pc = v => num(v) + '%';
const txt = v => v;

const PRODUTOS = [
  { n: 'fone de ouvido', e: '🎧' }, { n: 'tênis', e: '👟' }, { n: 'mochila', f: 1, e: '🎒' },
  { n: 'camiseta', f: 1, e: '👕' }, { n: 'capinha de celular', f: 1, e: '📱' }, { n: 'jogo digital', e: '🎮' },
  { n: 'livro', e: '📚' }, { n: 'caixa de som', f: 1, e: '🔊' }, { n: 'relógio', e: '⌚' },
  { n: 'boné', e: '🧢' }, { n: 'bola de futebol', f: 1, e: '⚽' }, { n: 'patinete', e: '🛴' },
  { n: 'kit de desenho', e: '🎨' }, { n: 'teclado gamer', e: '⌨️' },
];
PRODUTOS.forEach(p => {
  p.um = (p.f ? 'uma ' : 'um ') + p.n;
  p.Um = (p.f ? 'Uma ' : 'Um ') + p.n;
  p.mesmo = (p.f ? 'A mesma ' : 'O mesmo ') + p.n;
});
const NOMES = ['Ana', 'Caio', 'Luana', 'Davi', 'Yara', 'Pedro', 'Maria', 'Kauã', 'Bia', 'Enzo', 'Jaci', 'Raí', 'Lara', 'Théo', 'Iberê', 'Sofia'];
const LOJAS = ['Loja Tucano', 'MegaShop Arara', 'Clique Barato', 'Mercado Ipê', 'Shop Jacarandá', 'Vitrine Caju'];
const COMIDAS = ['pizza', 'hambúrguer', 'açaí', 'tapioca', 'cuscuz recheado', 'pastel'];

/* Monta as alternativas: remove repetidas/inválidas, completa até 4 e embaralha. */
function montar(correta, distratores, fmt) {
  const vistos = new Set([fmt(correta)]);
  const ops = [correta];
  for (const d of distratores) {
    if (ops.length >= 4) break;
    if (typeof d === 'number' && (!isFinite(d) || d <= 0)) continue;
    const k = fmt(d);
    if (!vistos.has(k)) { vistos.add(k); ops.push(d); }
  }
  let n = 1;
  while (ops.length < 4 && typeof correta === 'number') {
    const passo = Math.max(1, Math.round(Math.abs(correta) * 0.1));
    const d = r2(correta + (n % 2 ? 1 : -1) * passo * Math.ceil(n / 2));
    const k = fmt(d);
    if (d > 0 && !vistos.has(k)) { vistos.add(k); ops.push(d); }
    n++;
  }
  const embaralhadas = R.shuffle(ops.map(fmt));
  return { opcoes: embaralhadas, correta: embaralhadas.indexOf(fmt(correta)) };
}

function Q(tema, nivel, texto, correta, distratores, fmt, explicacao) {
  return { tema, nivel, texto, explicacao, ...montar(correta, distratores, fmt) };
}

/* ---------------- FASE 1 · PORCENTAGEM ---------------- */
const G_PORCENTAGEM = [
  () => {
    const p = R.pick([10, 20, 25, 50]);
    const v = 20 * R.int(2, 20);
    const r = v * p / 100;
    const prod = R.pick(PRODUTOS);
    return Q('Porcentagem', 'facil',
      `${prod.e} ${prod.Um} custa ${brl(v)} na internet. Quanto é ${p}% desse valor?`,
      r, [v - r, r * 2, r / 2, p], brl,
      `${p}% significa ${p} em cada 100, ou seja, ${p}/100. Então: ${p}/100 × ${brl(v)} = ${brl(r)}.`);
  },
  () => {
    const mapa = { 10: '1/10', 20: '1/5', 25: '1/4', 50: '1/2', 75: '3/4' };
    const p = R.pick(Object.keys(mapa));
    const outras = Object.values(mapa).filter(f => f !== mapa[p]);
    return Q('Porcentagem', 'facil',
      `🍕 Qual fração representa ${p}%?`,
      mapa[p], R.shuffle(outras), txt,
      `${p}% = ${p}/100. Simplificando essa fração, chegamos a ${mapa[p]}.`);
  },
  () => {
    let p, n;
    do { p = R.pick([10, 20, 25, 40, 50, 60, 75]); n = R.pick([20, 24, 28, 30, 32, 36, 40]); } while ((n * p) % 100 !== 0);
    const r = n * p / 100;
    return Q('Porcentagem', 'medio',
      `📊 Numa turma de ${n} estudantes, ${p}% já fizeram alguma compra pela internet. Quantos estudantes são?`,
      r, [n - r, r + 2, r - 2, p / 10], num,
      `${p}% de ${n} = ${p}/100 × ${n} = ${r} estudantes.`);
  },
  () => {
    const v = 20 * R.int(2, 15);
    const r = v * 0.15;
    const prod = R.pick(PRODUTOS);
    return Q('Porcentagem', 'medio',
      `🧠 Cálculo mental: quanto é 15% de ${brl(v)}, o preço de ${prod.um}? (Dica: 10% + 5%)`,
      r, [v * 0.1, v * 0.05, v * 0.25, v - r], brl,
      `10% de ${brl(v)} = ${brl(v * 0.1)}. 5% é a metade disso: ${brl(v * 0.05)}. Somando: ${brl(v * 0.1)} + ${brl(v * 0.05)} = ${brl(r)}.`);
  },
  () => {
    const b = R.pick([40, 50, 80, 120, 200, 250]);
    const p = R.pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
    const a = b * p / 100;
    const nome = R.pick(NOMES);
    return Q('Porcentagem', 'dificil',
      `🛵 ${nome} recebe ${brl(b)} de mesada e gastou ${brl(a)} com lanches por aplicativo. Que porcentagem da mesada foi gasta?`,
      p, [p / 2, p * 2, 100 - p, a], pc,
      `Dividimos a parte pelo todo: ${brl(a)} ÷ ${brl(b)} = ${num(a / b)}. Multiplicando por 100: ${pc(p)}.`);
  },
  () => {
    const p = R.pick([1, 2, 5]);
    const v = 100 * R.int(3, 25);
    const r = v * p / 100;
    return Q('Porcentagem', 'medio',
      `🪙 Quanto é ${p}% de ${brl(v)}?`,
      r, [r * 10, v / p, r * 2, v - r], brl,
      `1% de ${brl(v)} é ${brl(v / 100)} (dividir por 100). Então ${p}% = ${p} × ${brl(v / 100)} = ${brl(r)}.`);
  },
];

/* ---------------- FASE 2 · DESCONTOS ---------------- */
const G_DESCONTO = [
  () => {
    const v = 10 * R.int(5, 40);
    const p = R.pick([10, 20, 25, 30, 50]);
    const d = v * p / 100, f = v - d;
    const prod = R.pick(PRODUTOS);
    return Q('Descontos', 'facil',
      `${prod.e} ${prod.Um} de ${brl(v)} está com ${p}% de desconto. Qual o preço final?`,
      f, [d, v + d, v - p, f - 5], brl,
      `Desconto: ${p}% de ${brl(v)} = ${brl(d)}. Preço final: ${brl(v)} − ${brl(d)} = ${brl(f)}.`);
  },
  () => {
    const v = 20 * R.int(3, 25);
    const p = R.pick([5, 10, 15, 20, 30, 40]);
    const d = v * p / 100;
    const loja = R.pick(LOJAS);
    return Q('Descontos', 'facil',
      `🏷️ A ${loja} anunciou ${p}% OFF em um produto de ${brl(v)}. Quantos reais de desconto você ganha?`,
      d, [v - d, d * 2, d / 2, p], brl,
      `${p}% de ${brl(v)} = ${p}/100 × ${brl(v)} = ${brl(d)}.`);
  },
  () => {
    const v = 20 * R.int(3, 20);
    const p = R.pick([10, 15, 20, 25, 30, 40, 50]);
    const f = v * (100 - p) / 100;
    const prod = R.pick(PRODUTOS);
    return Q('Descontos', 'medio',
      `${prod.e} ${prod.Um} passou de ${brl(v)} para ${brl(f)}. Qual foi a porcentagem de desconto?`,
      p, [100 - p, p + 5, p - 5, p * 2], pc,
      `Desconto em reais: ${brl(v)} − ${brl(f)} = ${brl(v - f)}. Em porcentagem: ${brl(v - f)} ÷ ${brl(v)} × 100 = ${pc(p)}.`);
  },
  () => {
    const v = 20 * R.int(3, 20);
    const p = R.pick([10, 20, 25, 50]);
    const f = v * (100 - p) / 100;
    return Q('Descontos', 'dificil',
      `🔎 Depois de um desconto de ${p}%, um produto ficou por ${brl(f)}. Qual era o preço original?`,
      v, [f * (1 + p / 100), f + p, f - f * p / 100, v + 10], brl,
      `Se teve ${p}% de desconto, o preço final é ${100 - p}% do original. Então original = ${brl(f)} ÷ ${num((100 - p) / 100)} = ${brl(v)}.`);
  },
  () => {
    const v = 100 * R.int(1, 6);
    const p1 = R.pick([10, 20, 50]), p2 = R.pick([10, 20, 50]);
    const f = v * (1 - p1 / 100) * (1 - p2 / 100);
    return Q('Descontos', 'dificil',
      `⚡ Black Friday! Um produto de ${brl(v)} teve ${p1}% de desconto e, no carrinho, mais ${p2}% sobre o novo preço. Quanto ficou?`,
      f, [v * (1 - (p1 + p2) / 100), v * (1 - p1 / 100), v - p1 - p2, f + 10], brl,
      `1º desconto: ${brl(v)} − ${p1}% = ${brl(v * (1 - p1 / 100))}. 2º desconto: ${brl(v * (1 - p1 / 100))} − ${p2}% = ${brl(f)}. Atenção: dois descontos seguidos NÃO são a soma (${p1 + p2}%).`);
  },
];

/* ---------------- FASE 3 · ACRÉSCIMOS ---------------- */
const G_ACRESCIMO = [
  () => {
    const v = 20 * R.int(2, 20);
    const p = R.pick([5, 10, 20, 25, 50]);
    const a = v * p / 100, f = v + a;
    const prod = R.pick(PRODUTOS);
    return Q('Acréscimos', 'facil',
      `📈 O preço de ${prod.um} era ${brl(v)} e aumentou ${p}%. Qual o novo preço?`,
      f, [a, v - a, v + p, f + 10], brl,
      `Aumento: ${p}% de ${brl(v)} = ${brl(a)}. Novo preço: ${brl(v)} + ${brl(a)} = ${brl(f)}.`);
  },
  () => {
    const v = 10 * R.int(3, 12);
    const p = R.pick([5, 10, 15, 20]);
    const t = v * (1 + p / 100);
    const comida = R.pick(COMIDAS);
    return Q('Acréscimos', 'medio',
      `🛵 Um pedido de ${comida} por aplicativo custa ${brl(v)}, mais uma taxa de entrega de ${p}% do valor. Quanto você paga no total?`,
      t, [v * p / 100, v + p, v * (1 - p / 100), t + 5], brl,
      `Taxa: ${p}% de ${brl(v)} = ${brl(v * p / 100)}. Total: ${brl(v)} + ${brl(v * p / 100)} = ${brl(t)}.`);
  },
  () => {
    const v = 20 * R.int(2, 15);
    const p = R.pick([10, 15, 20, 25, 30, 50]);
    const f = v * (1 + p / 100);
    return Q('Acréscimos', 'medio',
      `🎮 Um jogo digital passou de ${brl(v)} para ${brl(f)}. De quantos por cento foi o aumento?`,
      p, [100 + p, p + 5, p - 5, f - v], pc,
      `Aumento em reais: ${brl(f)} − ${brl(v)} = ${brl(f - v)}. Em porcentagem: ${brl(f - v)} ÷ ${brl(v)} × 100 = ${pc(p)}.`);
  },
  () => {
    const v = 100 * R.int(1, 5);
    const p = R.pick([10, 20, 50]);
    const f = v * (1 + p / 100) * (1 - p / 100);
    return Q('Acréscimos', 'dificil',
      `🎢 Um produto de ${brl(v)} subiu ${p}% e, depois, teve ${p}% de desconto. Qual o preço final?`,
      f, [v, v * (1 + p / 100), v * (1 - p / 100), f + 10], brl,
      `Depois do aumento: ${brl(v * (1 + p / 100))}. Com desconto de ${p}%: ${brl(v * (1 + p / 100))} × ${num(1 - p / 100)} = ${brl(f)}. Não volta ao preço original!`);
  },
  () => {
    const p = R.pick([5, 12, 15, 25, 30, 40]);
    const f = v => FMT_FATOR.format(v);
    return Q('Acréscimos', 'facil',
      `✖️ Aumentar um preço em ${p}% é o mesmo que multiplicar esse preço por:`,
      f(1 + p / 100), [f(p / 100), f(1 - p / 100), f(p)], txt,
      `O preço inteiro é 100% = 1. Somando o aumento: 100% + ${p}% = ${100 + p}% = ${f(1 + p / 100)}.`);
  },
];

/* ---------------- FASE 4 · JUROS SIMPLES ---------------- */
const G_JUROS = [
  () => {
    const c = R.pick([100, 200, 300, 400, 500, 800, 1000]);
    const i = R.pick([1, 2, 3, 4, 5]);
    const t = R.int(2, 6);
    const j = c * i * t / 100;
    return Q('Juros simples', 'facil',
      `💰 Um valor de ${brl(c)} foi aplicado a juros simples de ${i}% ao mês, por ${t} meses. Quanto rendeu de juros?`,
      j, [c * i / 100, c + j, j * 2, j / 2], brl,
      `Juros simples: J = C × i × t = ${brl(c)} × ${i}/100 × ${t} = ${brl(j)}.`);
  },
  () => {
    const c = R.pick([150, 200, 250, 400, 500, 600]);
    const i = R.pick([2, 3, 5]);
    const t = R.int(2, 5);
    const j = c * i * t / 100, m = c + j;
    return Q('Juros simples', 'medio',
      `🏦 ${R.pick(NOMES)} pegou ${brl(c)} emprestado com juros simples de ${i}% ao mês e vai pagar depois de ${t} meses. Qual o valor total (montante) a pagar?`,
      m, [j, c * (1 + i / 100), m + j, c + c * i / 100], brl,
      `Juros: ${brl(c)} × ${i}/100 × ${t} = ${brl(j)}. Montante: M = C + J = ${brl(c)} + ${brl(j)} = ${brl(m)}.`);
  },
  () => {
    const v = 10 * R.int(5, 30);
    const t = R.int(1, 4);
    const total = v * (1 + 0.02 + 0.01 * t);
    return Q('Juros simples', 'dificil',
      `🧾 Um boleto de ${brl(v)} foi pago com ${t} ${t > 1 ? 'meses' : 'mês'} de atraso. Há multa de 2% mais juros simples de 1% ao mês. Quanto foi pago?`,
      total, [v * 1.02, v * (1 + 0.01 * t), v + 2 + t, total + 5], brl,
      `Multa: 2% de ${brl(v)} = ${brl(v * 0.02)}. Juros: 1% × ${t} = ${t}% de ${brl(v)} = ${brl(v * 0.01 * t)}. Total: ${brl(total)}. Pagar em dia evita esse custo!`);
  },
  () => {
    const c = R.pick([200, 400, 500, 1000]);
    const i = R.pick([1, 2, 3, 4, 5]);
    const t = R.int(2, 5);
    const j = c * i * t / 100;
    return Q('Juros simples', 'dificil',
      `🔍 Uma aplicação de ${brl(c)} rendeu ${brl(j)} de juros simples em ${t} meses. Qual foi a taxa mensal?`,
      i, [i * t, i * 2, i + 1, j], pc,
      `i = J ÷ (C × t) = ${brl(j)} ÷ (${brl(c)} × ${t}) = ${num(i / 100)} = ${pc(i)} ao mês.`);
  },
  () => {
    const c = R.pick([100, 200, 500, 1000]);
    const i = R.pick([2, 4, 5, 10]);
    const t = R.int(2, 8);
    const j = c * i * t / 100;
    return Q('Juros simples', 'medio',
      `⏳ Aplicando ${brl(c)} a ${i}% ao mês (juros simples), em quantos meses o rendimento chega a ${brl(j)}?`,
      t, [t + 1, t - 1, t * 2, i], v => `${num(v)} ${v === 1 ? 'mês' : 'meses'}`,
      `Por mês rende ${i}% de ${brl(c)} = ${brl(c * i / 100)}. Então ${brl(j)} ÷ ${brl(c * i / 100)} = ${t} meses.`);
  },
];

/* ---------------- FASE 5 · COMPARAÇÃO DE PREÇOS ---------------- */
const G_COMPARACAO = [
  () => {
    const [la, lb] = R.shuffle(LOJAS);
    const pa = R.int(60, 180), fa = R.int(10, 30);
    let pb; do { pb = R.int(60, 210); } while (pb === pa + fa);
    const ta = pa + fa, tb = pb;
    const melhor = ta < tb ? la : lb, pior = ta < tb ? lb : la;
    const dif = Math.abs(ta - tb);
    const errDif = dif === fa ? dif + 5 : fa;
    const prod = R.pick(PRODUTOS);
    return Q('Comparação de preços', 'medio',
      `${prod.e} ${prod.mesmo}:\n• ${la}: ${brl(pa)} + frete de ${brl(fa)}\n• ${lb}: ${brl(pb)} com frete grátis\nQual sai mais barato e quanto se economiza?`,
      `${melhor}, economia de ${brl(dif)}`,
      [`${pior}, economia de ${brl(dif)}`, `${melhor}, economia de ${brl(errDif)}`, `${pior}, economia de ${brl(errDif)}`], txt,
      `${la}: ${brl(pa)} + ${brl(fa)} = ${brl(ta)}. ${lb}: ${brl(tb)}. A diferença é ${brl(dif)} a favor da ${melhor}. Sempre some o frete!`);
  },
  () => {
    const v = 10 * R.int(6, 30);
    const p = R.pick([10, 15, 20]);
    let x; do { x = 5 * R.int(2, 10); } while (x === v * p / 100);
    const dp = v * p / 100;
    const melhorPct = dp > x;
    const a = `Cupom de ${p}% (desconto de ${brl(dp)})`;
    const b = `Cupom de ${brl(x)} OFF`;
    return Q('Comparação de preços', 'medio',
      `🎟️ Numa compra de ${brl(v)}, você pode usar só um cupom: ${p}% de desconto OU ${brl(x)} de desconto. Qual é melhor?`,
      melhorPct ? a : b,
      [melhorPct ? b : a, 'Os dois dão o mesmo desconto', `Nenhum, cupom sempre aumenta o preço`], txt,
      `${p}% de ${brl(v)} = ${brl(dp)}. O outro cupom dá ${brl(x)}. O maior desconto é ${brl(Math.max(dp, x))}.`);
  },
  () => {
    const n = R.pick([3, 4, 5, 6]);
    const u = R.pick([2, 2.5, 3, 4, 5]);
    const p = n * u;
    return Q('Comparação de preços', 'facil',
      `🧃 Um pacote com ${n} sucos custa ${brl(p)}. Qual o preço de cada suco no pacote?`,
      u, [p, u + 1, p / 2, u - 0.5], brl,
      `Preço por unidade: ${brl(p)} ÷ ${n} = ${brl(u)}. Comparar o preço por unidade ajuda a saber se a promoção vale a pena.`);
  },
  () => {
    const lim = R.pick([99, 120, 150, 199]);
    const c = R.int(Math.round(lim * 0.5), lim - 10);
    return Q('Comparação de preços', 'facil',
      `🚚 A loja dá frete grátis em compras acima de ${brl(lim)}. Seu carrinho tem ${brl(c)}. Quanto falta para ganhar o frete grátis?`,
      lim - c, [lim + c, c, lim - c + 10, lim - c - 5], brl,
      `${brl(lim)} − ${brl(c)} = ${brl(lim - c)}. Mas pense: você precisa mesmo comprar mais só para não pagar frete?`);
  },
  () => {
    const p1 = R.int(30, 90), p2 = R.int(20, 60), f = R.pick([0, 9.9, 12, 15, 19.9]);
    const t = p1 + p2 + f;
    const [a, b] = R.shuffle(PRODUTOS);
    return Q('Comparação de preços', 'facil',
      `🛒 No carrinho: ${a.e} ${a.n} por ${brl(p1)} e ${b.e} ${b.n} por ${brl(p2)}. O frete é ${f ? brl(f) : 'grátis'}. Qual o total?`,
      t, [p1 + p2, t + 10, t - 5, p1 + f], brl,
      `${brl(p1)} + ${brl(p2)} + ${brl(f)} = ${brl(t)}.`);
  },
];

/* ---------------- FASE 6 · FORMAS DE PAGAMENTO ---------------- */
const G_PAGAMENTO = [
  () => {
    const n = R.pick([3, 4, 5, 6, 10, 12]);
    const q = R.int(15, 60) + R.pick([0, 0.5, 0.9]);
    const t = n * q;
    const prod = R.pick(PRODUTOS);
    return Q('Formas de pagamento', 'facil',
      `💳 ${prod.Um} foi comprad${prod.f ? 'a' : 'o'} em ${n}x de ${brl(q)}. Qual o valor total pago?`,
      t, [q, t + q, n + q, t - q], brl,
      `Total = número de parcelas × valor da parcela = ${n} × ${brl(q)} = ${brl(t)}.`);
  },
  () => {
    const v = 10 * R.int(10, 40);
    const n = R.pick([4, 5, 6, 10]);
    const extra = R.pick([5, 10, 15, 20]);
    const q = r2(v * (1 + extra / 100) / n);
    const t = r2(q * n);
    return Q('Formas de pagamento', 'medio',
      `🧮 À vista: ${brl(v)}. Parcelado: ${n}x de ${brl(q)}. Quanto você paga A MAIS no parcelado?`,
      r2(t - v), [t, q, r2(t - v) * 2, r2(v / n)], brl,
      `Parcelado: ${n} × ${brl(q)} = ${brl(t)}. Diferença: ${brl(t)} − ${brl(v)} = ${brl(t - v)}.`);
  },
  () => {
    const v = 20 * R.int(5, 25);
    const p = R.pick([5, 10, 15]);
    const n = R.pick([3, 5, 10]);
    const d = v * p / 100;
    return Q('Formas de pagamento', 'medio',
      `📲 Um produto custa ${brl(v)} em ${n}x sem juros, ou tem ${p}% de desconto no Pix à vista. Quanto se economiza pagando no Pix?`,
      d, [v - d, v / n, d * 2, p], brl,
      `${p}% de ${brl(v)} = ${brl(d)}. No Pix você paga ${brl(v - d)}.`);
  },
  () => {
    const v = 100 * R.int(1, 6);
    const p = R.pick([5, 10, 12, 20, 25]);
    const n = R.pick([4, 5, 10]);
    const t = v * (1 + p / 100);
    return Q('Formas de pagamento', 'dificil',
      `📉 À vista custa ${brl(v)}. Parcelado em ${n}x, o total fica ${brl(t)}. Quantos por cento a mais se paga no parcelado?`,
      p, [100 + p, p / n, p * 2, t - v], pc,
      `Diferença: ${brl(t)} − ${brl(v)} = ${brl(t - v)}. Em porcentagem: ${brl(t - v)} ÷ ${brl(v)} × 100 = ${pc(p)}.`);
  },
  () => {
    const n = R.pick([3, 4, 5, 6]);
    const v = n * R.int(15, 50);
    const sem = Math.random() < 0.5;
    const q = sem ? v / n : r2(v / n + R.pick([2, 3, 5]));
    const t = r2(q * n);
    const ok = 'Sim, o total parcelado é igual ao preço à vista';
    const no = `Não, o total parcelado é ${brl(t)}`;
    return Q('Formas de pagamento', 'medio',
      `🕵️ O anúncio diz "${n}x SEM JUROS" para um produto de ${brl(v)} à vista, com parcelas de ${brl(q)}. O anúncio é verdadeiro?`,
      sem ? ok : no,
      [sem ? `Não, o total parcelado é ${brl(t + n * 3)}` : ok, 'Não dá para saber sem a nota fiscal', `Sim, porque a parcela é menor que ${brl(v)}`], txt,
      `${n} × ${brl(q)} = ${brl(t)}. ${sem ? 'É igual ao preço à vista, então não há juros.' : `É maior que ${brl(v)}, então existem juros escondidos.`}`);
  },
];

/* ---------------- FASE 7 · PLANEJAMENTO E METAS ---------------- */
const G_PLANEJAMENTO = [
  () => {
    const s = R.pick([5, 10, 15, 20, 25]);
    const sem = R.int(4, 15);
    const m = s * sem;
    const prod = R.pick(PRODUTOS);
    return Q('Planejamento financeiro', 'facil',
      `🎯 ${R.pick(NOMES)} quer comprar ${prod.um} ${prod.e} de ${brl(m)} e guarda ${brl(s)} por semana. Em quantas semanas alcança a meta?`,
      sem, [sem + 2, sem - 2, sem * 2, s], v => `${num(v)} semanas`,
      `${brl(m)} ÷ ${brl(s)} = ${sem} semanas.`);
  },
  () => {
    const m = 10 * R.int(5, 20);
    const p = R.pick([10, 20, 25, 30, 50]);
    const k = R.pick([3, 4, 6, 10, 12]);
    const g = m * p / 100 * k;
    return Q('Planejamento financeiro', 'medio',
      `🐷 ${R.pick(NOMES)} recebe ${brl(m)} por mês e guarda ${p}% no cofrinho. Quanto terá guardado em ${k} meses?`,
      g, [m * p / 100, m * k, g * 2, m * k - g], brl,
      `Por mês: ${p}% de ${brl(m)} = ${brl(m * p / 100)}. Em ${k} meses: ${k} × ${brl(m * p / 100)} = ${brl(g)}.`);
  },
  () => {
    const m = 10 * R.int(8, 20);
    const a = R.int(10, 30), b = R.int(10, 30), c = R.int(5, 20);
    const s = m - a - b - c;
    return Q('Planejamento financeiro', 'facil',
      `📋 Orçamento do mês: mesada de ${brl(m)}. Gastos: ${brl(a)} com lanche, ${brl(b)} com recarga do celular e ${brl(c)} com transporte. Quanto sobra?`,
      s, [a + b + c, s + 10, m - a - b, s - 5], brl,
      `Gastos: ${brl(a)} + ${brl(b)} + ${brl(c)} = ${brl(a + b + c)}. Sobra: ${brl(m)} − ${brl(a + b + c)} = ${brl(s)}.`);
  },
  () => {
    const k = R.pick([4, 5, 8, 10]);
    const s = R.pick([6, 8, 12, 15, 20, 25]);
    const x = s * k;
    const prod = R.pick(PRODUTOS);
    return Q('Planejamento financeiro', 'medio',
      `📅 Faltam ${k} semanas para o aniversário. Para comprar ${prod.um} de ${brl(x)}, quanto é preciso guardar por semana?`,
      s, [x, s + 5, s * 2, x - k], brl,
      `${brl(x)} ÷ ${k} semanas = ${brl(s)} por semana.`);
  },
  () => {
    const s = R.pick([10, 15, 20, 25]);
    const sem = R.int(3, 10);
    const ja = 10 * R.int(2, 10);
    const m = ja + s * sem;
    return Q('Planejamento financeiro', 'dificil',
      `🏁 A meta é ${brl(m)}. Você já tem ${brl(ja)} e consegue guardar ${brl(s)} por semana. Quantas semanas faltam?`,
      sem, [Math.ceil(m / s), sem + 1, sem - 1, sem * 2], v => `${num(v)} semanas`,
      `Falta: ${brl(m)} − ${brl(ja)} = ${brl(m - ja)}. Semanas: ${brl(m - ja)} ÷ ${brl(s)} = ${sem}.`);
  },
  () => {
    const m = 20 * R.int(3, 15);
    const tipo = R.pick([['necessidades', 50], ['desejos', 30], ['poupança', 20]]);
    const r = m * tipo[1] / 100;
    return Q('Planejamento financeiro', 'medio',
      `🧩 Regra 50-30-20: 50% para necessidades, 30% para desejos e 20% para poupar. Com ${brl(m)}, quanto vai para ${tipo[0]}?`,
      r, [m * 0.5, m * 0.3, m * 0.2, m - r].filter(v => r2(v) !== r2(r)), brl,
      `${tipo[1]}% de ${brl(m)} = ${brl(r)}.`);
  },
];

/* ---------------- QUESTÕES DIFÍCEIS EXTRAS (cálculo) ---------------- */
G_PORCENTAGEM.push(() => {
  let N, p1, p2, r;
  do {
    N = R.pick([200, 400, 500, 600, 800]); p1 = R.pick([20, 25, 40, 50]); p2 = R.pick([10, 20, 25, 50, 75]);
    r = N * p1 / 100 * p2 / 100;
  } while (!Number.isInteger(r));
  const p8 = N * p1 / 100;
  return Q('Porcentagem', 'dificil',
    `🏫 Uma escola de Rio Tinto tem ${N} estudantes. ${p1}% deles são do 8º ano. Desses, ${p2}% já compraram algo pela internet. Quantos estudantes do 8º ano já compraram pela internet?`,
    r, [p8, N * p2 / 100, N * (p1 + p2) / 100, r * 2], num,
    `Primeiro: ${p1}% de ${N} = ${p8} estudantes do 8º ano. Depois: ${p2}% de ${p8} = ${r}. Porcentagem de porcentagem se calcula em etapas.`);
});

G_DESCONTO.push(() => {
  const p1 = R.pick([10, 20, 30, 40]), p2 = R.pick([10, 20, 25, 50]);
  const unico = r2(100 - (100 - p1) * (100 - p2) / 100);
  return Q('Descontos', 'dificil',
    `🧾 Uma loja dá ${p1}% de desconto e, depois, mais ${p2}% sobre o novo preço. Esses dois descontos equivalem a um desconto ÚNICO de:`,
    unico, [p1 + p2, Math.abs(p1 - p2) || p1 / 2, r2(p1 * p2 / 100), unico + 5], pc,
    `Sobra ${100 - p1}% do preço e, depois, ${100 - p2}% disso: ${num((100 - p1) / 100)} × ${num((100 - p2) / 100)} = ${num((100 - unico) / 100)}. Então se paga ${pc(100 - unico)} e o desconto único é ${pc(unico)}, e não ${p1 + p2}%.`);
});

G_ACRESCIMO.push(
  () => {
    const v = 20 * R.int(2, 15);
    const p = R.pick([10, 20, 25, 50]);
    const f = v * (1 + p / 100);
    return Q('Acréscimos', 'dificil',
      `🔎 Depois de um aumento de ${p}%, a conta de internet passou a custar ${brl(f)}. Quanto custava antes do aumento?`,
      v, [f * (1 - p / 100), f - p, f + f * p / 100, v - 10], brl,
      `Depois do aumento, o preço é ${100 + p}% do antigo. Então antigo = ${brl(f)} ÷ ${num(1 + p / 100)} = ${brl(v)}. Tirar ${p}% de ${brl(f)} dá outro valor!`);
  },
  () => {
    const p1 = R.pick([10, 20, 50]), p2 = R.pick([10, 20, 25]);
    const total = r2(((1 + p1 / 100) * (1 + p2 / 100) - 1) * 100);
    return Q('Acréscimos', 'dificil',
      `📈 O preço do gás subiu ${p1}% em um mês e ${p2}% no mês seguinte. Qual foi o aumento total nos dois meses?`,
      total, [p1 + p2, total + 5, r2(p1 * p2 / 100), 100 + p1 + p2], pc,
      `Fatores: ${num(1 + p1 / 100)} × ${num(1 + p2 / 100)} = ${num(1 + total / 100)}. Isso é um aumento de ${pc(total)}, maior que a soma ${p1 + p2}%, porque o 2º aumento incide sobre o preço já aumentado.`);
  },
);

G_JUROS.push(() => {
  const c = R.pick([500, 600, 800, 1000, 1200]);
  let i1, t1, i2, t2, j1, j2;
  do {
    i1 = R.pick([2, 3, 4, 5]); t1 = R.int(2, 6); i2 = R.pick([2, 3, 4, 5]); t2 = R.int(2, 6);
    j1 = c * i1 * t1 / 100; j2 = c * i2 * t2 / 100;
  } while (j1 === j2 || (i1 === i2 && t1 === t2));
  const melhor = j1 < j2 ? 'A' : 'B', pior = j1 < j2 ? 'B' : 'A', dif = Math.abs(j1 - j2);
  return Q('Juros simples', 'dificil',
    `🏦 Para pegar ${brl(c)} emprestado, há duas opções de juros simples:\n• Opção A: ${i1}% ao mês por ${t1} meses\n• Opção B: ${i2}% ao mês por ${t2} meses\nQual cobra menos juros e quanto a menos?`,
    `Opção ${melhor}, ${brl(dif)} a menos`,
    [`Opção ${pior}, ${brl(dif)} a menos`, `Opção ${melhor}, ${brl(dif * 2)} a menos`, `As duas cobram o mesmo`], txt,
    `A: ${brl(c)} × ${i1}% × ${t1} = ${brl(j1)}. B: ${brl(c)} × ${i2}% × ${t2} = ${brl(j2)}. A opção ${melhor} cobra ${brl(dif)} a menos. Taxa menor nem sempre é mais barata: o tempo também conta!`);
});

G_COMPARACAO.push(
  () => {
    let na, pa, nb, pb, ua, ub;
    do {
      na = R.pick([2, 3, 4, 5]); nb = R.pick([6, 8, 10, 12]);
      ua = R.pick([2, 2.5, 3, 3.5, 4]); ub = R.pick([2, 2.5, 3, 3.5, 4]);
      pa = na * ua; pb = nb * ub;
    } while (ua === ub);
    const melhor = ua < ub ? `O de ${nb}` : `O de ${na}`;
    const melhorC = ua < ub ? `O de ${nb}` : `O de ${na}`;
    const pior = ua < ub ? `O de ${na}` : `O de ${nb}`;
    const um = Math.min(ua, ub), outro = Math.max(ua, ub);
    return Q('Comparação de preços', 'dificil',
      `🥤 No mercado tem dois pacotes do mesmo refrigerante em lata:\n• ${na} latas por ${brl(pa)}\n• ${nb} latas por ${brl(pb)}\nQual pacote tem o menor preço por lata?`,
      `${melhorC} latas, ${brl(um)} por lata`,
      [`${pior} latas, ${brl(outro)} por lata`, `${pior} latas, ${brl(um)} por lata`, `${melhor} latas, ${brl(outro)} por lata`], txt,
      `${brl(pa)} ÷ ${na} = ${brl(ua)} por lata. ${brl(pb)} ÷ ${nb} = ${brl(ub)} por lata. O menor preço por unidade é ${brl(um)}. Pacote maior nem sempre é mais barato!`);
  },
  () => {
    const preco = R.pick([5, 8, 10, 12, 15]);
    const chance = R.pick([2, 4, 5, 10]);
    const caixas = 100 / chance;
    const total = caixas * preco;
    return Q('Comparação de preços', 'dificil',
      `🎁 Num jogo, uma caixa-surpresa custa ${brl(preco)} e tem ${chance}% de chance de vir o item raro. Em média, quanto alguém gasta até conseguir o item?`,
      total, [preco * chance, preco, total / 2, preco * 10], brl,
      `${chance}% = ${chance} em 100, ou 1 em cada ${caixas} caixas. Em média: ${caixas} × ${brl(preco)} = ${brl(total)}. Caixas-surpresa parecem baratas, mas a soma sai cara!`);
  },
  () => {
    const u = 10 * R.int(2, 9);
    const p = R.pick([20, 25, 30, 40]);
    const leve3 = 2 * u, desc = 3 * u * (1 - p / 100);
    const melhor = leve3 < desc ? '"Leve 3, pague 2"' : `${p}% de desconto`;
    return Q('Comparação de preços', 'dificil',
      `🛍️ Uma camiseta custa ${brl(u)}. Você quer 3. A loja oferece "Leve 3, pague 2" OU ${p}% de desconto em cada uma. Qual sai mais barato para as 3?`,
      `${melhor}: ${brl(Math.min(leve3, desc))}`,
      [`${leve3 < desc ? `${p}% de desconto` : '"Leve 3, pague 2"'}: ${brl(Math.max(leve3, desc))}`, `${melhor}: ${brl(Math.max(leve3, desc))}`, 'As duas dão o mesmo preço'], txt,
      `Leve 3, pague 2: 2 × ${brl(u)} = ${brl(leve3)} (é como ter 33% de desconto). Com ${p}%: 3 × ${brl(u)} × ${num(1 - p / 100)} = ${brl(desc)}. A melhor oferta custa ${brl(Math.min(leve3, desc))}.`);
  },
);

G_PAGAMENTO.push(() => {
  const v = 100 * R.int(3, 10);
  const e = R.pick([50, 100, 150]);
  const n = R.pick([4, 5, 6, 10]);
  const q = Math.ceil((v - e) * 1.2 / n);
  const t = e + n * q;
  const p = r2((t - v) / v * 100);
  return Q('Formas de pagamento', 'dificil',
    `🛵 Uma bicicleta custa ${brl(v)} à vista. A prazo, é ${brl(e)} de entrada mais ${n} parcelas de ${brl(q)}. Quantos por cento a mais se paga a prazo?`,
    p, [r2((n * q - (v - e)) / (v - e) * 100), r2(p / n), r2(t - v), r2(p + 10)], pc,
    `Total a prazo: ${brl(e)} + ${n} × ${brl(q)} = ${brl(t)}. Diferença: ${brl(t - v)}. Em porcentagem do preço à vista: ${brl(t - v)} ÷ ${brl(v)} × 100 ≈ ${pc(p)}. Não esqueça de somar a entrada!`);
});

G_PLANEJAMENTO.push(() => {
  const l = R.pick([3, 4, 5, 6]);
  const d = R.pick([3, 4, 5]);
  const s = R.pick([4, 6, 8, 10]);
  const eco = l * d * s;
  const prod = R.pick(PRODUTOS);
  const preco = eco + 10 * R.int(-3, 3);
  const ok = eco >= preco;
  return Q('Planejamento financeiro', 'dificil',
    `🥪 ${R.pick(NOMES)} gasta ${brl(l)} com lanche na cantina, ${d} dias por semana. Se levar lanche de casa durante ${s} semanas, quanto economiza? Dá para comprar ${prod.um} de ${brl(preco)}?`,
    `${brl(eco)}, ${ok ? 'e dá para comprar' : 'mas ainda não dá para comprar'}`,
    [`${brl(eco)}, ${ok ? 'mas ainda não dá para comprar' : 'e dá para comprar'}`, `${brl(l * s)}, ${ok ? 'mas ainda não dá para comprar' : 'e dá para comprar'}`, `${brl(l * d)}, ${ok ? 'e dá para comprar' : 'mas ainda não dá para comprar'}`], txt,
    `Por semana: ${d} × ${brl(l)} = ${brl(l * d)}. Em ${s} semanas: ${s} × ${brl(l * d)} = ${brl(eco)}. Como ${brl(eco)} ${ok ? '≥' : '<'} ${brl(preco)}, ${ok ? 'dá para comprar' : `faltam ${brl(preco - eco)}`}. Pequenos gastos somados viram muito dinheiro!`);
});

/* ---------------- GRÁFICOS E TABELAS ---------------- */
/* Cores categóricas validadas para daltonismo (ordem fixa, nunca reciclada). */
const CORES_GRAF = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
const COR_SERIE = '#2a78d6';

const CENARIOS = [
  { titulo: 'Como a turma gasta a mesada', cats: ['Lanche', 'Recarga', 'Transporte', 'Jogos', 'Poupança'] },
  { titulo: 'Forma de pagamento preferida', cats: ['Pix', 'Dinheiro', 'Cartão', 'Boleto'] },
  { titulo: 'Onde a turma mais compra', cats: ['Internet', 'Feira', 'Mercado', 'Bodega'] },
  { titulo: 'O que a turma mais faz no celular', cats: ['Vídeos', 'Mensagens', 'Jogos', 'Estudos'] },
];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

/* Sorteia n porcentagens diferentes, múltiplas de 5, que somam 100%. */
function porcentagens(n) {
  for (;;) {
    const v = Array.from({ length: n }, () => 5 * R.int(1, 10));
    const falta = 100 - v.slice(1).reduce((s, x) => s + x, 0);
    v[0] = falta;
    if (falta >= 5 && falta <= 60 && new Set(v).size === n) return R.shuffle(v);
  }
}
/* Sorteia n quantidades diferentes que somam total. */
function quantidades(n, total) {
  for (;;) {
    const v = Array.from({ length: n - 1 }, () => R.int(1, Math.floor(total / 2)));
    const ultimo = total - v.reduce((s, x) => s + x, 0);
    v.push(ultimo);
    if (ultimo >= 1 && new Set(v).size === n) return R.shuffle(v);
  }
}
function cenario(n) {
  const c = R.pick(CENARIOS.filter(x => x.cats.length >= n));
  return { titulo: c.titulo, cats: R.shuffle(c.cats).slice(0, n) };
}

const tituloGraf = t => `<figcaption>${t}</figcaption>`;

function grafSetores(titulo, itens) {
  const total = itens.reduce((s, i) => s + i.v, 0);
  let ang = -Math.PI / 2;
  const fatias = itens.map((it, k) => {
    const a = it.v / total * Math.PI * 2;
    const x1 = 100 + 88 * Math.cos(ang), y1 = 100 + 88 * Math.sin(ang);
    ang += a;
    const x2 = 100 + 88 * Math.cos(ang), y2 = 100 + 88 * Math.sin(ang);
    const meio = ang - a / 2;
    const lx = 100 + 56 * Math.cos(meio), ly = 100 + 56 * Math.sin(meio);
    const rot = it.oculto ? '?' : `${it.v}%`;
    return `<path d="M100 100 L${x1.toFixed(2)} ${y1.toFixed(2)} A88 88 0 ${a > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z" fill="${CORES_GRAF[k]}" stroke="#fff" stroke-width="2.5"><title>${it.r}: ${rot}</title></path>
      ${it.v >= 10 ? `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="g-rot-fatia">${rot}</text>` : ''}`;
  }).join('');
  const legenda = itens.map((it, k) => `<li><i style="background:${CORES_GRAF[k]}"></i>${it.r}<b>${it.oculto ? '?' : it.v + '%'}</b></li>`).join('');
  return `<figure class="graf graf-setores">${tituloGraf(titulo)}<div class="graf-corpo"><svg viewBox="0 0 200 200" class="g-pizza" role="img" aria-label="Gráfico">${fatias}</svg><ul class="graf-legenda">${legenda}</ul></div></figure>`;
}

function grafColunas(titulo, itens, fmt) {
  const W = 320, H = 210, x0 = 14, x1 = W - 14, yTopo = 26, yBase = 170;
  const max = Math.max(...itens.map(i => i.v));
  const passo = (x1 - x0) / itens.length, larg = Math.min(46, passo * 0.62);
  const grade = [0.25, 0.5, 0.75, 1].map(f => `<line x1="${x0}" x2="${x1}" y1="${yBase - (yBase - yTopo) * f}" y2="${yBase - (yBase - yTopo) * f}" class="g-grade"/>`).join('');
  const barras = itens.map((it, k) => {
    const h = (yBase - yTopo) * it.v / max, x = x0 + passo * k + (passo - larg) / 2, y = yBase - h;
    return `<path d="M${x} ${yBase} V${y + 4} Q${x} ${y} ${x + 4} ${y} H${x + larg - 4} Q${x + larg} ${y} ${x + larg} ${y + 4} V${yBase}Z" fill="${COR_SERIE}"><title>${it.r}: ${fmt(it.v)}</title></path>
      <text x="${x + larg / 2}" y="${y - 6}" class="g-valor">${fmt(it.v)}</text>
      <text x="${x + larg / 2}" y="${yBase + 18}" class="g-cat">${it.r}</text>`;
  }).join('');
  return `<figure class="graf">${tituloGraf(titulo)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico">${grade}${barras}<line x1="${x0}" x2="${x1}" y1="${yBase}" y2="${yBase}" class="g-eixo"/></svg></figure>`;
}

function grafBarras(titulo, itens, fmt) {
  const W = 320, alt = 30, gap = 10, xr = 92, xf = W - 52;
  const H = itens.length * (alt + gap) + 6;
  const max = Math.max(...itens.map(i => i.v));
  const barras = itens.map((it, k) => {
    const y = 4 + k * (alt + gap), w = (xf - xr) * it.v / max;
    return `<text x="${xr - 8}" y="${y + alt / 2 + 5}" class="g-cat g-cat-esq">${it.r}</text>
      <path d="M${xr} ${y} H${xr + w - 4} Q${xr + w} ${y} ${xr + w} ${y + 4} V${y + alt - 4} Q${xr + w} ${y + alt} ${xr + w - 4} ${y + alt} H${xr}Z" fill="${COR_SERIE}"><title>${it.r}: ${fmt(it.v)}</title></path>
      <text x="${xr + w + 6}" y="${y + alt / 2 + 5}" class="g-valor g-valor-dir">${fmt(it.v)}</text>`;
  }).join('');
  return `<figure class="graf">${tituloGraf(titulo)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico">${barras}<line x1="${xr}" x2="${xr}" y1="0" y2="${H}" class="g-eixo"/></svg></figure>`;
}

function grafLinhas(titulo, pontos, fmt) {
  const W = 320, H = 200, x0 = 30, x1 = W - 30, yTopo = 34, yBase = 160;
  const vs = pontos.map(p => p.v), min = Math.min(...vs) * 0.8, max = Math.max(...vs) * 1.05;
  const X = k => x0 + (x1 - x0) * k / (pontos.length - 1);
  const Y = v => yBase - (yBase - yTopo) * (v - min) / (max - min);
  const grade = [0, 0.33, 0.66, 1].map(f => `<line x1="${x0 - 14}" x2="${x1 + 14}" y1="${yBase - (yBase - yTopo) * f}" y2="${yBase - (yBase - yTopo) * f}" class="g-grade"/>`).join('');
  const linha = pontos.map((p, k) => `${X(k).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
  const marcas = pontos.map((p, k) => `<circle cx="${X(k)}" cy="${Y(p.v)}" r="5" fill="${COR_SERIE}" stroke="#fff" stroke-width="2"><title>${p.r}: ${fmt(p.v)}</title></circle>
    <text x="${X(k)}" y="${Y(p.v) - 11}" class="g-valor">${fmt(p.v)}</text>
    <text x="${X(k)}" y="${yBase + 22}" class="g-cat">${p.r}</text>`).join('');
  return `<figure class="graf">${tituloGraf(titulo)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico">${grade}<line x1="${x0 - 14}" x2="${x1 + 14}" y1="${yBase}" y2="${yBase}" class="g-eixo"/><polyline points="${linha}" fill="none" stroke="${COR_SERIE}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${marcas}</svg></figure>`;
}

function tabelaHTML(titulo, cabecalho, linhas) {
  return `<figure class="graf">${tituloGraf(titulo)}<table class="graf-tabela"><thead><tr>${cabecalho.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map((c, k) => k ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></figure>`;
}

const fmtPc = v => v + '%';
const NOMES_GRAF = { setores: 'Gráfico de setores (pizza)', colunas: 'Gráfico de colunas', barras: 'Gráfico de barras (horizontais)', linhas: 'Gráfico de linhas' };
const CURTO_GRAF = { setores: 'Setores (pizza)', colunas: 'Colunas', barras: 'Barras', linhas: 'Linhas' };
const EXPLICA_GRAF = {
  setores: 'O gráfico de setores (pizza) é um círculo dividido em fatias. Cada fatia é uma parte do todo, e as fatias somam 100%.',
  colunas: 'O gráfico de colunas usa retângulos em pé (verticais). Quanto mais alta a coluna, maior o valor.',
  barras: 'O gráfico de barras usa retângulos deitados (horizontais). Quanto mais comprida a barra, maior o valor.',
  linhas: 'O gráfico de linhas liga pontos e mostra como um valor muda ao longo do tempo.',
};

function desenharCategorias(tipo, titulo, itens, fmt = fmtPc) {
  if (tipo === 'setores') return grafSetores(titulo, itens);
  if (tipo === 'colunas') return grafColunas(titulo, itens, fmt);
  return grafBarras(titulo, itens, fmt);
}

function QV(visual, ...args) { const q = Q(...args); q.visual = visual; return q; }

const G_GRAFICOS = [
  // Que tipo de gráfico é esse?
  () => {
    const tipo = R.pick(['setores', 'colunas', 'barras', 'linhas']);
    let visual;
    if (tipo === 'linhas') {
      const prod = R.pick(PRODUTOS);
      const pts = MESES.map(m => ({ r: m, v: 10 * R.int(5, 15) }));
      visual = grafLinhas(`Preço de ${prod.um} em 2026`, pts, v => 'R$ ' + v);
    } else {
      const c = cenario(4);
      const vs = porcentagens(4);
      visual = desenharCategorias(tipo, c.titulo, c.cats.map((r, k) => ({ r, v: vs[k] })));
    }
    return QV(visual, 'Gráficos e tabelas', 'facil', '📊 Observe a imagem. Que tipo de gráfico é esse?',
      NOMES_GRAF[tipo], Object.keys(NOMES_GRAF).filter(t => t !== tipo).map(t => NOMES_GRAF[t]), txt, EXPLICA_GRAF[tipo]);
  },
  // Que tipo de gráfico é esse e qual é a maior porcentagem?
  () => {
    const tipo = R.pick(['setores', 'colunas', 'barras']);
    const outro = R.pick(['setores', 'colunas', 'barras', 'linhas'].filter(t => t !== tipo));
    const c = cenario(R.pick([4, 4, 5]));
    const vs = porcentagens(c.cats.length);
    const itens = c.cats.map((r, k) => ({ r, v: vs[k] }));
    const ord = [...itens].sort((a, b) => b.v - a.v);
    const [m1, m2] = ord;
    return QV(desenharCategorias(tipo, c.titulo, itens), 'Gráficos e tabelas', 'medio',
      '🔍 Que tipo de gráfico é esse e qual é a maior porcentagem?',
      `${CURTO_GRAF[tipo]}: ${m1.r} com ${m1.v}%`,
      [`${CURTO_GRAF[outro]}: ${m1.r} com ${m1.v}%`, `${CURTO_GRAF[tipo]}: ${m2.r} com ${m2.v}%`, `${CURTO_GRAF[outro]}: ${m2.r} com ${m2.v}%`], txt,
      `${EXPLICA_GRAF[tipo]} A maior porcentagem é ${m1.r}, com ${m1.v}%. A segunda é ${m2.r}, com ${m2.v}%.`);
  },
  // Reais da maior fatia
  () => {
    const M = 20 * R.int(3, 15);
    const cats = R.shuffle(CENARIOS[0].cats).slice(0, 4);
    const vs = porcentagens(4);
    const itens = cats.map((r, k) => ({ r, v: vs[k] }));
    const [m1, m2] = [...itens].sort((a, b) => b.v - a.v);
    const ans = M * m1.v / 100;
    return QV(grafSetores('Como a turma gasta a mesada', itens), 'Gráficos e tabelas', 'dificil',
      `💵 Cada estudante recebe, em média, ${brl(M)} de mesada e gasta como mostra o gráfico. Quantos reais vão para a categoria de MAIOR porcentagem?`,
      ans, [m1.v, M * m2.v / 100, M - ans, M * m1.v / 10], brl,
      `A maior fatia é ${m1.r}, com ${m1.v}%. ${m1.v}% de ${brl(M)} = ${m1.v}/100 × ${brl(M)} = ${brl(ans)}.`);
  },
  // Fatia que falta
  () => {
    const c = cenario(4);
    const vs = porcentagens(4);
    const k = R.int(0, 3);
    const itens = c.cats.map((r, j) => ({ r, v: vs[j], oculto: j === k }));
    const soma = 100 - vs[k];
    return QV(grafSetores(c.titulo, itens), 'Gráficos e tabelas', 'medio',
      `🧩 No gráfico de setores, a porcentagem de "${c.cats[k]}" sumiu. Qual é ela?`,
      vs[k], [soma, vs[k] + 5, vs[k] - 5, vs[k] + 10], fmtPc,
      `Um gráfico de setores sempre soma 100%. As outras fatias somam ${soma}%. Então: 100% − ${soma}% = ${vs[k]}%.`);
  },
  // Contagem → porcentagem
  () => {
    const N = R.pick([20, 25, 50]);
    const cats = R.shuffle(CENARIOS[1].cats);
    const qs = quantidades(4, N);
    const itens = cats.map((r, k) => ({ r, v: qs[k] }));
    const alvo = R.pick(itens);
    const ans = alvo.v / N * 100;
    const outro = itens.find(i => i !== alvo);
    return QV(grafColunas(`Pesquisa com ${N} estudantes: pagamento preferido`, itens, v => String(v)), 'Gráficos e tabelas', 'dificil',
      `👥 O gráfico mostra quantos estudantes (de ${N}) escolheram cada forma de pagamento. Que porcentagem da turma prefere ${alvo.r}?`,
      ans, [alvo.v, 100 - ans, outro.v / N * 100, ans / 2], pc,
      `${alvo.r}: ${alvo.v} de ${N} estudantes. ${alvo.v} ÷ ${N} = ${num(alvo.v / N)}. Multiplicando por 100: ${pc(ans)}.`);
  },
  // Gráfico de linhas: aumento percentual
  () => {
    const v0 = 20 * R.int(2, 10);
    const p = R.pick([10, 20, 25, 30, 40, 50]);
    const vf = v0 * (1 + p / 100);
    const meio = [1, 2, 3].map(() => Math.round(v0 * 0.9 + Math.random() * (vf * 1.08 - v0 * 0.9)));
    const pts = [v0, ...meio, vf].map((v, k) => ({ r: MESES[k], v }));
    const prod = R.pick(PRODUTOS);
    return QV(grafLinhas(`Preço de ${prod.um} (R$)`, pts, v => num(v)), 'Gráficos e tabelas', 'dificil',
      `📈 O gráfico de linhas mostra o preço de ${prod.um} de janeiro a maio. De quantos por cento foi o aumento de janeiro para maio?`,
      p, [vf - v0, p / 2, p + 10, 100 + p], pc,
      `Janeiro: ${brl(v0)}. Maio: ${brl(vf)}. Aumento: ${brl(vf - v0)}. Em porcentagem: ${brl(vf - v0)} ÷ ${brl(v0)} × 100 = ${pc(p)}.`);
  },
  // Tabela de dupla entrada
  () => {
    const cats = R.shuffle(CENARIOS[1].cats).slice(0, 3);
    let a, b;
    do { a = porcentagens(3); b = porcentagens(3); } while (new Set([...a, ...b]).size < 5 || Math.max(...a) === Math.max(...b));
    const cel = [];
    cats.forEach((c, k) => { cel.push({ c, t: '8º A', v: a[k] }); cel.push({ c, t: '8º B', v: b[k] }); });
    const ord = [...cel].sort((x, y) => y.v - x.v);
    const m1 = ord[0], m2 = ord.find(x => x.v < m1.v);
    const visual = tabelaHTML('Forma de pagamento preferida (%)', ['', '8º A', '8º B'], cats.map((c, k) => [c, a[k] + '%', b[k] + '%']));
    return QV(visual, 'Gráficos e tabelas', 'dificil',
      '📋 Que tipo de tabela é essa e qual é a maior porcentagem?',
      `Dupla entrada: ${m1.v}% (${m1.c}, ${m1.t})`,
      [`Tabela simples: ${m1.v}% (${m1.c}, ${m1.t})`, `Dupla entrada: ${m2.v}% (${m2.c}, ${m2.t})`, `Tabela simples: ${m2.v}% (${m2.c}, ${m2.t})`], txt,
      `É uma tabela de dupla entrada, porque cruza duas informações: a forma de pagamento (linhas) e a turma (colunas). O maior valor é ${m1.v}%, em ${m1.c} no ${m1.t}.`);
  },
  // Tabela simples
  () => {
    const c = cenario(R.pick([4, 5]));
    const vs = porcentagens(c.cats.length);
    const itens = c.cats.map((r, k) => ({ r, v: vs[k] }));
    const ord = [...itens].sort((x, y) => y.v - x.v);
    const m1 = ord[0], m2 = ord[1], mn = ord[ord.length - 1];
    return QV(tabelaHTML(c.titulo, ['Resposta', 'Porcentagem'], itens.map(i => [i.r, i.v + '%'])), 'Gráficos e tabelas', 'medio',
      '📋 Que tipo de tabela é essa e qual é a maior porcentagem?',
      `Tabela simples: ${m1.r} com ${m1.v}%`,
      [`Dupla entrada: ${m1.r} com ${m1.v}%`, `Tabela simples: ${m2.r} com ${m2.v}%`, `Tabela simples: ${mn.r} com ${mn.v}%`], txt,
      `É uma tabela simples, porque mostra só uma informação (${c.titulo.toLowerCase()}) em uma coluna de valores. O maior valor é ${m1.r}, com ${m1.v}%.`);
  },
  // Diferença entre categorias em número de pessoas
  () => {
    const N = R.pick([40, 60, 80]);
    const c = cenario(4);
    const vs = porcentagens(4);
    const itens = c.cats.map((r, k) => ({ r, v: vs[k] }));
    const ord = [...itens].sort((x, y) => y.v - x.v);
    const a = ord[0], b = ord[ord.length - 1];
    const ans = N * (a.v - b.v) / 100;
    return QV(grafBarras(c.titulo, itens, fmtPc), 'Gráficos e tabelas', 'dificil',
      `🧮 A pesquisa do gráfico foi feita com ${N} estudantes. Quantos estudantes a MAIS escolheram "${a.r}" do que "${b.r}"?`,
      ans, [a.v - b.v, N * a.v / 100, ans + 2, ans * 2], num,
      `"${a.r}": ${a.v}% de ${N} = ${N * a.v / 100}. "${b.r}": ${b.v}% de ${N} = ${N * b.v / 100}. Diferença: ${N * a.v / 100} − ${N * b.v / 100} = ${ans} estudantes.`);
  },
];

/* ---------------- CONSUMO CONSCIENTE E EDUCAÇÃO FINANCEIRA ---------------- */
const BANCO_CONSUMO = [
  { tema: 'Consumo consciente', n: 'facil', t: '🤔 Antes de comprar algo por impulso, qual é uma boa atitude?',
    c: 'Esperar um tempo e pensar se realmente precisa', e: ['Comprar logo antes que acabe', 'Comprar dois para garantir', 'Pedir emprestado para comprar'],
    x: 'Esperar um pouco ajuda a separar necessidade de desejo e evita arrependimento.' },
  { tema: 'Consumo consciente', n: 'medio', t: '⏰ O anúncio diz "SÓ HOJE! ÚLTIMAS UNIDADES!" com um relógio contando. Qual a intenção?',
    c: 'Criar pressa para você comprar sem pensar', e: ['Ajudar você a economizar', 'Avisar que a loja vai fechar', 'Informar o horário de entrega'],
    x: 'A sensação de urgência é uma técnica de publicidade para estimular compras por impulso.' },
  { tema: 'Consumo consciente', n: 'medio', t: '📱 Um influenciador mostra um produto e diz que é "o melhor do mundo". O que considerar?',
    c: 'Que ele pode estar sendo pago para divulgar (publicidade)', e: ['Que é sempre uma opinião imparcial', 'Que o produto é o mais barato', 'Que todos precisam comprar'],
    x: 'Muitas postagens são publicidade paga. Busque outras opiniões e compare.' },
  { tema: 'Consumo consciente', n: 'facil', t: '🧺 Qual destas opções é uma NECESSIDADE e não um desejo?',
    c: 'Material escolar para estudar', e: ['A terceira capinha de celular', 'Um skin novo no jogo', 'Um tênis igual ao que você já tem'],
    x: 'Necessidades são coisas essenciais. Desejos são vontades que podem esperar.' },
  { tema: 'Consumo consciente', n: 'facil', t: '♻️ Qual atitude ajuda o meio ambiente e o bolso ao mesmo tempo?',
    c: 'Consertar, reutilizar ou trocar objetos antes de comprar novos', e: ['Trocar de celular todo ano', 'Comprar tudo descartável', 'Comprar sempre o maior tamanho, mesmo sem usar'],
    x: 'Reutilizar e consertar reduz gastos e lixo.' },
  { tema: 'Educação financeira', n: 'facil', t: '💸 Por que é importante anotar seus gastos?',
    c: 'Para saber para onde o dinheiro vai e conseguir planejar', e: ['Para gastar mais rápido', 'Porque é obrigatório por lei', 'Não é importante'],
    x: 'Registrar gastos ajuda a encontrar onde economizar e a alcançar metas.' },
  { tema: 'Consumo consciente', n: 'medio', t: '🪙 Pontos de jogo e "moedas virtuais" são iguais a dinheiro real?',
    c: 'Não, mas muitos jogos cobram dinheiro real para comprá-los', e: ['Sim, valem o mesmo que reais', 'Sim, podem pagar contas', 'Não, e nunca custam nada'],
    x: 'Moedas virtuais não são dinheiro, mas comprá-las custa dinheiro de verdade. Atenção aos gastos dentro de jogos!' },
  { tema: 'Educação financeira', n: 'dificil', t: '🛍️ Comprar parcelado com muitas parcelas pequenas pode ser perigoso porque:',
    c: 'Várias parcelas juntas comprometem o orçamento dos próximos meses', e: ['Parcela pequena nunca pesa', 'O produto chega mais devagar', 'A loja fica com o produto'],
    x: 'Somando várias parcelas, o valor mensal pode ficar alto. Planeje antes de parcelar.' },
  { tema: 'Educação financeira', n: 'dificil', t: '🎈 O que é inflação?',
    c: 'O aumento geral dos preços, que faz o mesmo dinheiro comprar menos coisas', e: ['Quando todos os preços caem', 'Dinheiro que o banco dá de presente', 'Um desconto dado pelo governo'],
    x: 'Com inflação, R$ 10 hoje compram menos do que compravam antes. Por isso é bom comparar preços e planejar.' },
  { tema: 'Educação financeira', n: 'dificil', t: '🆘 O que é uma reserva de emergência?',
    c: 'Dinheiro guardado para imprevistos, como um conserto ou uma doença', e: ['Dinheiro separado para gastar nas férias', 'Um empréstimo do banco', 'O limite do cartão de crédito'],
    x: 'A reserva evita pegar empréstimo caro quando acontece um imprevisto.' },
  { tema: 'Educação financeira', n: 'dificil', t: '💳 O que acontece com quem paga só o valor MÍNIMO da fatura do cartão de crédito?',
    c: 'O resto da dívida cresce com juros muito altos (juros do rotativo)', e: ['A dívida inteira é quitada', 'O banco dá um desconto', 'Não paga juros nenhum'],
    x: 'Os juros do rotativo do cartão estão entre os mais altos do Brasil. Pagar só o mínimo faz a dívida crescer rápido.' },
  { tema: 'Educação financeira', n: 'dificil', t: '📈 Qual é a diferença entre poupar e investir?',
    c: 'Poupar é guardar parte do dinheiro. Investir é aplicar esse dinheiro para render juros', e: ['São exatamente a mesma coisa', 'Investir é gastar tudo de uma vez', 'Poupar é pedir dinheiro emprestado'],
    x: 'Primeiro a gente poupa (guarda). Depois pode investir para o dinheiro render.' },
  { tema: 'Educação financeira', n: 'dificil', t: '👟 O tênis A custa R$ 120 e dura 24 meses. O tênis B custa R$ 60 e dura 6 meses. Qual tem o melhor custo-benefício?',
    c: 'O tênis A: custa R$ 5 por mês de uso, e o B custa R$ 10', e: ['O tênis B, porque é mais barato', 'Os dois têm o mesmo custo-benefício', 'O tênis B: custa R$ 5 por mês de uso'],
    x: 'A: 120 ÷ 24 = R$ 5 por mês. B: 60 ÷ 6 = R$ 10 por mês. O mais barato na etiqueta nem sempre é o mais barato no uso.' },
  { tema: 'Educação financeira', n: 'dificil', t: '🎰 Um aplicativo de apostas online promete "dinheiro fácil". O que é verdade?',
    c: 'Apostas são proibidas para menores de 18 anos e a maioria das pessoas perde dinheiro', e: ['É um jeito garantido de ganhar renda', 'É um tipo de poupança', 'É seguro se um influenciador indicar'],
    x: 'As casas de apostas são feitas para lucrar. Quem aposta, em média, perde. Menores de idade não podem apostar.' },
  { tema: 'Educação financeira', n: 'dificil', t: '💼 Uma família ganha R$ 2.000 por mês e já paga R$ 900 em parcelas. O que isso mostra?',
    c: 'Que 45% da renda está presa em parcelas: há risco de endividamento', e: ['Que está ótimo, sobra muito dinheiro', 'Que ela deve parcelar mais compras', 'Que parcelas não contam como gasto'],
    x: '900 ÷ 2.000 = 0,45 = 45%. Especialistas recomendam não comprometer mais de 30% da renda com dívidas.' },
  { tema: 'Consumo consciente', n: 'medio', t: '🛑 No consumo consciente, qual pergunta você deve fazer PRIMEIRO antes de comprar?',
    c: '"Eu preciso mesmo disso?" (repensar)', e: ['"Qual é a cor mais bonita?"', '"Quantos eu consigo levar?"', '"Meus amigos já têm?"'],
    x: 'Os 5 Rs começam por repensar e recusar. Depois vêm reduzir, reutilizar e reciclar.' },
  { tema: 'Consumo consciente', n: 'medio', t: '🧺 Comprar na feira de Rio Tinto, de quem produz na região, ajuda porque:',
    c: 'Fortalece a economia local e gera menos transporte e embalagem', e: ['É sempre mais caro e pior', 'Não faz diferença nenhuma', 'Só serve para turistas'],
    x: 'O dinheiro gasto com produtores locais circula na própria cidade, e o produto viaja menos.' },
  { tema: 'Consumo consciente', n: 'dificil', t: '🍪 Um pacote de biscoito passou de 200 g para 160 g e o preço continuou igual. Isso significa:',
    c: 'Um aumento escondido: você paga o mesmo por 20% menos produto', e: ['Uma promoção da fábrica', 'Que o preço caiu 20%', 'Que nada mudou'],
    x: '200 − 160 = 40 g a menos. 40 ÷ 200 = 20%. Isso se chama reduflação. Confira sempre o peso na embalagem.' },
  { tema: 'Consumo consciente', n: 'dificil', t: '📦 Na promoção "Leve 3, pague 2", cada unidade sai com um desconto de cerca de:',
    c: '33%, porque você paga 2 de cada 3', e: ['50%', '66%', '10%'],
    x: 'Você leva 3 e paga 2. O desconto é 1 de 3 = 1/3 ≈ 33%. Só vale a pena se você realmente for usar as 3.' },
  { tema: 'Consumo consciente', n: 'dificil', t: '📺 Pelo Código de Defesa do Consumidor, a propaganda que se aproveita da falta de experiência da criança é:',
    c: 'Abusiva e proibida', e: ['Permitida e incentivada', 'Obrigatória na TV', 'Proibida só no Natal'],
    x: 'O Código de Defesa do Consumidor considera abusiva a publicidade que se aproveita da deficiência de julgamento e experiência da criança.' },
  { tema: 'Consumo consciente', n: 'dificil', t: '↩️ Você comprou um produto pela internet e se arrependeu. Pelo Código de Defesa do Consumidor, até quando pode desistir?',
    c: 'Até 7 dias depois de receber o produto (direito de arrependimento)', e: ['Só no mesmo dia da compra', 'Até 90 dias depois', 'Não dá para desistir de compra pela internet'],
    x: 'Em compras feitas fora da loja física, como pela internet, o consumidor pode desistir em até 7 dias e receber o dinheiro de volta.' },
];

/* ---------------- SEGURANÇA DIGITAL ---------------- */
const BANCO_SEGURANCA = [
  { n: 'facil', t: '📩 Você recebe uma mensagem: "Parabéns! Você ganhou um celular. Clique no link e pague só o frete". O que fazer?',
    c: 'Desconfiar, não clicar e avisar um adulto', e: ['Clicar rápido antes que acabe', 'Pagar o frete, é barato', 'Enviar para os amigos também ganharem'],
    x: 'Prêmios que você não pediu e que exigem pagamento são golpes comuns. Nunca clique em links suspeitos.' },
  { n: 'facil', t: '🔐 Qual destas é a senha mais segura?',
    c: 'Guariba#Grita7Alto!', e: ['123456', 'seu nome + ano de nascimento', 'senha'],
    x: 'Senhas fortes misturam letras maiúsculas, minúsculas, números e símbolos, e não usam dados pessoais.' },
  { n: 'medio', t: '🛒 Um tênis de R$ 600 aparece por R$ 59 num site desconhecido, só no Pix. O que isso indica?',
    c: 'Grande chance de ser golpe: preço bom demais e site desconhecido', e: ['Uma promoção imperdível', 'Que o tênis é usado', 'Que o Pix sempre dá esse desconto'],
    x: 'Preços muito abaixo do normal, em sites sem reputação, são sinais de golpe. Pesquise o site antes de comprar.' },
  { n: 'facil', t: '🔑 Alguém dizendo ser do banco pede por mensagem o código que chegou no seu celular. Você deve:',
    c: 'Nunca passar o código para ninguém', e: ['Passar, porque é do banco', 'Passar só metade do código', 'Mandar uma foto do código'],
    x: 'Bancos e lojas não pedem códigos de verificação. Quem pede quer acessar a sua conta.' },
  { n: 'medio', t: '🌐 Antes de comprar em uma loja virtual, o que é recomendado verificar?',
    c: 'A reputação da loja, o CNPJ e avaliações de outros compradores', e: ['Só se o site tem muitas cores', 'Se a loja tem muitos anúncios', 'Nada, toda loja online é segura'],
    x: 'Sites de reclamação, avaliações e CNPJ ajudam a saber se a loja é confiável.' },
  { n: 'medio', t: '📶 Qual é o lugar menos seguro para fazer uma compra digitando dados do cartão?',
    c: 'Wi-Fi público e aberto, sem senha', e: ['Rede de casa com senha', 'Dados móveis do próprio celular', 'Computador de casa atualizado'],
    x: 'Redes públicas abertas podem ser monitoradas por outras pessoas. Evite usá-las para pagar.' },
  { n: 'facil', t: '🎮 Um jogo oferece "moedas grátis" se você informar a senha da sua conta. Isso é:',
    c: 'Golpe para roubar a conta', e: ['Uma recompensa oficial', 'Um bônus por ser bom jogador', 'Normal em todos os jogos'],
    x: 'Nenhum serviço legítimo pede sua senha em troca de prêmios.' },
  { n: 'dificil', t: '🔒 O que o cadeado e o "https" no endereço do site indicam?',
    c: 'Que a conexão é protegida, mas isso não garante que a loja é honesta', e: ['Que a loja nunca aplica golpes', 'Que o produto tem garantia', 'Que o preço é o menor da internet'],
    x: 'O https protege os dados no caminho, mas golpistas também podem usá-lo. Verifique também a reputação da loja.' },
  { n: 'dificil', t: '🛡️ Você quer se cadastrar num site para comprar. Qual conjunto de sinais mostra que é mais seguro colocar seus dados?',
    c: 'Endereço oficial escrito certinho, https com cadeado, CNPJ, contato e boas avaliações', e: ['Muitas cores, janelas pulando e um cronômetro de oferta', 'Preço muito abaixo dos outros e pagamento só por Pix', 'Link que chegou por mensagem de um número desconhecido'],
    x: 'Nenhum sinal sozinho garante segurança. Junte vários: endereço correto, https, CNPJ, canal de contato, política de privacidade e opinião de outros compradores.' },
  { n: 'dificil', t: '🔗 Qual destes endereços tem MAIS cara de ser um site falso?',
    c: 'http://lojatucano-ofertas.xyz/pix-agora', e: ['https://www.lojatucano.com.br', 'https://www.lojatucano.com.br/ajuda', 'https://lojatucano.com.br/carrinho'],
    x: 'Sem https, com palavras a mais no nome ("-ofertas"), terminação estranha (.xyz) e pedindo "pix-agora": vários sinais de alerta juntos.' },
  { n: 'dificil', t: '🔤 Um link diz "www.rnercadoipe.com.br" e promete ofertas do Mercado Ipê. O que tem de estranho?',
    c: 'As letras "rn" imitam a letra "m": pode ser um site falso copiando a loja', e: ['Nada, é só um apelido da loja', 'Sites que terminam em .com.br nunca são falsos', 'Nada, porque o link veio de um amigo'],
    x: 'Golpistas criam endereços quase iguais aos verdadeiros. Leia o endereço letra por letra antes de digitar qualquer dado.' },
  { n: 'medio', t: '📝 Para participar de um sorteio, um site pede seu CPF, a senha do seu e-mail e uma foto do cartão dos seus pais. O que fazer?',
    c: 'Não preencher: nenhum site sério pede senha de e-mail nem foto de cartão', e: ['Preencher só o CPF e a senha', 'Preencher tudo, é só um sorteio', 'Mandar os dados por mensagem para o site'],
    x: 'Um site só deve pedir os dados necessários para o serviço. Senha de e-mail e foto de cartão nunca devem ser enviadas.' },
  { n: 'dificil', t: '⚖️ O que é a LGPD?',
    c: 'A lei brasileira que protege os dados pessoais, com cuidado especial para crianças e adolescentes', e: ['Um aplicativo de pagamentos', 'Uma loja virtual do governo', 'Uma senha usada pelos bancos'],
    x: 'A Lei Geral de Proteção de Dados (Lei 13.709/2018) diz como empresas podem usar seus dados. Um site sério mostra uma política de privacidade explicando isso.' },
  { n: 'dificil', t: '📲 O que a verificação em duas etapas faz na sua conta?',
    c: 'Pede um segundo código além da senha, dificultando que outra pessoa entre', e: ['Deixa a internet mais rápida', 'Faz você não precisar mais de senha', 'Mostra sua senha para os amigos'],
    x: 'Mesmo que alguém descubra sua senha, sem o segundo código não consegue entrar.' },
  { n: 'dificil', t: '🎣 O que é phishing (lê-se "fíchin")?',
    c: 'Mensagem ou site falso que imita uma empresa para roubar seus dados', e: ['Um jogo de pescaria online', 'Um tipo de antivírus', 'Uma promoção oficial dos bancos'],
    x: 'Phishing "pesca" seus dados com iscas: e-mails, mensagens e sites falsos parecidos com os verdadeiros.' },
  { n: 'dificil', t: '💬 Um "amigo" com número novo manda: "Troquei de celular, me faz um Pix urgente?". O que fazer primeiro?',
    c: 'Ligar para o número antigo do amigo ou falar com ele pessoalmente', e: ['Fazer o Pix logo, ele é amigo', 'Fazer o Pix só se o valor for pequeno', 'Pedir a senha do banco dele para conferir'],
    x: 'Esse é o golpe do falso parente ou amigo. Sempre confirme por outro canal antes de enviar dinheiro.' },
  { n: 'medio', t: '📍 Qual informação NÃO é bom postar em rede social aberta?',
    c: 'Endereço de casa, nome da escola e horários em que você fica sozinho', e: ['Uma foto do pôr do sol no rio', 'Um desenho que você fez', 'O nome do seu filme favorito'],
    x: 'Dados de localização e rotina podem ser usados por pessoas mal-intencionadas.' },
  { n: 'dificil', t: '🧾 Você pagou um boleto que chegou por e-mail e o dinheiro foi para um nome desconhecido. Que cuidado teria evitado isso?',
    c: 'Conferir o nome e o CNPJ de quem vai receber (beneficiário) antes de pagar', e: ['Pagar sempre à noite', 'Pagar só boletos coloridos', 'Imprimir o boleto antes de pagar'],
    x: 'No boleto falso, o código leva o dinheiro para o golpista. O app do banco mostra o beneficiário antes de confirmar: confira!' },
  { n: 'dificil', t: '🛍️ Na hora de pagar numa loja virtual, qual destas formas é a MAIS segura?',
    c: 'Pagar pelo próprio site ou app da loja, de preferência com cartão virtual', e: ['Pix para o celular que o vendedor mandou no chat', 'Depósito na conta de um parente do vendedor', 'Mandar a foto do cartão pelo chat'],
    x: 'Pagando dentro da plataforma você tem proteção e comprovante. Pix para pessoa desconhecida é difícil de recuperar.' },
  { n: 'medio', t: '🔄 Por que é importante manter o celular e os aplicativos atualizados?',
    c: 'As atualizações corrigem falhas que golpistas poderiam usar', e: ['Só para mudar as cores', 'Para gastar mais internet', 'Não serve para nada'],
    x: 'Atualizações de segurança fecham "portas" que vírus e golpistas poderiam usar.' },
];
BANCO_SEGURANCA.forEach(b => { b.tema = 'Segurança digital'; });

const deBanco = banco => banco.map(b => () => Q(b.tema, b.n, b.t, b.c, b.e, txt, b.x));
const G_CONSUMO = deBanco(BANCO_CONSUMO);
const G_SEGURANCA = deBanco(BANCO_SEGURANCA);
const G_CONCEITUAL = [...G_CONSUMO, ...G_SEGURANCA];
