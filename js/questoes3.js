G_PORCENTAGEM.push(
  () => {
    const total = R.pick([2, 4, 5, 8, 10, 20]);
    let p; do { p = R.pick([10, 20, 25, 40, 50, 60, 75, 80]); } while (!Number.isInteger(total * p / 10));
    const usado = total * p / 100;
    return Q('Porcentagem', 'medio',
      `📶 Seu plano de celular tem ${num(total)} GB de internet por mês. Você já usou ${num(usado)} GB. Que porcentagem do plano já foi usada?`,
      p, [100 - p, p / 2, p + 10, usado], pc,
      `Porcentagem = parte ÷ todo × 100 = ${num(usado)} ÷ ${num(total)} × 100 = ${pc(p)}. Ainda restam ${pc(100 - p)} do plano.`);
  },
  () => {
    let p, h; do { p = R.pick([10, 20, 25, 40, 50, 75, 80]); h = R.pick([8, 10, 12, 16, 20, 24]); } while ((p * h) % 100 !== 0);
    const r = p * h / 100;
    return Q('Porcentagem', 'facil',
      `🔋 A bateria do celular está em ${p}%. Com a bateria cheia (100%), ele funciona ${h} horas. Quantas horas ainda dá para usar?`,
      r, [h - r, h, p / 10, r * 2], unid('hora', 'horas'),
      `${p}% de ${h} horas = ${p}/100 × ${h} = ${num(r)} horas.`);
  },
  () => {
    const p = R.pick([10, 20, 25, 30, 40, 60]), total = 100 * R.int(1, 6);
    const parte = total * p / 100;
    return Q('Porcentagem', 'dificil',
      `🎟️ Na festa da escola, ${parte} ingressos foram vendidos pela internet. Isso é ${p}% de todos os ingressos vendidos. Quantos ingressos foram vendidos no total?`,
      total, [r2(parte * p / 100), parte + p, total - parte, r2(parte * (1 + p / 100))], num,
      `Se ${p}% são ${parte} ingressos, então 1% é ${parte} ÷ ${p} = ${num(parte / p)}. O total (100%) é ${num(parte / p)} × 100 = ${total} ingressos.`);
  },
);

G_DESCONTO.push(
  () => {
    const v = R.pick([30, 40, 50, 60, 80]), p = R.pick([30, 50]);
    const ans = v + v * (1 - p / 100);
    return Q('Descontos', 'medio',
      `🛍️ Na promoção "leve 2 e a segunda sai com ${p}% de desconto", quanto custam duas camisetas de ${brl(v)} cada?`,
      ans, [2 * v * (1 - p / 100), 2 * v - p, v * (1 - p / 100), 2 * v], brl,
      `A primeira custa ${brl(v)}. A segunda tem ${p}% de desconto: ${brl(v)} − ${brl(v * p / 100)} = ${brl(v * (1 - p / 100))}. Total: ${brl(v)} + ${brl(v * (1 - p / 100))} = ${brl(ans)}.`);
  },
  () => {
    const p = R.pick([20, 30, 40, 50, 60]);
    return Q('Descontos', 'dificil',
      `🧮 Na promoção "leve 2 e a segunda unidade sai com ${p}% de desconto", qual é o desconto de verdade sobre o valor das duas unidades juntas?`,
      p / 2, [p, p / 4, 100 - p / 2, p + 10], pc,
      `Exemplo: duas unidades de ${brl(100)} custariam ${brl(200)}. Com a promoção: ${brl(100)} + ${brl(100 - p)} = ${brl(200 - p)}. O desconto foi de ${brl(p)} em ${brl(200)}, ou seja, ${pc(p / 2)}. A propaganda parece maior do que é!`);
  },
  () => {
    const lim = R.pick([100, 150, 200]), d = R.pick([10, 15, 20, 25]);
    const c = lim - R.int(3, 15), x = (lim - c) + R.int(0, 12);
    const ans = c + x - d;
    return Q('Descontos', 'medio',
      `🎟️ Um cupom dá ${brl(d)} de desconto em compras a partir de ${brl(lim)}. Seu carrinho tem ${brl(c)}, então você coloca mais um item de ${brl(x)} para usar o cupom. Quanto vai pagar no total?`,
      ans, [c - d, c + x, c + x + d, x + d], brl,
      `Com o item novo: ${brl(c)} + ${brl(x)} = ${brl(c + x)}, que chega a ${brl(lim)}. Com o cupom: ${brl(c + x)} − ${brl(d)} = ${brl(ans)}. Sem o item você pagaria ${brl(c)}. ${ans < c ? 'Saiu mais barato e ainda levou um item a mais!' : 'Gastou mais do que antes: só vale se você precisava do item!'}`);
  },
);

G_ACRESCIMO.push(
  () => {
    const v = R.pick([20, 30, 40, 50, 60, 80, 100]), p = R.pick([5, 10, 20]);
    const ans = v * (1 + p / 100);
    return Q('Acréscimos', 'facil',
      `💰 A mesada de ${R.pick(NOMES)} era ${brl(v)} e teve um reajuste de ${p}%. Qual é o novo valor da mesada?`,
      ans, [v * p / 100, v + p, v * (1 - p / 100), ans + 5], brl,
      `Reajuste: ${p}% de ${brl(v)} = ${brl(v * p / 100)}. Nova mesada: ${brl(v)} + ${brl(v * p / 100)} = ${brl(ans)}.`);
  },
  () => {
    const v = R.pick([40, 60, 80, 100, 120, 150]), p = R.pick([10, 12, 15, 20]);
    const taxa = v * p / 100, ans = v + taxa;
    return Q('Acréscimos', 'medio',
      `🎫 Um ingresso para o show custa ${brl(v)}, mas o site cobra uma taxa de conveniência de ${p}%. Quanto você paga no total?`,
      ans, [taxa, v + p, r2(v * (1 - p / 100)), r2(ans + 10)], brl,
      `Taxa: ${p}% de ${brl(v)} = ${brl(taxa)}. Total: ${brl(v)} + ${brl(taxa)} = ${brl(ans)}. Sempre confira as taxas antes de pagar!`);
  },
  () => {
    const base = 100 * R.int(1, 5), p = R.pick([10, 20]);
    const f = (1 + p / 100) ** 2, final = r2(base * f);
    return Q('Acréscimos', 'dificil',
      `📦 Depois de dois aumentos seguidos de ${p}%, um produto passou a custar ${brl(final)}. Quanto ele custava antes dos aumentos?`,
      base, [r2(final * (1 - 2 * p / 100)), r2(final * (1 - p / 100)), r2(final / (1 + 2 * p / 100)), base + 10], brl,
      `Dois aumentos de ${p}% multiplicam o preço por ${fator(1 + p / 100)} × ${fator(1 + p / 100)} = ${fator(f)}. Então: ${brl(final)} ÷ ${fator(f)} = ${brl(base)}.`);
  },
);

G_JUROS.push(
  () => {
    const c = R.pick([100, 200, 300, 500, 1000]), i = R.pick([1, 2, 3, 5]);
    const j = c * i / 100;
    return Q('Juros simples', 'facil',
      `🏦 Um banco cobra ${i}% de juros ao mês. Num empréstimo de ${brl(c)}, quanto são os juros de 1 mês?`,
      j, [c + j, j * 10, i, c * i], brl,
      `Juros de 1 mês: ${i}% de ${brl(c)} = ${i}/100 × ${brl(c)} = ${brl(j)}.`);
  },
  () => {
    const c = R.pick([200, 250, 400, 500, 1000]), i = R.pick([2, 5, 10]), t = R.int(2, 5);
    const M = c * (1 + i * t / 100);
    return Q('Juros simples', 'dificil',
      `🔙 Uma aplicação a juros simples de ${i}% ao mês terminou, depois de ${t} meses, com ${brl(M)}. Quanto foi aplicado no começo?`,
      c, [r2(M * (1 - i * t / 100)), r2(M / (1 + i / 100)), M - i * t, c + 50], brl,
      `Em ${t} meses, a ${i}% ao mês, os juros somam ${i * t}% do valor aplicado. Então o montante é ${100 + i * t}% do capital: ${brl(M)} ÷ ${num(1 + i * t / 100)} = ${brl(c)}.`);
  },
  () => {
    const i = R.pick([1, 2, 3, 4, 5]);
    return Q('Juros simples', 'medio',
      `📅 Uma taxa de ${i}% ao mês, em juros simples, equivale a quantos por cento ao ano?`,
      12 * i, [i, 10 * i, 12 + i, r2(100 * i / 12)], pc,
      `Um ano tem 12 meses. Em juros simples, basta multiplicar: ${i}% × 12 = ${pc(12 * i)} ao ano.`);
  },
);

