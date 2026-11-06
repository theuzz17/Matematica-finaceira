/* =========================================================
   PERFIL — foto de animal, moldura, nome, apelido, senha,
   estatísticas, nível, XP da semana e conquistas.
   ========================================================= */

function tileStat(icone, valor, rotulo, classe = '', sufixo = '') {
  return `<div class="stat-tile ${classe}"><span class="stat-ic" aria-hidden="true">${icone}</span>
    <b><span data-contar="${valor}">${valor}</span>${sufixo}</b><small>${rotulo}</small></div>`;
}

// Números sobem de 0 até o valor e as barras crescem ao abrir a tela.
function animarNumeros(raiz) {
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    raiz.querySelectorAll('[data-largura]').forEach(e => { e.style.width = e.dataset.largura + '%'; });
    raiz.querySelectorAll('[data-altura]').forEach(e => { e.style.height = e.dataset.altura + '%'; });
  }));
  raiz.querySelectorAll('[data-contar]').forEach(e => {
    const fim = +e.dataset.contar;
    if (reduzir || !fim) { e.textContent = fim; return; }
    const t0 = performance.now(), dur = 800;
    const passo = t => {
      const k = Math.min(1, (t - t0) / dur);
      e.textContent = Math.round(fim * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(passo);
    };
    e.textContent = 0;
    requestAnimationFrame(passo);
  });
}

function graficoSemana(a) {
  const v = xpPorDia(a, inicioSemana(new Date()));
  const max = Math.max(...v, 1), maior = v.indexOf(Math.max(...v));
  const hoje = (new Date().getDay() + 6) % 7;
  const resumo = DIAS_CURTOS.map((d, i) => `${d} ${v[i]} XP`).join(', ');
  return `<div class="grafico-semana" role="img" aria-label="XP por dia nesta semana: ${resumo}">
    ${v.map((x, i) => `<div class="gs-col ${i === hoje ? 'hoje' : ''} ${i > hoje ? 'futuro' : ''}" tabindex="0" data-dica="${DIAS_CURTOS[i]}: ${x} XP">
      <span class="gs-valor">${x > 0 && (i === hoje || i === maior) ? x : ''}</span>
      <span class="gs-trilho"><i style="height:0" data-altura="${(x / max * 100).toFixed(1)}"></i></span>
      <small>${DIAS_CURTOS[i]}</small></div>`).join('')}
  </div>`;
}

