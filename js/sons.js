/* =========================================================
   SONS — musiquinha de acerto e de erro nas questões.
   Os sons são criados na hora pelo navegador (Web Audio API):
   não há arquivo de áudio para baixar e funciona sem internet.
   O botão 🔊 no alto da fase liga e desliga (fica salvo no aparelho).
   ========================================================= */
const Som = (() => {
  const CHAVE_SOM = 'conectados_dinheiro_v1_som';
  let ligado = true, ctx = null, saida = null;
  try { ligado = localStorage.getItem(CHAVE_SOM) !== 'desligado'; } catch { /* sem armazenamento */ }

  // O navegador só deixa tocar som depois de um toque do estudante,
  // por isso isto é chamado dentro de um clique (começar a fase, responder).
  function preparar() {
    if (!ligado) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch { return null; }
      saida = ctx.createGain();
      saida.gain.value = 1;   // volume geral
      saida.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  }

  // Toca agora ou, se o som ainda estiver acordando, assim que acordar (nunca atrasado).
  function tocar(musica) {
    const c = preparar(); if (!c) return;
    const pedido = performance.now();
    const ja = () => { if (performance.now() - pedido < 500) musica(c, c.currentTime + 0.03); };
    c.state === 'running' ? ja() : c.resume().then(ja, () => {});
  }

  // Uma nota com ataque rápido e final suave (sem estalo).
  function nota(c, freq, t, dur, { onda = 'triangle', vol = 0.2, cair = 0, filtro = 0 } = {}) {
    const osc = c.createOscillator(), env = c.createGain();
    osc.type = onda;
    osc.frequency.setValueAtTime(freq, t);
    if (cair) osc.frequency.exponentialRampToValueAtTime(freq * cair, t + dur);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env);
    if (filtro) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filtro;
      env.connect(f); f.connect(saida);
    } else env.connect(saida);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // Acerto: dó, mi, sol, dó subindo, com brilho de sininho. "Plim-plim-plim-pliiim!"
  const acerto = () => tocar((c, t) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const ti = t + i * 0.08, dur = i === 3 ? 0.6 : 0.25;
      nota(c, f, ti, dur, { vol: 0.38 });
      nota(c, f * 2, ti, dur * 0.7, { onda: 'sine', vol: 0.1 });
    });
  });

  // Erro: dois tons macios descendo, "tum... tuuum", sem assustar nem desanimar.
  const erro = () => tocar((c, t) => {
    nota(c, 329.63, t, 0.2, { onda: 'square', vol: 0.26, filtro: 1500 });
    nota(c, 277.18, t + 0.19, 0.45, { onda: 'square', vol: 0.26, filtro: 1200, cair: 0.94 });
  });

  // Um "plim" curto para mostrar que o som foi ligado.
  const aviso = () => tocar((c, t) => nota(c, 880, t, 0.3, { vol: 0.3 }));

  function atualizarBotao() {
    const b = document.getElementById('quiz-som'); if (!b) return;
    b.textContent = ligado ? '🔊' : '🔇';
    b.setAttribute('aria-pressed', String(ligado));
    b.title = ligado ? 'Desligar os sons' : 'Ligar os sons';
  }

  function alternar() {
    ligado = !ligado;
    try { localStorage.setItem(CHAVE_SOM, ligado ? 'ligado' : 'desligado'); } catch { /* sem armazenamento */ }
    atualizarBotao();
    if (ligado) aviso();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('quiz-som');
    if (b) b.onclick = alternar;
    atualizarBotao();
  });

  return { preparar, acerto, erro, get ligado() { return ligado; } };
})();