G_COMPARACAO.push(
  () => {
    const f = R.pick([10, 12, 15, 20, 24]), [n1, n2] = R.shuffle(NOMES).slice(0, 2);
    return Q('Comparação de preços', 'facil',
      `🚚 ${n1} e ${n2} vão comprar na mesma loja online, que cobra ${brl(f)} de frete por pedido. Se fizerem um pedido só e dividirem o frete, quanto cada um economiza de frete?`,
      f / 2, [f, f * 2, f / 4, f + 2], brl,
      `Sozinho, cada um pagaria ${brl(f)} de frete. Juntos, cada um paga ${brl(f)} ÷ 2 = ${brl(f / 2)}. Economia de ${brl(f / 2)} para cada um.`);
  },
  () => {
    const a = R.pick([20, 25, 30, 35, 40]), u = R.pick([5, 6, 7, 8, 10]);
    const n = Math.floor(a / u) + 1;
    return Q('Comparação de preços', 'dificil',
      `🎬 Um app de filmes cobra ${brl(a)} por mês na assinatura. Sem assinatura, cada filme alugado custa ${brl(u)}. A partir de quantos filmes por mês a assinatura fica mais barata do que alugar?`,
      n, [n - 1, n + 1, n + 2, Math.round(a / 10)], unid('filme', 'filmes'),
      `Alugando ${n - 1} filmes: ${n - 1} × ${brl(u)} = ${brl((n - 1) * u)}, ${(n - 1) * u === a ? 'o mesmo que' : 'menos que'} a assinatura. Alugando ${n}: ${n} × ${brl(u)} = ${brl(n * u)}, mais que ${brl(a)}. A partir de ${n} filmes, a assinatura compensa, mas só se você assistir mesmo!`);
  },
  () => {
    let g1, u1, g2, u2;
    do { g1 = R.pick([2, 4, 5]); u1 = R.pick([5, 6, 7, 8]); g2 = R.pick([10, 15, 20]); u2 = R.pick([3, 4, 5, 6]); } while (u1 === u2);
    const p1 = g1 * u1, p2 = g2 * u2;
    const A = `O de ${g1} GB`, B = `O de ${g2} GB`;
    const [mN, pN, mu, pu] = u1 < u2 ? [A, B, u1, u2] : [B, A, u2, u1];
    return Q('Comparação de preços', 'medio',
      `📱 Dois pacotes de internet:\n• ${g1} GB por ${brl(p1)}\n• ${g2} GB por ${brl(p2)}\nQual tem o menor preço por GB?`,
      `${mN}: ${brl(mu)} por GB`, [`${pN}: ${brl(pu)} por GB`, `${pN}: ${brl(mu)} por GB`, `${mN}: ${brl(pu)} por GB`], txt,
      `${brl(p1)} ÷ ${g1} = ${brl(u1)} por GB. ${brl(p2)} ÷ ${g2} = ${brl(u2)} por GB. O menor é ${brl(mu)} por GB. Mas o pacote maior só compensa se você usar tudo!`);
  },
);

G_PAGAMENTO.push(
  () => {
    const e = R.pick([100, 150, 200, 300]), n = R.pick([3, 4, 5, 6, 10]), q = R.pick([50, 80, 100, 120]);
    const t = e + n * q;
    return Q('Formas de pagamento', 'facil',
      `📱 Um celular foi comprado com ${brl(e)} de entrada mais ${n} parcelas de ${brl(q)}. Qual foi o valor total pago?`,
      t, [n * q, e + q, (n + 1) * q, t + q], brl,
      `Total = entrada + parcelas = ${brl(e)} + ${n} × ${brl(q)} = ${brl(e)} + ${brl(n * q)} = ${brl(t)}.`);
  },
  () => {
    const v = 10 * R.int(8, 30), p = R.pick([2, 5, 10]), dia = R.int(5, 10);
    const ans = r2(v * (1 - p / 100));
    return Q('Formas de pagamento', 'medio',
      `🧾 A mensalidade do curso de ${brl(v)} tem ${p}% de desconto se for paga até o dia ${dia}. Pagando no dia ${dia - 2}, quanto você paga?`,
      ans, [v, r2(v * p / 100), r2(v * (1 + p / 100)), v - p], brl,
      `Pagou antes do dia ${dia}, então ganha o desconto: ${p}% de ${brl(v)} = ${brl(v * p / 100)}. Paga ${brl(v)} − ${brl(v * p / 100)} = ${brl(ans)}.`);
  },
  () => {
    const v = 100 * R.pick([6, 12, 18, 24]), n = R.pick([6, 12]), d = R.pick([5, 10, 15]);
    const parcela = v / n, eco = v * d / 100;
    const f = (e, q) => `À vista economiza ${brl(e)}; no parcelado, cada parcela é de ${brl(q)}`;
    return Q('Formas de pagamento', 'dificil',
      `🛒 Uma geladeira custa ${brl(v)} em ${n}x sem juros, ou tem ${d}% de desconto à vista. Quanto se economiza pagando à vista, e de quanto seria cada parcela?`,
      f(eco, parcela), [f(d, parcela), f(eco, r2(v * (1 - d / 100) / n)), f(eco * n, parcela)], txt,
      `Desconto à vista: ${d}% de ${brl(v)} = ${brl(eco)}. Parcela: ${brl(v)} ÷ ${n} = ${brl(parcela)}. Se você já tem o dinheiro, à vista sai mais barato.`);
  },
);

G_PLANEJAMENTO.push(
  () => {
    const d = R.pick([1, 2, 3, 5]), dias = R.pick([30, 60, 90]);
    const ans = d * dias;
    return Q('Planejamento financeiro', 'facil',
      `🪙 Guardando ${brl(d)} por dia no cofrinho, quanto ${R.pick(NOMES)} junta em ${dias} dias?`,
      ans, [d * 7, ans / 2, ans + dias, dias], brl,
      `${dias} dias × ${brl(d)} = ${brl(ans)}. Um pouquinho todo dia vira bastante!`);
  },
  () => {
    const sem = R.pick([4, 5, 6, 8, 10]), por = R.pick([10, 15, 20, 25, 30]), ja = 10 * R.int(3, 15);
    const meta = ja + sem * por;
    return Q('Planejamento financeiro', 'medio',
      `🎯 A meta é juntar ${brl(meta)} para comprar um presente. Você já tem ${brl(ja)} e faltam ${sem} semanas. Quanto precisa guardar por semana?`,
      por, [r2(meta / sem), por + 5, r2(ja / sem), meta - ja], brl,
      `Falta juntar: ${brl(meta)} − ${brl(ja)} = ${brl(meta - ja)}. Por semana: ${brl(meta - ja)} ÷ ${sem} = ${brl(por)}.`);
  },
  () => {
    let n, a; do { n = R.pick([8, 10, 12, 15, 20]); a = R.pick([5, 8, 10, 12, 15]); } while (a * n === n * (n + 1) / 2);
    const A = a * n, B = n * (n + 1) / 2;
    const [nA, nB] = R.shuffle(NOMES).slice(0, 2);
    const melhor = A > B ? nA : nB, outro = A > B ? nB : nA, maior = Math.max(A, B), menor = Math.min(A, B);
    return Q('Planejamento financeiro', 'dificil',
      `🐷 Durante ${n} semanas, ${nA} guarda ${brl(a)} toda semana. ${nB} guarda ${brl(1)} na 1ª semana, ${brl(2)} na 2ª, ${brl(3)} na 3ª, e assim por diante. Quem junta mais no final?`,
      `${melhor}, com ${brl(maior)}`, [`${outro}, com ${brl(maior)}`, `${melhor}, com ${brl(menor)}`, `${outro}, com ${brl(menor)}`], txt,
      `${nA}: ${n} × ${brl(a)} = ${brl(A)}. ${nB}: 1 + 2 + 3 + ... + ${n} = ${brl(B)} (atalho: ${n} × ${n + 1} ÷ 2). ${melhor} junta ${brl(maior - menor)} a mais.`);
  },
);

