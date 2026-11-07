/* =========================================================
   TRILHA — 3 mundos, 33 fases e bifurcações.
   Os ids das fases antigas (f1...f11) continuam os mesmos:
   o progresso que já está salvo continua valendo.
   Uma fase que já foi jogada nunca volta a ficar bloqueada.
   ========================================================= */

const QUESTOES_POR_FASE = 5;
const QUESTOES_FINAL = 7;
const PONTOS_NIVEL = { facil: 10, medio: 15, dificil: 20 };
const MAX_FACEIS = 1;

const INFO_FASES = {
  // Mundo 1 — as fases que já existiam
  f1: { nome: 'Feira da Porcentagem', icone: '🧺', cor: '#f08c00', desc: 'Calcule porcentagens e frações do dia a dia.', geradores: G_PORCENTAGEM },
  f2: { nome: 'Ilha dos Descontos', icone: '🏝️', cor: '#0ca678', desc: 'Promoções, % OFF e preço final.', geradores: G_DESCONTO },
  f3: { nome: 'Morro dos Acréscimos', icone: '⛰️', cor: '#e8590c', desc: 'Aumentos, taxas e reajustes.', geradores: G_ACRESCIMO },
  f4: { nome: 'Rio Mamanguape dos Juros', icone: '🌊', cor: '#1c7ed6', desc: 'Juros simples, montante e atrasos.', geradores: G_JUROS },
  f5: { nome: 'Mercado Comparador', icone: '⚖️', cor: '#7048e8', desc: 'Frete, cupons, combos e preço por unidade.', geradores: G_COMPARACAO },
  f6: { nome: 'Vila do Pagamento', icone: '💳', cor: '#d6336c', desc: 'À vista, Pix, entrada ou parcelado?', geradores: G_PAGAMENTO },
  f7: { nome: 'Cofre das Metas', icone: '🐷', cor: '#2b8a3e', desc: 'Orçamento, poupança e metas.', geradores: G_PLANEJAMENTO },
  f10: { nome: 'Mirante dos Gráficos', icone: '📊', cor: '#1971c2', desc: 'Leia gráficos e tabelas e encontre as porcentagens.', geradores: G_GRAFICOS },
  f11: { nome: 'Aldeia do Consumo Consciente', icone: '🌿', cor: '#5c940d', desc: 'Educação financeira e consumo consciente.', geradores: G_CONSUMO, conceitual: true },
  f8: { nome: 'Fortaleza Antigolpe', icone: '🛡️', cor: '#495057', desc: 'Segurança digital: como saber se um site é seguro.', geradores: G_SEGURANCA, conceitual: true },
  f9: { nome: 'Desafio do Vale', icone: '🏆', cor: '#c98a00', desc: 'Um pouco de tudo do Mundo 1, no nível médio e difícil!' },

  // Mundo 2
  f12: { nome: 'Padaria da Proporção', icone: '🍞', cor: '#b45309', desc: 'Regra de três, câmbio e divisão proporcional.', geradores: G_PROPORCAO },
  f13: { nome: 'Barraca do Lucro', icone: '🧁', cor: '#db2777', desc: 'Custo, preço de venda, lucro e prejuízo.', geradores: G_LUCRO },
  f14: { nome: 'Praia do Troco', icone: '🏖️', cor: '#0891b2', desc: 'Troco, taxa de serviço e conta dividida entre amigos.', geradores: G_TROCO },
  f15: { nome: 'Mercado das Medidas', icone: '🧀', cor: '#ca8a04', desc: 'Preço por quilo, por litro e por 100 g.', geradores: G_UNIDADES },
  f16: { nome: 'Feira da Média', icone: '🧮', cor: '#7c3aed', desc: 'Média, moda e mediana dos preços.', geradores: G_MEDIA },
  f17: { nome: 'Casa das Contas', icone: '💡', cor: '#ea580c', desc: 'Conta de luz, água e o consumo da casa.', geradores: G_CONTAS },
  f18: { nome: 'Loja do Cashback', icone: '🎁', cor: '#16a34a', desc: 'Cashback, pontos e o dinheiro que volta.', geradores: G_CASHBACK },
  f19: { nome: 'Balcão do Consumidor', icone: '📜', cor: '#475569', desc: 'Seus direitos: garantia, troca, preço e Procon.', geradores: G_DIREITOS, conceitual: true },
  f20: { nome: 'Ponte dos Juros Compostos', icone: '🌉', cor: '#2563eb', desc: 'Juros sobre juros: o dinheiro (e a dívida) que cresce.', geradores: G_COMPOSTOS },
  f21: { nome: 'Trilha da Inflação', icone: '🎈', cor: '#dc2626', desc: 'Inflação e poder de compra.', geradores: G_INFLACAO },
  f22: { nome: 'Desafio do Manguezal', icone: '🏆', cor: '#c98a00', desc: 'Um pouco de tudo do Mundo 2, no nível médio e difícil!', qtd: 8 },

  // Mundo 3
  f23: { nome: 'Banco do Crédito', icone: '🏦', cor: '#1e40af', desc: 'Cartão de crédito, limite, fatura e rotativo.', geradores: G_CREDITO },
  f24: { nome: 'Cofre da Reserva', icone: '💰', cor: '#0d9488', desc: 'Reserva de emergência, poupança e investimentos.', geradores: G_RESERVA },
  f25: { nome: 'Rede Antigolpe 2.0', icone: '🕵️', cor: '#334155', desc: 'Golpes novos da internet e como se proteger.', geradores: G_GOLPES2, conceitual: true },
  f26: { nome: 'Museu do Dinheiro', icone: '🏛️', cor: '#92400e', desc: 'História do dinheiro, impostos e economia.', geradores: G_ECONOMIA, conceitual: true },
  f27: { nome: 'Arena das Porcentagens', icone: '🎯', cor: '#e11d48', desc: 'Mistura difícil: %, descontos, aumentos e inflação.', geradores: [...G_PORCENTAGEM, ...G_DESCONTO, ...G_ACRESCIMO, ...G_INFLACAO], semFacil: true },
  f28: { nome: 'Observatório dos Dados', icone: '🔭', cor: '#4f46e5', desc: 'Gráficos, tabelas e médias no nível difícil.', geradores: [...G_GRAFICOS, ...G_MEDIA], semFacil: true },
  f29: { nome: 'Mercado Mestre', icone: '🛒', cor: '#059669', desc: 'Compare preços, medidas, cashback e pagamentos.', geradores: [...G_COMPARACAO, ...G_UNIDADES, ...G_CASHBACK, ...G_PAGAMENTO], semFacil: true },
  f30: { nome: 'Vila do Orçamento', icone: '📒', cor: '#65a30d', desc: 'Orçamento da família: renda, gastos e cortes.', geradores: G_ORCAMENTO },
  f31: { nome: 'Torre dos Juros', icone: '🗼', cor: '#9333ea', desc: 'Juros simples, compostos e dívidas no nível difícil.', geradores: [...G_JUROS, ...G_COMPOSTOS, ...G_CREDITO], semFacil: true },
  f32: { nome: 'Roda da Sabedoria', icone: '🦉', cor: '#a16207', desc: 'Consumo, direitos, golpes e economia.', geradores: [...G_CONSUMO, ...G_DIREITOS, ...G_GOLPES2, ...G_ECONOMIA], semFacil: true, conceitual: true },
  f33: { nome: 'Grande Desafio Final', icone: '👑', cor: '#c98a00', desc: 'O desafio mais difícil da trilha: tudo junto!', qtd: 10 },
};