function abrirPerfil() {
  aluno.perfil ||= {};
  const a = aluno, xp = xpTotal(a), nv = nivelDe(xp), of = ofensiva(a), pat = infoPatente(a), p = personagem();
  const resp = a.tentativas.flatMap(t => t.respostas || []);
  const taxa = resp.length ? Math.round(resp.filter(r => r.acertou).length / resp.length * 100) : 0;
  const desde = new Date(a.criadoEm).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  $('#perfil-conteudo').innerHTML = `
    <div class="perfil-capa" style="--moldura:${molduraDe(a)}">
      <span class="perfil-capa-titulo">Meu perfil</span>
      <button class="perfil-avatar" id="pf-foto" aria-label="Trocar foto do perfil">${avatarAluno(a, 'perfil')}<span class="pf-camera" aria-hidden="true">📷</span></button>
    </div>
    <div class="conteudo perfil">
      <h1 class="perfil-nome">${esc(a.nome)}</h1>
      <p class="perfil-sub">${a.perfil.apelido ? `@${esc(a.perfil.apelido)} · ` : ''}Turma ${esc(a.turma)}</p>
      <p class="perfil-desde">Na trilha desde ${desde}</p>
      <p class="perfil-sync">${!Banco.ativo ? '📱 Progresso salvo neste aparelho' : Sync.pendente ? '📴 Progresso guardado no aparelho, aguardando internet para enviar' : '☁️ Progresso salvo no banco de dados'}</p>
      <div class="perfil-chips">
        <button class="chip-liga" id="pf-liga">${escudoPatente(pat.n)}Patente ${pat.atual.nome}</button>
        <span class="chip-parceiro">${avatarSVG(p, 'chip', a.visual)}Parceiro: ${esc(p.apelido)}</span>
      </div>
      <div class="perfil-acoes">
        <button class="btn btn-secundario" id="pf-editar">✏️ Editar perfil</button>
        <button class="btn btn-secundario" id="pf-foto2">🐾 Trocar foto</button>
        <button class="btn btn-secundario pf-loja" id="pf-loja">🛍️ Vestir meu bichinho na lojinha</button>
      </div>

      <div class="cartao-nivel">
        <div class="nivel-topo"><span class="nivel-selo">${nv.n}</span>
          <div><b>Nível ${nv.n}</b><small>Faltam ${nv.falta} XP para o nível ${nv.n + 1}</small></div></div>
        <span class="barra"><i style="width:0" data-largura="${nv.pct.toFixed(1)}"></i></span>
      </div>

      <h3 class="perfil-secao">Estatísticas</h3>
      <div class="grade-stats">
        ${tileStat('🔥', of.dias, of.dias === 1 ? 'dia de ofensiva' : 'dias de ofensiva', of.hoje ? 'fogo' : 'apagado')}
        ${tileStat('⚡', xp, 'XP total')}
        ${tileStat('⭐', totalEstrelas(a), 'estrelas')}
        ${tileStat('🗺️', fasesConcluidas(a), `de ${FASES.length} fases`)}
        ${tileStat('🎯', taxa, 'de acerto', '', '%')}
        ${tileStat('🏆', of.recorde, 'recorde de ofensiva')}
        ${tileStat(ICONE_MOEDA, saldoMoedas(a), 'moedas', 'moedas')}
        ${tileStat('🎒', comprasDe(a).length, `de ${ITENS_LOJA.length} itens da loja`)}
      </div>
      ${of.hoje ? '' : `<p class="dica-ofensiva">${of.dias ? `🔥 Jogue uma fase hoje para não perder sua ofensiva de ${of.dias} ${of.dias === 1 ? 'dia' : 'dias'}!` : '🔥 Jogue uma fase hoje para começar uma ofensiva!'}</p>`}

      <h3 class="perfil-secao">XP desta semana <small>${xpDaSemana(a)} XP</small></h3>
      ${graficoSemana(a)}

      <h3 class="perfil-secao">Conquistas <small>${a.conquistas.length} de ${CONQUISTAS.length}</small></h3>
      <div class="grade-medalhas">${CONQUISTAS.map(c => {
        const on = a.conquistas.includes(c.id);
        return `<div class="medalha ${on ? 'on' : ''}" title="${esc(c.nome)}: ${esc(c.desc)}"><span>${on ? c.icone : '🔒'}</span><small>${esc(c.nome)}</small></div>`;
      }).join('')}</div>
      <button class="btn btn-texto" id="pf-conquistas">Ver como ganhar cada conquista</button>

      <button class="btn btn-secundario btn-grande pf-sair" id="pf-sair">🚪 Sair da conta</button>
    </div>`;

  $('#pf-foto').onclick = $('#pf-foto2').onclick = abrirTrocaFoto;
  $('#pf-editar').onclick = abrirEditarPerfil;
  $('#pf-loja').onclick = abrirLoja;
  $('#pf-liga').onclick = () => { abaRanking = 'patente'; abrirRanking(); };
  $('#pf-conquistas').onclick = abrirConquistas;
  $('#pf-sair').onclick = sairDaConta;
  mostrar('tela-perfil');
  animarNumeros($('#perfil-conteudo'));
}