G_GRAFICOS.push(
  () => {
    let deltas; do { deltas = [1, 2, 3, 4].map(() => 10 * R.int(1, 8)); } while (new Set(deltas).size < 4);
    const vals = [10 * R.int(2, 10)];
    deltas.forEach(d => vals.push(vals[vals.length - 1] + d));
    const k = deltas.indexOf(Math.max(...deltas));
    const pares = [0, 1, 2, 3].map(j => `De ${MESES[j]} para ${MESES[j + 1]}`);
    return QV(grafLinhas('Dinheiro no cofrinho (R$)', vals.map((v, j) => ({ r: MESES[j], v })), v => num(v)), 'Gráficos e tabelas', 'medio',
      '📈 O gráfico mostra quanto dinheiro havia no cofrinho em cada mês. Entre quais meses o valor guardado MAIS aumentou?',
      pares[k], pares.filter((_, j) => j !== k), txt,
      `Aumentos: ${deltas.map((d, j) => `${MESES[j]}→${MESES[j + 1]}: +${brl(d)}`).join('; ')}. O maior foi entre ${MESES[k]} e ${MESES[k + 1]} (+${brl(deltas[k])}). No gráfico de linhas, é o trecho mais inclinado.`);
  },
  () => {
    const c = cenario(4), vs = porcentagens(4);
    const itens = c.cats.map((r, k) => ({ r, v: vs[k] }));
    const menor = itens.reduce((m, x) => (x.v < m.v ? x : m));
    return QV(grafBarras(c.titulo, itens, fmtPc), 'Gráficos e tabelas', 'facil',
      '📊 Pelo gráfico de barras, qual opção teve a MENOR porcentagem?',
      `${menor.r} (${menor.v}%)`, itens.filter(x => x !== menor).map(x => `${x.r} (${x.v}%)`), txt,
      `No gráfico de barras, a barra mais curta é a de menor valor: ${menor.r}, com ${menor.v}%.`);
  },
  () => {
    const cats = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Poupança'];
    const vs = porcentagens(5), renda = R.pick([1500, 2000, 2500, 3000]);
    const itens = cats.map((r, k) => ({ r, v: vs[k] }));
    const ord = [...itens].sort((a, b) => b.v - a.v), maior = ord[0], menor = ord[4];
    const ans = renda * (maior.v - menor.v) / 100;
    return QV(grafSetores(`Orçamento de uma família (renda de ${brl(renda)})`, itens), 'Gráficos e tabelas', 'dificil',
      `🧮 A família ganha ${brl(renda)} e divide o dinheiro como mostra o gráfico. Quantos reais vão para "${maior.r}" A MAIS do que para "${menor.r}"?`,
      ans, [maior.v - menor.v, renda * maior.v / 100, renda * menor.v / 100, ans * 2], brl,
      `"${maior.r}": ${maior.v}% de ${brl(renda)} = ${brl(renda * maior.v / 100)}. "${menor.r}": ${menor.v}% = ${brl(renda * menor.v / 100)}. Diferença: ${brl(ans)}, que é ${maior.v - menor.v}% de ${brl(renda)}.`);
  },
);

G_CONSUMO.push(...deBanco([
  { tema: 'Consumo consciente', n: 'facil', t: '📝 Fazer uma lista de compras antes de ir ao mercado ajuda a:',
    c: 'Comprar só o necessário e evitar compras por impulso', e: ['Gastar mais no mercado', 'Demorar mais na fila', 'Pagar mais caro pelos produtos'],
    x: 'Com a lista, você sabe o que precisa e fica mais fácil resistir às ofertas que não interessam.' },
  { tema: 'Consumo consciente', n: 'medio', t: '📦 A loja dá frete grátis em compras acima de R$ 99. Seu carrinho tem R$ 80. Qual é o risco dessa regra?',
    c: 'Comprar coisas que você não precisava só para não pagar o frete', e: ['Nenhum, frete grátis é sempre vantagem', 'O produto chegar mais rápido', 'A loja cobrar imposto a mais'],
    x: 'Gastar R$ 19 a mais em algo desnecessário para não pagar um frete de R$ 15 não é economia. Faça a conta antes!' },
  { tema: 'Consumo consciente', n: 'medio', t: '👕 Comprar roupas em brechó (roupas usadas em bom estado) ajuda porque:',
    c: 'Custa menos e reaproveita roupas, gerando menos lixo', e: ['As roupas são sempre novas', 'É proibido revender roupas', 'Não ajuda em nada'],
    x: 'No brechó a roupa ganha uma segunda vida: você economiza e o planeta também.' },
  { tema: 'Educação financeira', n: 'dificil', t: '💎 Qual é a diferença entre PREÇO e VALOR?',
    c: 'Preço é quanto custa; valor é o quanto aquilo é útil ou importante para você', e: ['São a mesma coisa', 'Valor é sempre maior que o preço', 'Preço é o que a loja paga pelo produto'],
    x: 'Um produto barato que você não usa tem pouco valor. Antes de comprar, pense no valor, não só no preço.' },
  { tema: 'Educação financeira', n: 'dificil', t: '📺 Uma família paga R$ 30 por mês em assinaturas que quase não usa. Quanto isso dá em um ano?',
    c: 'R$ 360, por isso vale revisar as assinaturas', e: ['R$ 30', 'R$ 120', 'R$ 3.600'],
    x: '12 meses × R$ 30 = R$ 360. Pequenos gastos que se repetem todo mês pesam no orçamento.' },
  { tema: 'Consumo consciente', n: 'medio', t: '🎁 Você ganhou um presente que não vai usar. Uma atitude de consumo consciente é:',
    c: 'Trocar, doar ou passar adiante para quem vai usar', e: ['Jogar fora', 'Guardar para sempre na caixa', 'Comprar outro igual'],
    x: 'Passar adiante evita desperdício e ajuda outras pessoas.' },
]));