// Cada passo é uma fase sozinha ou um par [esquerda, direita] (bifurcação: o estudante escolhe o caminho).
// O último passo de cada mundo é o Desafio, que pede todas as fases do mundo.
const MUNDOS = [
  { n: 1, nome: 'Vale do Mamanguape', icone: '🌴', cor: '#0f766e', faixa: 'rgba(20, 184, 166, .10)',
    chamada: 'porcentagem, descontos, juros, gráficos e segurança na internet!',
    decor: ['🌴', '🦀', '🌺', '🌿', '🐚', '🦋', '🌊', '🍃', '🥥', '🌻'],
    passos: ['f1', ['f2', 'f3'], 'f4', ['f5', 'f6'], 'f7', ['f10', 'f11'], 'f8', 'f9'] },
  { n: 2, nome: 'Manguezal dos Negócios', icone: '🦀', cor: '#b45309', faixa: 'rgba(217, 119, 6, .10)',
    chamada: 'proporção, lucro, troco, cashback, juros compostos e muito mais!',
    decor: ['🦀', '🌿', '🐟', '🛶', '🦐', '🌾', '🐸', '🍃'],
    passos: ['f12', ['f13', 'f14'], 'f15', ['f16', 'f17'], ['f18', 'f19'], 'f20', 'f21', 'f22'] },
  { n: 3, nome: 'Ilha do Futuro', icone: '🏝️', cor: '#6d28d9', faixa: 'rgba(124, 58, 237, .09)',
    chamada: 'cartão de crédito, investimentos, golpes novos e os desafios mais difíceis!',
    decor: ['🌊', '🐬', '⛵', '🐢', '☀️', '🐠', '🌙', '⭐'],
    passos: ['f23', ['f24', 'f25'], 'f26', ['f27', 'f28'], ['f29', 'f30'], 'f31', 'f32', 'f33'] },
];