function abrirTrocaFoto() {
  let escolhido = personagem().id, cor = molduraDe(aluno);
  const grupo = (tipo, titulo) => `<p class="campo-rotulo">${titulo}</p><div class="grade-fotos">${PERSONAGENS.filter(p => (p.tipo || 'animal') === tipo).map(p => `
    <button class="foto-op" data-id="${p.id}" aria-label="${esc(p.nome)}">${avatarSVG(p, 'op')}<small>${esc(p.apelido)}</small></button>`).join('')}</div>`;
  abrirModal(`
    <h2>📷 Foto do perfil</h2>
    <div class="foto-preview" id="foto-preview"></div>
    <p class="foto-legenda" id="foto-legenda"></p>
    <div id="foto-opcoes">
      ${grupo('animal', '🐾 Animais de Rio Tinto')}
      ${grupo('pessoa', '🪶 Povo Potiguara')}
      <p class="campo-rotulo">🎨 Cor da moldura</p>
      <div class="grade-cores">${CORES_MOLDURA.map(c => `<button class="cor-op" data-cor="${c}" style="--c:${c}" aria-label="Moldura cor ${c}"></button>`).join('')}</div>
    </div>
    <p class="dica">O animal escolhido também vira seu parceiro na trilha. As roupas da lojinha continuam com ele.</p>
    <button class="btn btn-primario btn-grande" id="foto-salvar">Salvar foto</button>
    <button class="btn btn-texto" onclick="fecharModal()">Cancelar</button>`);
  const atualizar = () => {
    const p = personagemDe(escolhido);
    $('#foto-preview').innerHTML = `<span class="av-moldura" style="--moldura:${cor}">${avatarSVG(p, 'preview', aluno.visual)}</span>`;
    $('#foto-legenda').innerHTML = `<b>${esc(p.nome)}</b><br>"${esc(p.frase)}"`;
    document.querySelectorAll('.foto-op').forEach(b => b.classList.toggle('sel', b.dataset.id === escolhido));
    document.querySelectorAll('.cor-op').forEach(b => { const on = b.dataset.cor === cor; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
  };
  $('#foto-opcoes').onclick = e => {
    const f = e.target.closest('.foto-op'), c = e.target.closest('.cor-op');
    if (f) escolhido = f.dataset.id;
    if (c) cor = c.dataset.cor;
    if (f || c) atualizar();
  };
  $('#foto-salvar').onclick = () => {
    aluno.personagem = escolhido;
    aluno.perfil = { ...aluno.perfil, moldura: cor };
    salvarAluno(); fecharModal(); toast('📷 Foto atualizada!'); abrirPerfil();
  };
  atualizar();
}

function abrirEditarPerfil() {
  abrirModal(`
    <h2>✏️ Editar perfil</h2>
    <form id="form-perfil" autocomplete="off">
      <label class="campo">Nome<input id="pf-nome" maxlength="40" autocapitalize="words" value="${esc(aluno.nome)}" required></label>
      <label class="campo">Apelido no ranking <span class="opcional">(opcional)</span><input id="pf-apelido" maxlength="20" value="${esc(aluno.perfil?.apelido || '')}" placeholder="Ex.: Mestre do Pix"></label>
      <p class="dica">No ranking aparece o apelido. Sem apelido, aparece o primeiro nome e a inicial do sobrenome.</p>
      <p class="campo-fixo">Turma: <b>${esc(aluno.turma)}</b></p>
      <details class="troca-senha"><summary>🔐 Trocar senha</summary>
        <label class="campo">Senha atual<input id="pf-senha-atual" type="password" inputmode="numeric" maxlength="4"></label>
        <label class="campo">Nova senha (4 números)<input id="pf-senha-nova" type="password" inputmode="numeric" maxlength="4"></label>
      </details>
      <p class="erro" id="pf-erro"></p>
      <button class="btn btn-primario btn-grande">Salvar</button>
    </form>
    <button class="btn btn-texto" onclick="fecharModal()">Cancelar</button>`);
  $('#form-perfil').onsubmit = async e => {
    e.preventDefault();
    const erro = $('#pf-erro');
    const nome = $('#pf-nome').value.trim().replace(/\s+/g, ' ');
    const apelido = $('#pf-apelido').value.trim().replace(/\s+/g, ' ');
    const atual = $('#pf-senha-atual').value.trim(), nova = $('#pf-senha-nova').value.trim();
    if (nome.length < 2) { erro.textContent = 'O nome precisa ter pelo menos 2 letras.'; return; }
    if (Object.values(dados.alunos).some(o => o.id !== aluno.id && chaveConta(o.turma, o.nome) === chaveConta(aluno.turma, nome))) {
      erro.textContent = 'Já existe alguém com esse nome nesta turma.'; return;
    }
    if (atual || nova) {
      if (atual !== aluno.pin) { erro.textContent = 'A senha atual está incorreta.'; return; }
      if (!/^\d{4}$/.test(nova)) { erro.textContent = 'A nova senha precisa ter 4 números.'; return; }
    }
    const mudouNome = normalizar(nome) !== normalizar(aluno.nome);

    // Com banco, nome e senha só mudam se o banco confirmar (o nome precisa estar livre).
    if (Banco.ativo && (mudouNome || nova)) {
      const botao = $('#form-perfil .btn-primario');
      botao.disabled = true; botao.textContent = 'Salvando...';
      try {
        const token = await garantirToken();
        if (nova) {
          await Banco.rpc('trocar_senha', { p_token: token, p_atual: atual, p_nova: nova });
          aluno.pin = nova; Store.salvar(dados);
        }
        if (mudouNome) {
          const res = await Banco.rpc('salvar_aluno', { p_token: token, p_dados: { ...semSenha(aluno), nome, perfil: { ...aluno.perfil, apelido } } });
          aplicarServidor(res.aluno);
        }
      } catch (falha) {
        erro.textContent = falha.codigo === 'SEM_CONEXAO' ? 'Para trocar o nome ou a senha é preciso estar com internet.' : mensagemErro(falha);
        return;
      } finally { botao.disabled = false; botao.textContent = 'Salvar'; }
    }

    aluno.nome = nome;
    aluno.perfil = { ...aluno.perfil, apelido };
    if (nova) aluno.pin = nova;
    salvarAluno(); fecharModal(); abrirPerfil();
    toast(mudouNome ? '✅ Perfil salvo! Use o novo nome para entrar da próxima vez.' : nova ? '🔐 Perfil e senha atualizados!' : '✅ Perfil salvo!');
  };
}

async function sairDaConta() {
  await sairOnline();
  Store.sessao(null); aluno = null;
  $('#form-login').reset();
  trocarModoLogin('entrar');
  preencherUltimoLogin();
  mostrar('tela-login');
}