G_SEGURANCA.push(...deBanco([
  { n: 'facil', t: '🖥️ Você usou um computador da escola para entrar no seu e-mail. O que fazer ao terminar?',
    c: 'Sair da conta e não deixar a senha salva', e: ['Deixar a conta aberta para a próxima aula', 'Salvar a senha no navegador', 'Desligar só o monitor'],
    x: 'Em computadores compartilhados, a próxima pessoa pode entrar na sua conta se você não sair dela.' },
  { n: 'medio', t: '🔑 Por que é perigoso usar a mesma senha em todos os sites e jogos?',
    c: 'Se uma senha vazar, podem invadir todas as suas contas', e: ['Porque a senha fica fraca com o tempo', 'Não é perigoso, é até mais seguro', 'Porque os sites proíbem'],
    x: 'Quando um site é invadido, golpistas testam a mesma senha em outros sites. Senhas diferentes protegem suas outras contas.' },
  { n: 'medio', t: '🔗 Um desconhecido manda um link encurtado (como bit.ly/...) dizendo "olha essa promoção". O que fazer?',
    c: 'Desconfiar e não clicar: não dá para ver para onde o link leva', e: ['Clicar, link curto é sempre seguro', 'Clicar e digitar seus dados para conferir', 'Repassar para os amigos'],
    x: 'Links encurtados escondem o endereço verdadeiro. Golpistas usam isso para levar a sites falsos.' },
  { n: 'medio', t: '🎫 Por que não é bom postar a foto de um ingresso ou de uma passagem com código de barras?',
    c: 'Alguém pode copiar o código e usar no seu lugar', e: ['Porque a foto fica feia', 'Porque é proibido tirar foto', 'Não tem problema nenhum'],
    x: 'O código de barras ou o QR Code é o que vale na entrada. Quem copiar pode entrar antes de você.' },
  { n: 'dificil', t: '🗝️ O que é um gerenciador de senhas?',
    c: 'Um aplicativo que cria e guarda senhas fortes e diferentes para cada site', e: ['Um caderno onde se anota a senha do banco', 'Um site que mostra as senhas de todo mundo', 'Um programa que apaga as suas senhas'],
    x: 'Com um gerenciador, você só precisa lembrar de uma senha forte, e ele cuida das outras.' },
  { n: 'dificil', t: '💳 O que é um cartão virtual, oferecido pelo aplicativo do banco?',
    c: 'Um número de cartão só para compras online, que pode ser apagado depois', e: ['Um cartão de crédito de brinquedo', 'Um cartão que não precisa pagar a fatura', 'Um cartão que só funciona em lojas físicas'],
    x: 'Se o número do cartão virtual vazar, é só apagar e criar outro. O cartão de verdade continua protegido.' },
].map(b => ({ ...b, tema: 'Segurança digital' }))));

/* ---------------- MUNDO 2 ---------------- */
G_PROPORCAO.push(
  () => {
    let p1, g1, p2; do { p1 = R.pick([2, 4, 5]); g1 = R.pick([200, 250, 300, 500]); p2 = R.pick([6, 8, 10, 12, 15, 20]); } while ((g1 * p2) % p1 !== 0);
    const ans = g1 * p2 / p1;
    return Q('Proporção e regra de três', 'medio',
      `🥘 Uma receita de cuscuz para ${p1} pessoas usa ${num(g1)} g de flocão. Quantos gramas são precisos para ${p2} pessoas?`,
      ans, [g1 + (p2 - p1) * 10, g1 * p2, r2(ans / 2), ans + g1], v => `${num(v)} g`,
      `Por pessoa: ${num(g1)} ÷ ${p1} = ${num(g1 / p1)} g. Para ${p2} pessoas: ${p2} × ${num(g1 / p1)} = ${num(ans)} g.`);
  },
  () => {
    let n1, t1, n2; do { n1 = R.pick([2, 3, 4, 5, 6]); t1 = R.pick([30, 40, 60, 90, 120]); n2 = R.pick([2, 3, 4, 5, 6, 8, 10, 12]); } while (n2 === n1 || (t1 * n1) % n2 !== 0);
    const t2 = t1 * n1 / n2;
    return Q('Proporção e regra de três', 'dificil',
      `🧹 No mutirão da escola, ${n1} estudantes limpam o pátio em ${t1} minutos. Com ${n2} estudantes, no mesmo ritmo, quanto tempo levariam?`,
      t2, [r2(t1 * n2 / n1), t1, r2(t1 / 2), t1 + (n2 - n1) * 5], unid('minuto', 'minutos'),
      `O trabalho total é ${n1} × ${t1} = ${n1 * t1} "minutos de estudante". Com ${n2} estudantes: ${n1 * t1} ÷ ${n2} = ${num(t2)} minutos. ${n2 > n1 ? 'Mais' : 'Menos'} gente, ${n2 > n1 ? 'menos' : 'mais'} tempo: são grandezas inversamente proporcionais.`);
  },
  () => {
    const taxa = R.pick([4, 5]), reais = R.pick([40, 60, 80, 100, 200]);
    const ans = reais / taxa;
    return Q('Proporção e regra de três', 'facil',
      `💵 Se 1 dólar custa ${brl(taxa)}, quantos dólares dá para comprar com ${brl(reais)}?`,
      ans, [reais * taxa, reais - taxa, ans + 5, ans * 2], v => `${num(v)} dólares`,
      `Cada dólar custa ${brl(taxa)}. Então ${brl(reais)} ÷ ${brl(taxa)} = ${num(ans)} dólares.`);
  },
);

G_LUCRO.push(
  () => {
    let c, v, d, vp; do { c = R.pick([15, 20, 25, 30]); v = c + R.pick([10, 15, 20, 25]); d = R.pick([10, 20, 25]); vp = r2(v * (1 - d / 100)); } while (vp - c <= 0);
    const ans = r2(vp - c);
    return Q('Lucro e prejuízo', 'dificil',
      `🏷️ Uma loja compra camisetas por ${brl(c)} e vende por ${brl(v)}. Na liquidação, deu ${d}% de desconto no preço de venda. Qual é o lucro por camiseta na liquidação?`,
      ans, [v - c, r2(v * d / 100), r2(v - c - d), vp], brl,
      `Preço na liquidação: ${brl(v)} − ${d}% = ${brl(vp)}. Lucro: ${brl(vp)} − ${brl(c)} = ${brl(ans)}. O desconto sai do lucro da loja!`);
  },
  () => {
    const c = R.pick([1, 2, 3]), v = c + R.pick([2, 3, 4, 5]), n = R.int(8, 25), meta = (v - c) * n;
    return Q('Lucro e prejuízo', 'medio',
      `📿 ${R.pick(NOMES)} faz pulseiras para vender. Cada uma gasta ${brl(c)} de material e é vendida por ${brl(v)}. Quantas pulseiras precisa vender para ter ${brl(meta)} de lucro?`,
      n, [Math.ceil(meta / v), n + 2, Math.ceil(meta / c), n * 2], unid('pulseira', 'pulseiras'),
      `Lucro por pulseira: ${brl(v)} − ${brl(c)} = ${brl(v - c)}. Para ${brl(meta)}: ${brl(meta)} ÷ ${brl(v - c)} = ${n} pulseiras.`);
  },
  () => {
    const n = R.pick([15, 20, 25, 30, 40]), p = R.pick([2, 2.5, 3, 4]);
    const ans = r2(n * p);
    return Q('Lucro e prejuízo', 'facil',
      `🍦 Num sábado, a sorveteria vendeu ${n} picolés a ${brl(p)} cada. Quanto arrecadou com eles (faturamento)?`,
      ans, [n + p, r2(ans / 2), r2(ans + p), r2(n * (p + 1))], brl,
      `Faturamento = quantidade × preço = ${n} × ${brl(p)} = ${brl(ans)}. Lembre: faturamento não é lucro, ainda falta descontar os custos!`);
  },
);

const decomporCedulas = v => { const out = []; let r = v; [50, 20, 10, 5].forEach(n => { while (r >= n) { out.push(n); r -= n; } }); return out; };
const dividirCedula = arr => {
  const k = arr.findIndex(n => n > 5); if (k < 0) return arr;
  const troca = { 50: [20, 20, 10], 20: [10, 10], 10: [5, 5] }[arr[k]];
  return [...arr.slice(0, k), ...troca, ...arr.slice(k + 1)].sort((a, b) => b - a);
};
const textoCedulas = arr => {
  const cont = {}; arr.forEach(n => { cont[n] = (cont[n] || 0) + 1; });
  const partes = Object.keys(cont).map(Number).sort((a, b) => b - a).map(n => `${cont[n]} de ${brl(n)}`);
  return `${lista(partes)} (${arr.length} cédula${arr.length > 1 ? 's' : ''})`;
};