/* Monta a lista de fases na ordem do mapa.
   liga  = de onde sai o caminho desenhado até a fase.
   requer/modo = o que precisa estar concluído para liberar. */
const FASES = [];
(function montarTrilha() {
  let linha = 0, chefeAnterior = null;
  MUNDOS.forEach(m => {
    let anterior = null;
    m.fases = [];
    m.passos.forEach((passo, k) => {
      const ids = Array.isArray(passo) ? passo : [passo];
      ids.forEach((id, lado) => {
        const liga = !anterior ? (chefeAnterior ? [chefeAnterior] : [])
          : ids.length === anterior.length ? [anterior[lado]] : [...anterior];
        const f = { ...INFO_FASES[id], id, mundo: m.n, linha, lado: ids.length === 1 ? 'c' : lado ? 'd' : 'e', liga, requer: liga, modo: 'algum' };
        if (k === m.passos.length - 1) f.final = true;
        FASES.push(f); m.fases.push(f);
      });
      anterior = ids; linha++;
    });
    const chefe = m.fases[m.fases.length - 1];
    chefe.requer = m.fases.filter(f => f !== chefe).map(f => f.id);
    chefe.modo = 'todos';
    chefeAnterior = chefe.id;
  });
})();

const FASE_POR_ID = Object.fromEntries(FASES.map(f => [f.id, f]));
const BIFURCACOES = FASES.filter(f => f.lado === 'e').map(f => [f.id, FASES.find(g => g.linha === f.linha && g.lado === 'd').id]);
const qtdQuestoes = f => f.qtd || (f.final ? QUESTOES_FINAL : QUESTOES_POR_FASE);
const faseConcluida = (a, id) => (a.fases?.[id]?.estrelas || 0) > 0;
const mundoCompleto = (a, m) => m.fases.every(f => faseConcluida(a, f.id));
const chefeDoMundo = m => m.fases[m.fases.length - 1];

function liberadaPara(a, f) {
  if (a.fases?.[f.id]) return true;          // já jogada: nunca bloqueia de novo
  if (!f.requer.length) return true;
  return f.modo === 'todos' ? f.requer.every(id => faseConcluida(a, id)) : f.requer.some(id => faseConcluida(a, id));
}

function motivoBloqueio(a, f) {
  const faltam = f.requer.filter(id => !faseConcluida(a, id)).map(id => FASE_POR_ID[id].nome);
  if (f.modo === 'todos') {
    const quais = faltam.length > 3 ? `Faltam ${faltam.length} fases.` : `${faltam.length === 1 ? 'Falta' : 'Faltam'}: ${lista(faltam)}.`;
    return `🔒 Para o ${f.nome}, conclua todas as fases do Mundo ${f.mundo}. ${quais}`;
  }
  const de = FASE_POR_ID[f.requer[0]];
  if (de.final) return `🔒 Conclua o ${de.nome} para abrir o Mundo ${f.mundo}!`;
  return `🔒 Conclua ${f.requer.length > 1 ? `"${faltam.join('" ou "')}"` : `"${de.nome}"`} para liberar esta fase!`;
}

