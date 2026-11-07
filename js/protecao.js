/* =========================================================
   PROTEÇÃO CONTRA PRINT E COLA
   Nenhum site consegue impedir o print do celular: isso só é possível
   em aplicativo instalado. Então a proteção faz o print não servir para nada:
   • Saiu da tela no meio de uma questão (para abrir o ChatGPT, por exemplo)?
     A questão some e, na volta, é trocada por outra do mesmo nível.
   • No computador, a tecla Print Screen e os atalhos de recorte
     (Win+Shift+S, Cmd+Shift+4, Ctrl+Shift+S) escondem ou trocam a questão.
   • O texto das questões não pode ser selecionado, copiado nem impresso.
   • A tela não apaga sozinha durante a fase (até 5 minutos sem tocar),
     para quem faz a conta no papel não perder a questão.
   Nada disso tira pontos: a questão nova vale o mesmo que a antiga.
   ========================================================= */
const Protecao = (() => {
  const TOLERANCIA_MS = 1500;        // saídas mais curtas (piscadas do sistema) não trocam a questão
  const OCIOSO_MS = 5 * 60 * 1000;   // 5 min sem tocar: a tela volta a poder apagar
  let saiuEm = 0, printSuspeito = false, pausada = false;
  let trava = null, pedindoTrava = false, timerOcioso = 0;

  const el = id => document.getElementById(id);
  const ativa = id => !!el(id)?.classList.contains('ativa');
  const noQuiz = () => ativa('tela-quiz');
  const protegida = () => noQuiz() || ativa('tela-resultado');
  // Só vale com uma questão aberta e ainda sem resposta.
  const emQuestao = () => !pausada && noQuiz() && !el('quiz-feedback').classList.contains('aberto');
  const cobrindo = () => !!el('quiz-cortina') && !el('quiz-cortina').hidden;
  const presente = () => document.visibilityState === 'visible' && document.hasFocus();
  const cobrir = () => { const c = el('quiz-cortina'); c.hidden = false; c.focus({ preventScroll: true }); };
  const descobrir = () => { el('quiz-cortina').hidden = true; };

  function trocar(msg) { if (trocarQuestaoAtual()) toast(msg); }

  // Saiu da tela: outro app, outra aba, outra janela, tela bloqueada, recorte de tela...
  function saiu() {
    if (!emQuestao()) return;
    if (!saiuEm) saiuEm = Date.now();
    cobrir();
  }

  // Voltou: mostra a fase de novo e, se ficou fora (ou tirou print), troca a questão.
  // Tocar na cortina sempre vale como "voltei" (alguns navegadores de apps não avisam o foco).
  function voltou(e) {
    if (!cobrindo() || (e?.type !== 'click' && !presente())) return;
    const fora = saiuEm ? Date.now() - saiuEm : 0, print = printSuspeito;
    saiuEm = 0; printSuspeito = false;
    descobrir();
    if (!emQuestao()) return;
    if (print) trocar('📸 Print não vale! A questão mudou.');
    else if (fora >= TOLERANCIA_MS) trocar('🔄 Você saiu da tela, então a questão mudou. Sem cola! 😉');
  }

  /* ---------- tela acesa durante a fase ---------- */
  function soltarTrava() { if (trava) { trava.release().catch(() => {}); trava = null; } }
  async function manterTelaAcesa() {
    if (trava || pedindoTrava || !noQuiz() || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
    pedindoTrava = true;
    try {
      const t = await navigator.wakeLock.request('screen');
      if (!noQuiz()) { t.release().catch(() => {}); return; }
      trava = t;
      t.addEventListener('release', () => { if (trava === t) trava = null; });
    } catch { /* sem suporte ou sem permissão: a fase segue normal */ }
    finally { pedindoTrava = false; }
  }
  // Mexeu no celular durante a fase: a tela fica acesa por mais 5 minutos.
  function mexeu() {
    if (!noQuiz()) return;
    clearTimeout(timerOcioso);
    timerOcioso = setTimeout(soltarTrava, OCIOSO_MS);
    manterTelaAcesa();
  }

  // Chamado pelo app a cada troca de tela.
  function telaMudou(tela) {
    saiuEm = 0; printSuspeito = false;
    if (el('quiz-cortina')) descobrir();
    if (tela === 'tela-quiz') mexeu();
    else { clearTimeout(timerOcioso); soltarTrava(); }
  }

  // confirm() do próprio site tira o foco da página: isso não conta como sair da tela.
  function confirmar(msg) {
    pausada = true;
    try { return confirm(msg); }
    finally { setTimeout(() => { pausada = false; }, 500); }
  }

  /* ---------- saiu / voltou ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saiu();
    else { voltou(); if (noQuiz()) manterTelaAcesa(); }
  });
  window.addEventListener('blur', saiu);
  window.addEventListener('pagehide', saiu);
  window.addEventListener('focus', voltou);
  document.addEventListener('pointerdown', mexeu, true);

  /* ---------- teclado do computador ---------- */
  const atalhoDePrint = e => e.key === 'PrintScreen' || (e.metaKey && e.shiftKey)       // Win+Shift+S, Cmd+Shift+3/4/5
    || (e.ctrlKey && e.shiftKey && (e.key || '').toLowerCase() === 's');                 // captura do Edge e do Firefox
  document.addEventListener('keydown', e => {
    mexeu();
    if (!protegida()) return;
    // Esconde antes do recorte: o print sai sem a questão. Ela só volta (trocada) com um toque.
    if (emQuestao() && atalhoDePrint(e)) { printSuspeito = true; cobrir(); }
    const tecla = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (tecla === 'p' || tecla === 's')) {
      e.preventDefault();
      toast('🔒 As questões não podem ser impressas nem salvas.');
    }
  }, true);
  // No Windows a tecla Print Screen só avisa quando é solta: o print já foi tirado, então troca na hora.
  document.addEventListener('keyup', e => {
    if (e.key !== 'PrintScreen' || !protegida()) return;
    try { navigator.clipboard?.writeText('🔒 Print bloqueado durante a fase.').catch(() => {}); } catch { /* sem permissão */ }
    if (emQuestao()) {
      saiuEm = 0; printSuspeito = false; descobrir();
      trocar('📸 Print não vale! A questão mudou.');
    }
  }, true);

  /* ---------- sem selecionar, copiar, arrastar nem abrir o menu do texto ---------- */
  ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(tipo =>
    document.addEventListener(tipo, e => { if (protegida()) e.preventDefault(); }, true));

  document.addEventListener('DOMContentLoaded', () => { el('quiz-cortina')?.addEventListener('click', voltou); });

  return { cobrindo, telaMudou, confirmar };
})();