G_TROCO.push(
  () => {
    const v = 5 * R.int(3, 19);
    const certo = decomporCedulas(v), mais = dividirCedula(certo);
    // Alternativas erradas: mais cédulas que o necessário, ou uma soma que não dá o troco certo.
    const errado = certo.length > 1 ? certo.slice(0, -1) : decomporCedulas(v - 5);
    let aindaMais = dividirCedula(mais);
    if (aindaMais.length === mais.length) aindaMais = [...certo, 5].sort((a, b) => b - a);
    return Q('Troco e divisão de contas', 'medio',
      `💵 O caixa precisa dar ${brl(v)} de troco usando o MENOR número de cédulas (tem cédulas de R$ 50, R$ 20, R$ 10 e R$ 5). Como fica?`,
      textoCedulas(certo), [textoCedulas(mais), textoCedulas(aindaMais), textoCedulas(errado)], txt,
      `Comece pela maior cédula que cabe e vá descendo: ${certo.map(brl).join(' + ')} = ${brl(v)}. ${certo.length === 1 ? 'Basta 1 cédula.' : `São só ${certo.length} cédulas.`}`);
  },
  () => {
    const [n1, n2] = R.shuffle(NOMES).slice(0, 2);
    const a = 2 * R.int(8, 25), b = 2 * R.int(5, 20);
    const ans = r2(a * 1.1);
    return Q('Troco e divisão de contas', 'medio',
      `🍔 Na lanchonete, ${n1} consumiu ${brl(a)} e ${n2} consumiu ${brl(b)}. A conta tem 10% de taxa de serviço, e cada um paga o que consumiu mais a taxa. Quanto ${n1} paga?`,
      ans, [a, r2((a + b) * 1.1 / 2), r2(a + (a + b) * 0.1), r2(a + 1)], brl,
      `${n1}: ${brl(a)} + 10% de ${brl(a)} = ${brl(a)} + ${brl(a * 0.1)} = ${brl(ans)}.`);
  },
  () => {
    const combos = [];
    [240, 360, 480, 600].forEach(T => [20, 24, 30].forEach(n => {
      if (T % n) return;
      for (let k = 2; k <= 8; k++) if (T % (n - k) === 0) combos.push([T, n, k]);
    }));
    const [T, n, k] = R.pick(combos);
    const antes = T / n, depois = T / (n - k);
    return Q('Troco e divisão de contas', 'dificil',
      `🎁 A turma vai juntar ${brl(T)} para o presente da professora. Com ${n} estudantes, cada um daria ${brl(antes)}. Mas ${k} estudantes não vão poder participar. Quanto cada um dos outros precisa dar?`,
      depois, [antes + k, antes, r2(T / (n + k)), antes * k], brl,
      `Agora são ${n} − ${k} = ${n - k} estudantes. ${brl(T)} ÷ ${n - k} = ${brl(depois)} para cada um.`);
  },
);

G_UNIDADES.push(
  () => {
    let L, copo; do { L = R.pick([1, 1.5, 2, 3]); copo = R.pick([200, 250, 300]); } while (!Number.isInteger(L * 1000 / copo));
    const n = L * 1000 / copo;
    return Q('Preço por medida', 'facil',
      `🥤 Uma garrafa de ${num(L)} L de suco enche quantos copos de ${copo} mL? (1 L = 1.000 mL)`,
      n, [n + 1, n - 1, L * 10, n * 2], unid('copo', 'copos'),
      `${num(L)} L = ${num(L * 1000)} mL. ${num(L * 1000)} ÷ ${copo} = ${n} copos.`);
  },
  () => {
    let g, e; do { g = R.pick([5.5, 6, 6.2, 6.5]); e = R.pick([3.6, 3.9, 4.2, 4.5, 4.8]); } while (Math.abs(e / g - 0.7) < 0.01);
    const razao = e / g, compensa = razao < 0.7, pr = r2(razao * 100);
    const etanol = `Etanol: ele custa ${pc(pr)} do preço da gasolina`, gasolina = `Gasolina: o etanol custa ${pc(pr)} do preço dela`;
    return Q('Preço por medida', 'dificil',
      `⛽ Uma regra prática diz: o etanol compensa se custar até 70% do preço da gasolina. A gasolina está a ${brl(g)} e o etanol a ${brl(e)}. Qual compensa?`,
      compensa ? etanol : gasolina, [compensa ? gasolina : etanol, 'Etanol: ele é sempre mais barato', 'Tanto faz, os dois rendem igual'], txt,
      `${brl(e)} ÷ ${brl(g)} ≈ ${num(razao)}, ou seja, ${pc(pr)}. ${compensa ? 'Como é menos de 70%, o etanol compensa.' : 'Como passou de 70%, a gasolina compensa, porque o etanol rende menos quilômetros por litro.'}`);
  },
  () => {
    const m1 = R.pick([2, 5]), u1 = R.pick([2.4, 3, 3.6]), m2 = R.pick([10, 20]), u2 = R.pick([1.5, 2]);
    const p1 = r2(m1 * u1), p2 = r2(m2 * u2), ans = r2(u1 - u2);
    return Q('Preço por medida', 'medio',
      `🎀 Fita para enfeitar a festa: o rolo de ${m1} m custa ${brl(p1)} e o rolo de ${m2} m custa ${brl(p2)}. Quanto se economiza em cada metro comprando o rolo grande?`,
      ans, [r2(p2 - p1), u1, u2, r2(ans * m1)], brl,
      `Rolo pequeno: ${brl(p1)} ÷ ${m1} = ${brl(u1)} o metro. Rolo grande: ${brl(p2)} ÷ ${m2} = ${brl(u2)} o metro. Economia: ${brl(u1)} − ${brl(u2)} = ${brl(ans)} por metro.`);
  },
);

G_MEDIA.push(
  () => {
    let n; do { n = [R.int(4, 10), R.int(4, 10), R.int(4, 10)]; } while ((n[0] + n[1] + n[2]) % 3 !== 0);
    const soma = n[0] + n[1] + n[2], m = soma / 3;
    return Q('Média, moda e mediana', 'facil',
      `📝 ${R.pick(NOMES)} tirou ${lista(n.map(String))} nas três provas de Matemática. Qual foi a média?`,
      m, [soma, Math.max(...n), Math.min(...n), m + 1], num,
      `Média = (${n.join(' + ')}) ÷ 3 = ${soma} ÷ 3 = ${m}.`);
  },
  () => {
    const media = R.pick([5, 6, 7]);
    let a, b, c, x; do { a = R.int(3, 9); b = R.int(3, 9); c = R.int(3, 9); x = 4 * media - a - b - c; } while (x < 1 || x > 10);
    return Q('Média, moda e mediana', 'medio',
      `🎓 Para passar, a média de 4 provas precisa ser ${media}. ${R.pick(NOMES)} tirou ${a}, ${b} e ${c}. Quanto precisa tirar na 4ª prova?`,
      x, [media, x + 1, x - 1, Math.round((a + b + c) / 3)], num,
      `Para ter média ${media} em 4 provas, a soma precisa ser 4 × ${media} = ${4 * media}. Já tem ${a} + ${b} + ${c} = ${a + b + c}. Falta: ${4 * media} − ${a + b + c} = ${x}.`);
  },
  () => {
    let n, m, novo;
    do { n = R.pick([3, 4, 5]); m = 5 * R.int(3, 8); novo = 5 * R.int(2, 12); } while (novo === m || !Number.isInteger((n * m + novo) * 100 / (n + 1)));
    const nova = (n * m + novo) / (n + 1);
    return Q('Média, moda e mediana', 'dificil',
      `🧾 O preço médio de ${n} lanches é ${brl(m)}. Se entrar no cálculo mais um lanche de ${brl(novo)}, qual será a nova média?`,
      nova, [r2((m + novo) / 2), m, r2(nova + 2), n * m + novo], brl,
      `Soma dos ${n} lanches: ${n} × ${brl(m)} = ${brl(n * m)}. Com o novo: ${brl(n * m)} + ${brl(novo)} = ${brl(n * m + novo)}. Nova média: ${brl(n * m + novo)} ÷ ${n + 1} = ${brl(nova)}.`);
  },
);