function statusMundo(a, m) {
  return {
    feitas: m.fases.filter(f => faseConcluida(a, f.id)).length,
    estrelas: m.fases.reduce((s, f) => s + (a.fases?.[f.id]?.estrelas || 0), 0),
    bloqueado: !liberadaPara(a, m.fases[0]),
  };
}

/* ---------------- SORTEIO DAS QUESTÕES ---------------- */
// Cada questão guarda o gerador e o grupo de onde saiu, para poder ser trocada
// por outra do mesmo nível (proteção contra print, ver protecao.js).
const gerarDe = (g, grupo) => Object.assign(g(), { gerador: g, grupo });

/* No máximo 1 fácil e pelo menos 2 difíceis (quando a fase tem), sem repetir o tipo de questão. */
function escolherQuestoes(geradores, qtd, semFacil = false) {
  let qs = R.shuffle(geradores).map(g => gerarDe(g, geradores));
  if (semFacil) qs = qs.filter(q => q.nivel !== 'facil');
  const dif = qs.filter(q => q.nivel === 'dificil');
  const med = qs.filter(q => q.nivel === 'medio');
  const fac = qs.filter(q => q.nivel === 'facil');
  const escolha = [...dif.slice(0, 2), ...fac.slice(0, MAX_FACEIS)];
  const resto = R.shuffle([...dif.slice(2), ...med]);
  while (escolha.length < qtd && resto.length) escolha.push(resto.pop());
  const sobra = fac.slice(MAX_FACEIS);
  while (escolha.length < qtd && sobra.length) escolha.push(sobra.pop());
  return R.shuffle(escolha.slice(0, qtd));
}

/* Desafio do mundo: questões médias e difíceis de cálculo das fases do mundo
   e 2 questões das fases de conceito (uma de cada fase, quando dá). */
function gerarQuestoesDaFase(fase) {
  if (!fase.final) return escolherQuestoes(fase.geradores, qtdQuestoes(fase), fase.semFacil);
  const qtd = qtdQuestoes(fase);
  const doMundo = FASES.filter(f => f.mundo === fase.mundo && !f.final);
  const calculo = doMundo.filter(f => !f.conceitual).flatMap(f => f.geradores);
  const fortes = R.shuffle(calculo.map(g => gerarDe(g, calculo)).filter(q => q.nivel !== 'facil')).slice(0, qtd - 2);
  const pools = R.shuffle(doMundo.filter(f => f.conceitual)).map(f => R.shuffle(f.geradores.map(g => gerarDe(g, f.geradores)).filter(q => q.nivel !== 'facil')));
  const conceito = pools.map(p => p.shift()).filter(Boolean);
  const resto = pools.flat();
  while (conceito.length < 2 && resto.length) conceito.push(resto.shift());
  return R.shuffle([...fortes, ...conceito.slice(0, 2)]);
}

/* Questão para pôr no lugar de "q": mesmo nível (vale os mesmos pontos) e mesmo grupo.
   Primeiro um tipo que ainda não apareceu nesta tentativa; depois o mesmo tipo com
   números novos; por último um tipo que já saiu antes. Nunca repete uma questão da prova
   (nas de gráfico o texto pode ser igual: o que muda é o gráfico). */
const assinatura = q => q.texto + '|' + (q.visual || '');
function questaoSubstituta(q, naProva, jaVistos) {
  const grupo = q.grupo || [];
  const ocupados = new Set(naProva.map(x => x.gerador));
  const naTela = new Set(naProva.map(assinatura));
  const livres = R.shuffle(grupo.filter(g => !ocupados.has(g)));
  const candidatos = [...livres.filter(g => !jaVistos.has(g)), ...Array(8).fill(q.gerador), ...livres.filter(g => jaVistos.has(g))];
  for (const g of candidatos) {
    if (typeof g !== 'function') continue;
    const nova = gerarDe(g, grupo);
    if (nova.nivel === q.nivel && !naTela.has(assinatura(nova))) return nova;
  }
  return null;
}