G_CONTAS.push(
  () => {
    const pm = R.pick([4, 5, 6, 8]), m3 = R.int(8, 20);
    const litros = m3 * 1000, ans = pm * m3;
    return Q('Contas da casa', 'medio',
      `💧 A conta de água cobra ${brl(pm)} por metro cúbico (1 m³ = 1.000 litros). Uma casa gastou ${num(litros)} litros no mês. Quanto vai pagar?`,
      ans, [pm * litros / 100, litros * pm, ans + pm, m3], brl,
      `${num(litros)} litros = ${m3} m³. Valor: ${m3} × ${brl(pm)} = ${brl(ans)}.`);
  },
  () => {
    const n = R.pick([2, 3, 4, 5]), v = n * 10 * R.int(6, 25);
    return Q('Contas da casa', 'facil',
      `🏠 ${n} amigos dividem uma casa. A conta de luz do mês foi ${brl(v)}. Dividindo igualmente, quanto cada um paga?`,
      v / n, [v, v / n + 10, v * n, v / 2], brl,
      `${brl(v)} ÷ ${n} = ${brl(v / n)} para cada um.`);
  },
  () => {
    const W = R.pick([2, 5, 10]), ap = R.pick(['a TV', 'o micro-ondas', 'o videogame']);
    const kwh = W * 24 * 30 / 1000;
    return Q('Contas da casa', 'dificil',
      `🔌 Mesmo desligado, ${ap} na tomada (em modo de espera) gasta ${W} W o tempo todo. Quantos kWh isso dá em 30 dias, contando as 24 horas de cada dia?`,
      kwh, [W * 24 * 30, r2(W * 24 / 1000), r2(kwh * 10), W * 30 / 1000], unid('kWh', 'kWh'),
      `Por dia: ${W} W × 24 h = ${W * 24} Wh. Em 30 dias: ${num(W * 24 * 30)} Wh = ${num(kwh)} kWh. Tirar da tomada o que não está em uso economiza!`);
  },
);

G_CASHBACK.push(
  () => {
    const p = R.pick([1, 2, 5]), vals = [10 * R.int(3, 12), 10 * R.int(3, 12), 10 * R.int(3, 12)];
    const soma = vals.reduce((s, x) => s + x, 0), ans = r2(soma * p / 100);
    return Q('Cashback e pontos', 'facil',
      `💰 Com ${p}% de cashback, você fez três compras: ${lista(vals.map(brl))}. Quanto de cashback juntou no total?`,
      ans, [r2(ans * 3), soma, r2(vals[0] * p / 100), r2(ans + 1)], brl,
      `Total das compras: ${brl(soma)}. ${p}% de ${brl(soma)} = ${brl(ans)}.`);
  },
  () => {
    const pts = R.pick([1000, 1500, 2000, 2500, 3000, 5000]), val = R.pick([0.01, 0.02, 0.05]);
    const ans = r2(pts * val);
    return Q('Cashback e pontos', 'medio',
      `🎯 Você tem ${num(pts)} pontos num programa de fidelidade. Na troca, cada ponto vale ${brl(val)}. Quanto seus pontos valem em reais?`,
      ans, [pts, r2(ans * 10), r2(pts / val / 100), r2(ans + 5)], brl,
      `${num(pts)} × ${brl(val)} = ${brl(ans)}. Atenção: muitos pontos parecem muito dinheiro, mas cada um vale pouco!`);
  },
  () => {
    const v = 50 * R.int(4, 16), p = R.pick([5, 10]), lim = R.pick([15, 20, 25, 30]);
    const bruto = v * p / 100, ans = Math.min(bruto, lim);
    return Q('Cashback e pontos', 'dificil',
      `📜 Regra do app: ${p}% de cashback, mas no máximo ${brl(lim)} por compra. Numa compra de ${brl(v)}, quanto volta?`,
      ans, [bruto, lim, r2(ans + 5), r2(ans / 2)], brl,
      `${p}% de ${brl(v)} = ${brl(bruto)}. ${bruto > lim ? `Como passou do limite, volta só ${brl(lim)}.` : `Não passou do limite de ${brl(lim)}, então volta ${brl(bruto)}.`} Leia sempre as regras!`);
  },
);

G_COMPOSTOS.push(
  () => {
    const t = R.pick([3, 4, 6, 8, 9, 12]);
    const ans = 72 / t;
    return Q('Juros compostos', 'dificil',
      `⏱️ A "regra do 72" diz: dividindo 72 pela taxa de juros compostos ao ano, descobrimos em quantos anos o dinheiro mais ou menos DOBRA. Com ${t}% ao ano, em quantos anos o dinheiro dobra?`,
      ans, [Math.round(100 / t), t, 72 - t, ans * 2], unid('ano', 'anos'),
      `72 ÷ ${t} = ${ans} anos. É uma conta aproximada, mas mostra a força dos juros compostos com o tempo.`);
  },
  () => {
    const i = R.pick([1, 2, 3, 5, 8]);
    return Q('Juros compostos', 'facil',
      `✖️ Uma aplicação rende ${i}% ao mês. Para saber o valor depois de 1 mês, multiplicamos o valor por:`,
      fator(1 + i / 100), [fator(i / 100), fator(i), fator(1 - i / 100)], txt,
      `O valor inteiro é 100% = 1. Somando o rendimento: 100% + ${i}% = ${100 + i}% = ${fator(1 + i / 100)}.`);
  },
  () => {
    const v = R.pick([800, 1000, 1500, 2000]), p = R.pick([10, 20, 25]);
    const f = 1 - p / 100, v1 = v * f, v2 = r2(v * f * f);
    return Q('Juros compostos', 'medio',
      `📉 Um celular perde ${p}% do valor a cada ano. Comprado por ${brl(v)}, quanto ele vale depois de 2 anos?`,
      v2, [v * (1 - 2 * p / 100), v1, r2(v - v2), r2(v2 + v * p / 100)], brl,
      `1º ano: ${brl(v)} − ${p}% = ${brl(v1)}. 2º ano: ${brl(v1)} − ${p}% = ${brl(v2)}. A perda do 2º ano é sobre o valor que sobrou: é a ideia dos juros compostos, só que para baixo.`);
  },
);

G_INFLACAO.push(
  () => {
    const v = R.pick([100, 200, 300, 500]), p = R.pick([1, 2]);
    const ans = v * (1 + p / 100);
    return Q('Inflação', 'facil',
      `🛒 A inflação de um mês foi de ${p}%. Uma compra de mercado que custava ${brl(v)} passou a custar quanto?`,
      ans, [v + p, v * p / 100, v * (1 - p / 100), ans + 10], brl,
      `${p}% de ${brl(v)} = ${brl(v * p / 100)}. Novo valor: ${brl(v)} + ${brl(v * p / 100)} = ${brl(ans)}.`);
  },
  () => {
    const v = R.pick([20, 40, 60, 80, 100]), idx = R.pick([105, 110, 115, 120, 125]);
    const ans = r2(v * idx / 100);
    return Q('Inflação', 'medio',
      `📊 Um índice de preços começou em 100 e hoje está em ${idx}. Um produto custava ${brl(v)} quando o índice era 100. Se o preço acompanhou o índice, quanto custa hoje?`,
      ans, [v + idx - 100, r2(v * (idx - 100) / 100), v * idx, r2(ans - 2)], brl,
      `O índice subiu de 100 para ${idx}: os preços subiram ${idx - 100}%. ${brl(v)} × ${num(idx / 100)} = ${brl(ans)}.`);
  },
  () => {
    const p = R.pick([1, 2, 3, 5]);
    const tot = r2(((1 + p / 100) ** 3 - 1) * 100);
    return Q('Inflação', 'dificil',
      `📆 A inflação foi de ${p}% em cada um dos 3 primeiros meses do ano. Qual foi a inflação acumulada no trimestre?`,
      tot, [3 * p, r2(tot + 1), p, r2(p * p * p / 100)], pc,
      `Fatores: ${fator(1 + p / 100)} × ${fator(1 + p / 100)} × ${fator(1 + p / 100)} = ${fator((1 + p / 100) ** 3)}. Acumulada: ${pc(tot)}, um pouco mais que ${3 * p}%, porque cada mês incide sobre os preços do mês anterior.`);
  },
);

G_DIREITOS.push(...deBanco([
  { n: 'medio', t: '📦 O produto que você comprou pela internet chegou quebrado. O que fazer?',
    c: 'Tirar fotos, guardar a embalagem e pedir à loja a troca ou o dinheiro de volta', e: ['Jogar fora e comprar outro', 'Consertar por conta própria e não reclamar', 'Esperar 1 ano para reclamar'],
    x: 'Produto com defeito ou danificado dá direito a troca, conserto ou devolução do dinheiro. Fotos ajudam a provar o problema.' },
  { n: 'facil', t: '🏷️ Numa loja, o preço dos produtos expostos precisa estar:',
    c: 'Visível e claro, na etiqueta ou na prateleira', e: ['Escondido, só o vendedor sabe', 'Escrito só em outra língua', 'Só no site da loja'],
    x: 'A lei exige que o consumidor veja o preço com facilidade antes de decidir comprar.' },
  { n: 'dificil', t: '📞 Uma empresa de internet diz que o cancelamento só pode ser feito indo pessoalmente à loja. Isso está certo?',
    c: 'Não: o cancelamento tem que ser fácil, e o atendimento por telefone (SAC) precisa aceitar o pedido', e: ['Sim, cancelar é sempre pessoalmente', 'Sim, e ainda pode cobrar multa por ligar', 'Sim, se o cliente for menor de idade'],
    x: 'As regras de atendimento ao consumidor (SAC) garantem que o pedido de cancelamento seja aceito pelo próprio SAC, sem dificultar a vida do cliente.' },
  { n: 'medio', t: '🧸 Por que os brinquedos vendidos no Brasil precisam ter o selo do Inmetro?',
    c: 'O selo mostra que o brinquedo passou por testes de segurança', e: ['É só um enfeite na caixa', 'Mostra que o brinquedo é importado', 'Mostra que o brinquedo é o mais barato'],
    x: 'Testes verificam peças pequenas, pontas e materiais, para proteger as crianças.' },
  { n: 'dificil', t: '🔧 O produto com defeito foi para a assistência técnica e não foi consertado em 30 dias. Pelo Código de Defesa do Consumidor, o consumidor pode escolher:',
    c: 'Trocar o produto, receber o dinheiro de volta ou ter um desconto no preço', e: ['Só esperar mais 6 meses', 'Só ganhar um brinde da loja', 'Nada, a loja decide tudo'],
    x: 'Pelo artigo 18 do Código de Defesa do Consumidor, se o problema não for resolvido em 30 dias, quem escolhe a solução é o consumidor.' },
  { n: 'medio', t: '🎫 Quem tem direito a pagar meia-entrada em cinemas e shows?',
    c: 'Estudantes, pessoas idosas, pessoas com deficiência e jovens de baixa renda', e: ['Só quem chega primeiro na fila', 'Qualquer pessoa no fim de semana', 'Só quem compra pela internet'],
    x: 'A meia-entrada é garantida por lei para esses grupos, com documento que comprove o direito, como a carteirinha de estudante.' },
].map(b => ({ ...b, tema: 'Direitos do consumidor' }))));

/* ---------------- MUNDO 3 ---------------- */
G_CREDITO.push(
  () => Q('Cartão de crédito', 'medio',
    '📅 O "melhor dia de compra" no cartão de crédito é:',
    'O dia logo depois do fechamento da fatura, que dá mais tempo até pagar', ['O dia do vencimento da fatura', 'Qualquer dia, o prazo é sempre o mesmo', 'O primeiro dia do ano'], txt,
    'Compras feitas logo depois do fechamento só entram na fatura seguinte. Assim você ganha mais tempo para pagar, sem juros.'),
  () => {
    const c = R.pick([200, 300, 500, 800, 1000]), i = R.pick([6, 8, 10, 12]);
    return Q('Cartão de crédito', 'facil',
      `🏦 O cheque especial cobra ${i}% de juros ao mês. Usando ${brl(c)} do cheque especial por 1 mês, quanto se paga de juros?`,
      c * i / 100, [c * (1 + i / 100), i, c * i / 10, r2(c / i)], brl,
      `${i}% de ${brl(c)} = ${brl(c * i / 100)}. O cheque especial é um empréstimo caro: só para emergências.`);
  },
  () => {
    const c = R.pick([500, 1000, 2000]), a = R.pick([12, 15]), b = R.pick([2, 3, 4]);
    const ma = r2(c * (1 + a / 100) ** 2), mb = r2(c * (1 + b / 100) ** 2), dif = r2(ma - mb);
    return Q('Cartão de crédito', 'dificil',
      `⚖️ Você precisa de ${brl(c)} por 2 meses. Opção A: rotativo do cartão, a ${a}% ao mês. Opção B: empréstimo pessoal, a ${b}% ao mês. As duas são juros compostos. Quanto a opção A custa a mais?`,
      dif, [r2(c * (a - b) * 2 / 100), ma, r2(c * (a - b) / 100), r2(dif + 20)], brl,
      `A: ${brl(c)} × ${fator(1 + a / 100)}² = ${brl(ma)}. B: ${brl(c)} × ${fator(1 + b / 100)}² = ${brl(mb)}. Diferença: ${brl(dif)}. Comparar as taxas antes de pegar dinheiro emprestado faz muita diferença!`);
  },
);

G_RESERVA.push(
  () => {
    const g = R.pick([1000, 1200, 1500, 2000]), m = R.int(2, 6);
    return Q('Poupança e investimentos', 'facil',
      `🧯 Uma família tem ${brl(g * m)} de reserva de emergência e gasta ${brl(g)} por mês. A reserva cobre quantos meses de gastos?`,
      m, [m + 1, m * 2, m - 1, 12], unid('mês', 'meses'),
      `${brl(g * m)} ÷ ${brl(g)} = ${m} meses. O recomendado é ter de 3 a 6 meses de gastos guardados.`);
  },
  () => Q('Poupança e investimentos', 'medio',
    '🧺 Por que dizem para "não colocar todos os ovos na mesma cesta" quando o assunto é investir?',
    'Porque dividir o dinheiro em vários investimentos diminui o risco', ['Porque ovos quebram fácil', 'Porque cada pessoa só pode ter um investimento', 'Porque investir em um só sempre rende mais'], txt,
    'Isso se chama diversificar: se um investimento for mal, os outros ajudam a proteger o seu dinheiro.'),
  () => {
    const d = R.pick([50, 100, 200]), i = R.pick([1, 2]);
    const f = 1 + i / 100;
    let s = 0; const passos = [];
    for (let k = 1; k <= 3; k++) { s = r2((s + d) * f); passos.push(`${k}º mês: ${brl(s)}`); }
    return Q('Poupança e investimentos', 'dificil',
      `📥 ${R.pick(NOMES)} deposita ${brl(d)} no começo de cada mês numa aplicação que rende ${i}% ao mês (juros compostos). Quanto terá no fim do 3º mês?`,
      s, [3 * d, r2(3 * d * f), r2(3 * d * (1 + 3 * i / 100)), r2(s + d)], brl,
      `Mês a mês (depósito + rendimento): ${passos.join(' → ')}. Sem render nada, teria só ${brl(3 * d)}.`);
  },
);

G_ORCAMENTO.push(
  () => {
    const anual = R.pick([360, 480, 600, 720, 900, 1200]);
    return Q('Orçamento familiar', 'facil',
      `🎒 O material escolar do ano que vem vai custar ${brl(anual)}. Quanto a família precisa guardar por mês, durante 12 meses, para pagar à vista?`,
      anual / 12, [anual / 10, anual * 12, anual / 6, anual / 12 + 10], brl,
      `${brl(anual)} ÷ 12 meses = ${brl(anual / 12)} por mês. Planejar os gastos que chegam uma vez por ano evita aperto e juros.`);
  },
  () => {
    const g = R.pick([200, 300, 400, 500]), p = R.pick([20, 25, 50]);
    const ans = g * p / 100 * 12;
    return Q('Orçamento familiar', 'medio',
      `🛵 Uma família gasta ${brl(g)} por mês com comida por aplicativo. Se cortar ${p}% desse gasto, quanto economiza em 1 ano?`,
      ans, [g * p / 100, g * 12, ans / 2, g * 12 - ans], brl,
      `Economia por mês: ${p}% de ${brl(g)} = ${brl(g * p / 100)}. Em 12 meses: 12 × ${brl(g * p / 100)} = ${brl(ans)}.`);
  },
  () => {
    let renda, gasto, meta, m;
    do { renda = 100 * R.int(20, 35); gasto = renda - 10 * R.int(5, 25); m = R.pick([3, 4, 5, 6]); meta = 100 * R.int(8, 20); }
    while (meta <= (renda - gasto) * m || meta % m !== 0);
    const sobra = renda - gasto, corte = meta / m - sobra;
    return Q('Orçamento familiar', 'dificil',
      `✂️ Uma família ganha ${brl(renda)} e gasta ${brl(gasto)} por mês. Ela quer juntar ${brl(meta)} em ${m} meses. Quanto precisa cortar dos gastos por mês?`,
      corte, [meta / m, sobra, meta - sobra * m, corte + 50], brl,
      `Precisa guardar ${brl(meta)} ÷ ${m} = ${brl(meta / m)} por mês. Hoje sobram ${brl(renda)} − ${brl(gasto)} = ${brl(sobra)}. Falta cortar: ${brl(meta / m)} − ${brl(sobra)} = ${brl(corte)} por mês.`);
  },
);

G_GOLPES2.push(...deBanco([
  { n: 'medio', t: '📞 Uma ligação da "central do banco" diz que seu cartão foi clonado e pede para você digitar a senha no telefone. O que fazer?',
    c: 'Desligar e ligar você mesmo para o número oficial que está atrás do cartão', e: ['Digitar a senha rapidinho', 'Falar a senha em voz alta para o atendente', 'Passar o número do cartão para confirmar'],
    x: 'O banco nunca pede sua senha por telefone. Desligue e ligue você para o número oficial.' },
  { n: 'facil', t: '🎮 Um site promete itens raros de graça no seu jogo se você baixar um programa. O que fazer?',
    c: 'Não baixar: pode ser um vírus que rouba a sua conta', e: ['Baixar rápido antes que acabe', 'Baixar e desligar o antivírus', 'Mandar o link para os amigos'],
    x: 'Programas "milagrosos" de jogos são um jeito comum de espalhar vírus e roubar contas.' },
  { n: 'dificil', t: '📲 O que é o golpe da "mão fantasma"?',
    c: 'O golpista convence a pessoa a instalar um aplicativo que deixa ele controlar o celular de longe', e: ['Um aplicativo de mágica', 'Um tipo de seguro do celular', 'Uma função oficial do banco'],
    x: 'Com o controle remoto do celular, o golpista consegue fazer Pix e compras. Nunca instale apps a pedido de desconhecidos.' },
  { n: 'medio', t: '🛍️ Uma loja nas redes sociais só aceita Pix, não mostra CNPJ e desativou os comentários. Isso é:',
    c: 'Um conjunto de sinais de alerta: melhor não comprar', e: ['Sinal de loja muito confiável', 'Normal, toda loja faz assim', 'Garantia de preço baixo'],
    x: 'Um sinal sozinho pode não ser golpe, mas vários juntos indicam grande risco. Pesquise antes de comprar.' },
  { n: 'dificil', t: '🔁 O que é o MED (Mecanismo Especial de Devolução) do Pix?',
    c: 'Um jeito de pedir ao banco a devolução do dinheiro quando você cai num golpe pelo Pix', e: ['Uma taxa cobrada em cada Pix', 'Um Pix que só funciona à noite', 'Um aplicativo de jogos'],
    x: 'Quem cai num golpe deve avisar o banco o quanto antes. O MED permite bloquear e devolver o dinheiro, se ele ainda estiver na conta do golpista.' },
  { n: 'facil', t: '👀 No caixa eletrônico, como proteger a sua senha de olhares curiosos?',
    c: 'Cobrir o teclado com a mão enquanto digita', e: ['Falar a senha baixinho', 'Digitar bem devagar', 'Pedir ajuda para um desconhecido'],
    x: 'Cobrir o teclado impede que alguém (ou uma câmera escondida) veja a senha.' },
].map(b => ({ ...b, tema: 'Segurança digital' }))));

G_ECONOMIA.push(...deBanco([
  { n: 'medio', t: '🏪 O que é um MEI (Microempreendedor Individual)?',
    c: 'Um jeito simples de um pequeno negócio se formalizar, com CNPJ e impostos menores', e: ['Um tipo de cartão de crédito', 'Um banco do governo', 'Uma loja que não paga nada'],
    x: 'Com o MEI, quem vende bolos, faz unhas ou conserta bicicletas, por exemplo, pode emitir nota fiscal e ter direitos como a aposentadoria.' },
  { n: 'dificil', t: '📈 O que é a taxa Selic?',
    c: 'A taxa básica de juros da economia, definida pelo Banco Central', e: ['O preço do dólar', 'O imposto da gasolina', 'O salário mínimo'],
    x: 'Quando a Selic sobe, empréstimos ficam mais caros e investimentos rendem mais. Ela é usada para controlar a inflação.' },
  { n: 'medio', t: '🚀 O que é empreender?',
    c: 'Criar ou melhorar um negócio ou projeto, assumindo riscos para resolver um problema', e: ['Gastar todo o dinheiro de uma vez', 'Pegar dinheiro emprestado sem pagar', 'Trabalhar sem nunca planejar'],
    x: 'Empreender exige planejamento: saber os custos, o preço de venda e quem são os clientes.' },
  { n: 'medio', t: '⛽ Por que o preço do petróleo no mundo pode mudar o preço da passagem de ônibus?',
    c: 'Porque o diesel, que move os ônibus, é feito de petróleo', e: ['Porque os ônibus são feitos de petróleo', 'Porque o motorista ganha em petróleo', 'Não tem relação nenhuma'],
    x: 'Quando o petróleo sobe, o diesel fica mais caro, e o transporte de pessoas e mercadorias também.' },
  { n: 'medio', t: '💼 O que é a carteira de trabalho?',
    c: 'O documento que registra o emprego e garante direitos como férias, 13º salário e FGTS', e: ['Uma carteira para guardar dinheiro', 'Um cartão do banco', 'Um documento só para estudantes'],
    x: 'Com o emprego registrado na carteira de trabalho, o trabalhador tem direitos garantidos por lei.' },
  { n: 'dificil', t: '🏦 Se um banco quebrar, o que é o FGC (Fundo Garantidor de Créditos)?',
    c: 'Uma proteção que devolve até R$ 250 mil por pessoa em cada banco', e: ['Um seguro do celular', 'Um empréstimo do governo para quem quiser', 'Um imposto sobre o Pix'],
    x: 'O FGC protege quem guardou dinheiro em poupança e em vários investimentos de bancos, até o limite de R$ 250 mil.' },
  { n: 'facil', t: '🎄 O que é o 13º salário?',
    c: 'Um salário extra pago no fim do ano a quem trabalha com carteira assinada', e: ['Um salário que só é pago no dia 13', 'Um empréstimo do banco', 'Um prêmio de loteria'],
    x: 'O 13º salário é um direito do trabalhador. Usá-lo para pagar dívidas ou guardar é uma ótima ideia.' },
].map(b => ({ ...b, tema: 'Dinheiro e economia' }))));
