/* ==========================================================================
   CHAVE MÁGICA - Jogo Educativo Numerandus
   JavaScript Principal — v3.0 (Silhuetas Planas)
   ========================================================================== */

/* ==========================================================================
   1. ESTADO DO JOGO E CONFIGURAÇÕES
   ========================================================================== */
const coresChaves = [
    'var(--key-red)', 'var(--key-blue)', 'var(--key-green)',
    'var(--key-yellow)', 'var(--key-purple)', 'var(--key-orange)',
    'var(--key-pink)', 'var(--key-cyan)'
];

// Padrões de dentes — alturas diferentes criam perfis únicos (2 dentes simplificados)
const perfisDentes = [
    { dentes: [8, 15] },
    { dentes: [15, 8] },
    { dentes: [8, 22] },
    { dentes: [22, 8] },
    { dentes: [15, 22] },
    { dentes: [22, 15] },
    { dentes: [15, 15] },
    { dentes: [8, 8] }
];

// Estilos da cabeça (bow)
const estilosBow = ['circulo', 'quadrado', 'losango', 'oval'];

// Mensagens motivacionais
const mensagensAcerto = [
    "Incrível! 🌟", "Perfeito! ✨", "Mandou bem! 🎯",
    "Excelente! 💎", "Brilhante! ⭐", "Show! 🚀"
];

const mensagensErro = [
    "Quase lá! 💪", "Tenta outra vez! 🔄", "Não desiste! 🌈",
    "Observe os dentes! 👀", "Quase! Continue! 🎯"
];

const mensagensEncerramento = {
    vitoria: [
        "Você é um verdadeiro mestre das chaves! 🏆",
        "Missão cumprida com sucesso! 🎉",
        "Parabéns, campeão! 🌟"
    ],
    derrota_vidas: [
        "Olhe com cuidado os dentes das chaves! 🔍",
        "Cada chave tem dentes únicos. Observe bem! 👀"
    ],
    derrota_tempo: [
        "Seja mais rápido da próxima vez! ⚡",
        "A prática leva à perfeição! 💪"
    ]
};

let chavesNivel = [];
let acertos = 0;
let pontuacao = 0;
let nivelAtual = 1;
let faseAtual = 1; // 1, 2 ou 3 para o nível 1
let vidas = 3;
let errosTotal = 0;
let totalChaves = 4; // Começa com 4 chaves na Fase 1

let tempoRestante = 60;
let tempoInicial = 60;
let timerInterval = null;

const somEncaixe = new Audio('sons/pop.mp3');
const somCorreto = new Audio('sons/correto.mp3');
const somErro = new Audio('sons/error-notification.mp3');
/*const somTempoEsgotado = new Audio('sons/voce-nao-tem-aura.mp3');*/
const somVitoria = new Audio('sons/super-smash-bros-bonus-results.mp3');

const board = document.getElementById('wooden-board');
const tray = document.getElementById('key-tray');
const statusEl = document.getElementById('status');
const pontuacaoEl = document.getElementById('pontuacao');
const timerEl = document.getElementById('timer');
const container = document.getElementById('game-container');
const progressBar = document.getElementById('progresso-barra');

/* ==========================================================================
   2. GERADORES DE SVG — SILHUETAS PLANAS E SIMPLES
   ========================================================================== */

// Path da cabeça (bow) com furo recortado via evenodd
function gerarBowPath(estilo) {
    switch (estilo) {
        case 'quadrado':
            return `M 4 6 L 44 6 L 44 48 L 4 48 Z  M 15 17 L 33 17 L 33 37 L 15 37 Z`;
        case 'losango':
            return `M 24 4 L 46 27 L 24 50 L 2 27 Z  M 24 16 L 34 27 L 24 38 L 14 27 Z`;
        case 'oval':
            return `M 24 6 C 44 6 48 18 48 27 C 48 36 44 48 24 48 C 4 48 0 36 0 27 C 0 18 4 6 24 6 Z  M 24 16 C 34 16 36 21 36 27 C 36 33 34 38 24 38 C 14 38 12 33 12 27 C 12 21 14 16 24 16 Z`;
        case 'circulo':
        default:
            return `M 24 4 A 23 23 0 1 1 24 50 A 23 23 0 1 1 24 4 Z  M 24 15 A 12 12 0 1 1 24 39 A 12 12 0 1 1 24 15 Z`;
    }
}

// Path dos dentes (retângulos simples descendo da haste)
function gerarDentesPath(dentesArray) {
    let p = '';
    const startX = 76;
    const gap = 24;
    const baseY = 32;
    const w = 12;

    dentesArray.forEach((h, i) => {
        const x = startX + (i * gap);
        p += `M${x} ${baseY} L${x + w} ${baseY} L${x + w} ${baseY + h} L${x} ${baseY + h}Z `;
    });
    return p;
}

// ====== CHAVE — Silhueta plana, cor sólida, sem stroke ======
function gerarChaveSVG(chave, isFechadura = false) {
    const cor = isFechadura ? '#1a0b05' : chave.cor;
    const bowPath = gerarBowPath(chave.bowEstilo);
    const dentesPath = gerarDentesPath(chave.perfil.dentes);

    return `
        <svg viewBox="0 0 130 54" class="svg-chave" xmlns="http://www.w3.org/2000/svg">
            <path d="${bowPath}" fill="${cor}" fill-rule="evenodd"/>
            <rect x="44" y="22" width="74" height="10" rx="2" fill="${cor}"/>
            <path d="${dentesPath}" fill="${cor}"/>
        </svg>
    `;
}

// ====== CADEADO FECHADO (Nível 2) ======
function gerarCadeadoFechadoSVG(chave) {
    const bowPath = gerarBowPath(chave.bowEstilo);
    const dentesPath = gerarDentesPath(chave.perfil.dentes);

    return `
        <svg viewBox="0 0 160 160" class="svg-cadeado" xmlns="http://www.w3.org/2000/svg">
            <path d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#B0B8C1" stroke-width="13" stroke-linecap="round"/>
            <path d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#D8DDE2" stroke-width="6" stroke-linecap="round"/>
            <rect x="18" y="58" width="124" height="92" rx="14" fill="${chave.cor}"/>
            <rect x="18" y="58" width="124" height="28" rx="14" fill="rgba(255,255,255,0.18)"/>
            <g transform="translate(33, 90) scale(0.66)">
                <path d="${bowPath}" fill="#1a0b05" fill-rule="evenodd" opacity="0.8"/>
                <rect x="44" y="22" width="74" height="10" rx="2" fill="#1a0b05" opacity="0.8"/>
                <path d="${dentesPath}" fill="#1a0b05" opacity="0.8"/>
            </g>
        </svg>
    `;
}

// ====== CADEADO DESBLOQUEANDO (Nível 2 — Animação) ======
function gerarCadeadoUnlockingSVG(chave) {
    const bowPath = gerarBowPath(chave.bowEstilo);
    const dentesPath = gerarDentesPath(chave.perfil.dentes);

    return `
        <svg viewBox="0 0 160 160" class="svg-cadeado unlocking" xmlns="http://www.w3.org/2000/svg">
            <path class="alca-anim" d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#B0B8C1" stroke-width="13" stroke-linecap="round"/>
            <path class="alca-anim" d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#D8DDE2" stroke-width="6" stroke-linecap="round"/>
            <rect x="18" y="58" width="124" height="92" rx="14" fill="${chave.cor}"/>
            <rect x="18" y="58" width="124" height="28" rx="14" fill="rgba(255,255,255,0.18)"/>
            <g transform="translate(33, 90) scale(0.66)" opacity="0.3">
                <path d="${bowPath}" fill="#1a0b05" fill-rule="evenodd"/>
                <rect x="44" y="22" width="74" height="10" rx="2" fill="#1a0b05"/>
                <path d="${dentesPath}" fill="#1a0b05"/>
            </g>
            <g class="chave-girar" transform="translate(33, 90) scale(0.66)">
                <path d="${bowPath}" fill="${chave.cor}" fill-rule="evenodd"/>
                <rect x="44" y="22" width="74" height="10" rx="2" fill="${chave.cor}"/>
                <path d="${dentesPath}" fill="${chave.cor}"/>
            </g>
        </svg>
    `;
}

// ====== CADEADO ABERTO (Nível 2 — Após acerto) ======
function gerarCadeadoAbertoSVG(chave) {
    const bowPath = gerarBowPath(chave.bowEstilo);
    const dentesPath = gerarDentesPath(chave.perfil.dentes);

    return `
        <svg viewBox="0 0 160 160" class="svg-cadeado opened" xmlns="http://www.w3.org/2000/svg">
            <path class="alca-aberta-final" d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#B0B8C1" stroke-width="13" stroke-linecap="round"/>
            <path class="alca-aberta-final" d="M 42 60 L 42 40 A 38 38 0 0 1 118 40 L 118 60" fill="none" stroke="#D8DDE2" stroke-width="6" stroke-linecap="round"/>
            <rect x="18" y="58" width="124" height="92" rx="14" fill="${chave.cor}"/>
            <rect x="18" y="58" width="124" height="28" rx="14" fill="rgba(255,255,255,0.18)"/>
            <g transform="translate(33, 90) scale(0.66)" opacity="0.3">
                <path d="${bowPath}" fill="#1a0b05" fill-rule="evenodd"/>
                <rect x="44" y="22" width="74" height="10" rx="2" fill="#1a0b05"/>
                <path d="${dentesPath}" fill="#1a0b05"/>
            </g>
            <g class="chave-aberta-final" transform="translate(33, 90) scale(0.66)">
                <path d="${bowPath}" fill="${chave.cor}" fill-rule="evenodd"/>
                <rect x="44" y="22" width="74" height="10" rx="2" fill="${chave.cor}"/>
                <path d="${dentesPath}" fill="${chave.cor}"/>
            </g>
            <circle cx="135" cy="138" r="13" fill="#00D2A0"/>
            <polyline points="127,138 133,144 143,132" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

// Gera dados aleatórios para cada rodada
function gerarDadosRodada() {
    chavesNivel = [];
    const coresEmb = [...coresChaves].sort(() => Math.random() - 0.5);

    let perfisSelecionados = [];
    let bowsSelecionados = [];

    if (nivelAtual === 1 && faseAtual === 1) {
        // Fase 1: 1 dente apenas.
        const perfis1Dente = [
            { dentes: [8] },
            { dentes: [12] },
            { dentes: [17] },
            { dentes: [22] }
        ];
        perfisSelecionados = [...perfis1Dente].sort(() => Math.random() - 0.5);
        bowsSelecionados = [...estilosBow].sort(() => Math.random() - 0.5);
    } else if (nivelAtual === 1 && faseAtual === 2) {
        // Fase 2: 2 dentes simples, pegamos 6
        const perfis2Dentes = [...perfisDentes].sort(() => Math.random() - 0.5);
        perfisSelecionados = perfis2Dentes.slice(0, 6);
        bowsSelecionados = [...estilosBow, ...estilosBow].sort(() => Math.random() - 0.5).slice(0, 6);
    } else {
        // Fase 3 ou Nível 2: 8 chaves, dentes e cabeças completos
        perfisSelecionados = [...perfisDentes].sort(() => Math.random() - 0.5);
        bowsSelecionados = [...estilosBow, ...estilosBow].sort(() => Math.random() - 0.5);
    }

    for (let i = 0; i < totalChaves; i++) {
        chavesNivel.push({
            id: `chave-${i}`,
            cor: coresEmb[i % coresEmb.length],
            perfil: perfisSelecionados[i],
            bowEstilo: bowsSelecionados[i]
        });
    }
}

/* ==========================================================================
   3. TEMPORIZADOR E ESTADO DO JOGO
   ========================================================================== */

function iniciarTemporizador() {
    clearInterval(timerInterval);
    tempoRestante = tempoInicial;
    atualizarTimerUI();

    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarTimerUI();
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            gameOver(false);
        }
    }, 1000);
}

function atualizarTimerUI() {
    timerEl.innerHTML = `⏳ ${tempoRestante}s`;
    if (tempoRestante <= 5 && tempoRestante > 0) {
        timerEl.classList.add('timer-critico');
    } else {
        timerEl.classList.remove('timer-critico');
    }
}

function pararTemporizador() {
    clearInterval(timerInterval);
    timerEl.classList.remove('timer-critico');
}

function atualizarVidasUI() {
    for (let i = 1; i <= 3; i++) {
        const c = document.getElementById(`vida-${i}`);
        if (i <= vidas) {
            c.classList.remove('perdido');
            c.textContent = '❤️';
        } else {
            if (!c.classList.contains('perdido')) {
                c.classList.add('animar-perda');
                setTimeout(() => c.classList.remove('animar-perda'), 400);
            }
            c.classList.add('perdido');
            c.textContent = '💔';
        }
    }
}

function atualizarProgresso() {
    progressBar.style.width = `${(acertos / totalChaves) * 100}%`;
}

/* ==========================================================================
   4. FEEDBACK
   ========================================================================== */

function mostrarFeedbackToast(tipo) {
    const toast = document.createElement('div');
    toast.className = `feedback-toast ${tipo}`;

    const icone = document.createElement('div');
    icone.className = 'feedback-icon';

    const texto = document.createElement('div');
    texto.className = 'feedback-text';

    if (tipo === 'sucesso') {
        icone.textContent = nivelAtual === 1 ? '🔑' : '🔓';
        texto.textContent = mensagensAcerto[Math.floor(Math.random() * mensagensAcerto.length)];
    } else {
        icone.textContent = '❌';
        texto.textContent = mensagensErro[Math.floor(Math.random() * mensagensErro.length)];
    }

    toast.appendChild(icone);
    toast.appendChild(texto);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 1200);
}

/* ==========================================================================
   5. DRAG AND DROP
   ========================================================================== */

function getClosestFechadura(clientX, clientY) {
    let closest = null;
    let minDist = nivelAtual === 1 ? 85 : 70;

    document.querySelectorAll('.fechadura:not(.resolvida)').forEach(f => {
        const r = f.getBoundingClientRect();
        const d = Math.hypot((r.left + r.width / 2) - clientX, (r.top + r.height / 2) - clientY);
        if (d < minDist) { minDist = d; closest = f; }
    });
    return closest;
}

function inicializarArrasto(el, idChave) {
    let dragging = false, sx = 0, sy = 0;

    el.addEventListener('pointerdown', (e) => {
        if (el.classList.contains('returning') || dragging || tempoRestante <= 0 || (typeof tutorialAtivo !== 'undefined' && tutorialAtivo) || !document.getElementById('end-screen').classList.contains('hidden')) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        dragging = true;
        el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY;
        el.classList.add('dragging');
        el.style.transform = 'scale(1.15)';

        statusEl.textContent = nivelAtual === 1 ? "Arraste para o molde correto!" : "Leve até o cadeado certo!";
        statusEl.style.color = 'var(--text-main)';
        document.querySelectorAll('.fechadura:not(.resolvida)').forEach(f => f.classList.add('highlight'));
    });

    el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        el.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.15)`;
        document.querySelectorAll('.fechadura').forEach(f => f.classList.remove('drag-over'));
        const t = getClosestFechadura(e.clientX, e.clientY);
        if (t) t.classList.add('drag-over');
    });

    const drop = (e) => {
        if (!dragging) return;
        dragging = false;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('dragging');
        document.querySelectorAll('.fechadura').forEach(f => f.classList.remove('highlight', 'drag-over'));

        const t = getClosestFechadura(e.clientX, e.clientY);
        if (t) tentarEncaixe(idChave, t.dataset.id, t, el);
        else retornarChave(el);
    };

    el.addEventListener('pointerup', drop);
    el.addEventListener('pointercancel', drop);
}

function retornarChave(el) {
    el.classList.add('returning');
    el.style.transform = '';
    setTimeout(() => el.classList.remove('returning'), 350);
}

function tentarEncaixe(idChave, idFechadura, fEl, cEl) {
    if (!document.getElementById('end-screen').classList.contains('hidden') || tempoRestante <= 0) {
        retornarChave(cEl);
        return;
    }

    if (idChave === idFechadura) {
        somEncaixe.currentTime = 0;
        somEncaixe.play().catch(e => console.log("Erro de áudio:", e));

        setTimeout(() => {
            somCorreto.currentTime = 0;
            somCorreto.play().catch(e => console.log("Erro de áudio:", e));
        }, 250);

        if (nivelAtual === 2) {
            // Level 2 special animated unlocking flow!
            fEl.classList.add('resolvida'); // Disable hover/dragover
            fEl.style.cursor = 'default';
            cEl.remove(); // Remove the dragged key immediately

            const chaveObj = chavesNivel.find(c => c.id === idChave);
            fEl.innerHTML = gerarCadeadoUnlockingSVG(chaveObj);

            // Wait for insertion and turn animation to complete
            setTimeout(() => {
                fEl.innerHTML = gerarCadeadoAbertoSVG(chaveObj);
                
                acertos++;
                pontuacao += 20 + Math.max(0, Math.floor(tempoRestante / 10));
                pontuacaoEl.textContent = pontuacao;
                atualizarProgresso();
                mostrarFeedbackToast('sucesso');
                statusEl.textContent = "Cadeado aberto! 🔓";
                statusEl.style.color = 'var(--success)';
                criarParticulas(fEl);

                if (acertos === totalChaves) {
                    pararTemporizador();
                    setTimeout(() => gameOver(true), 1000);
                }
            }, 1200); // Matches the 1.2s CSS animation
        } else {
            // Level 1 normal flow
            acertos++;
            pontuacao += 10 + Math.max(0, Math.floor(tempoRestante / 10));
            pontuacaoEl.textContent = pontuacao;
            atualizarProgresso();
            mostrarFeedbackToast('sucesso');

            /*statusEl.textContent = "Encaixe perfeito! ✨";*/
            statusEl.style.color = 'var(--success)';

            fEl.classList.add('animar-sucesso');
            setTimeout(() => fEl.classList.remove('animar-sucesso'), 600);

            const clone = cEl.cloneNode(true);
            clone.className = 'chave-encaixada';
            clone.style = ''; clone.id = '';
            fEl.innerHTML = '';
            fEl.appendChild(clone);

            fEl.classList.add('resolvida');
            fEl.style.cursor = 'default';
            cEl.remove();
            criarParticulas(fEl);

            if (acertos === totalChaves) {
                pararTemporizador();
                setTimeout(() => verificarFimDeRodada(), 1000);
            }
        }
    } else {
        somErro.currentTime = 0;
        somErro.play().catch(e => console.log("Erro de áudio:", e));

        vidas--; errosTotal++;
        atualizarVidasUI();
        mostrarFeedbackToast('erro');

        if (vidas > 0) {
            statusEl.textContent = "Oops! Essa chave não encaixa aqui.";
            statusEl.style.color = 'var(--error)';
        } else {
            statusEl.textContent = "Ficou sem vidas!";
            statusEl.style.color = 'var(--error)';
            pararTemporizador();
            setTimeout(() => gameOver(false, 'vidas'), 800);
        }

        fEl.classList.add('shake');
        setTimeout(() => fEl.classList.remove('shake'), 400);
        retornarChave(cEl);
    }
}

/* ==========================================================================
   6. FLUXO DO JOGO
   ========================================================================== */

function renderizarMesa() {
    board.innerHTML = '';
    tray.innerHTML = '';

    const fEmb = [...chavesNivel].sort(() => Math.random() - 0.5);
    const cEmb = [...chavesNivel].sort(() => Math.random() - 0.5);

    fEmb.forEach((ch, i) => {
        const f = document.createElement('div');
        f.dataset.id = ch.id;
        f.style.animation = `cairDoAlto 0.4s ease-out ${i * 0.1}s both`;
        if (nivelAtual === 1) { f.className = 'fechadura'; f.innerHTML = gerarChaveSVG(ch, true); }
        else { f.className = 'fechadura fechadura-cadeado'; f.innerHTML = gerarCadeadoFechadoSVG(ch); }
        board.appendChild(f);
    });

    cEmb.forEach((ch, i) => {
        const slot = document.createElement('div');
        slot.className = 'chave-slot';
        slot.style.animation = `cairDoAlto 0.4s ease-out ${(i * 0.1) + 0.5}s both`;
        const c = document.createElement('div');
        c.className = 'chave-container';
        c.id = ch.id;
        c.innerHTML = gerarChaveSVG(ch, false);
        slot.appendChild(c);
        tray.appendChild(slot);
        inicializarArrasto(c, ch.id);
    });
}

function iniciarNivel2() {
    document.getElementById('level-screen').classList.add('hidden');
    nivelAtual = 2;
    prepararRodada();
}

function verificarFimDeRodada() {
    if (faseAtual < 3) {
        mostrarTransicaoFase();
    } else {
        gameOver(true);
    }
}

function mostrarTransicaoFase() {
    const btnTut = document.getElementById('btn-tutorial-flutuante');
    if (btnTut) btnTut.style.display = 'none';

    const screen = document.getElementById('level-screen');
    const title = screen.querySelector('h1');
    const sub = screen.querySelector('.subtitulo');
    const btn = screen.querySelector('button');
    const emoji = screen.querySelector('.flutuar');

    emoji.textContent = '🔑';
    title.textContent = `Fase ${faseAtual} Concluída!`;
    sub.innerHTML = `Excelente trabalho! A próxima fase terá chaves com dentes mais desafiadores.`;
    btn.textContent = `🔑 IR PARA A FASE ${faseAtual + 1}`;
    btn.className = 'btn-primario';
    btn.onclick = () => {
        screen.classList.add('hidden');
        faseAtual++;
        prepararRodada();
    };

    screen.classList.remove('hidden');
}

function mostrarTransicaoLevel2() {
    const btnTut = document.getElementById('btn-tutorial-flutuante');
    if (btnTut) btnTut.style.display = 'none';

    const screen = document.getElementById('level-screen');
    const title = screen.querySelector('h1');
    const sub = screen.querySelector('.subtitulo');
    const btn = screen.querySelector('button');
    const emoji = screen.querySelector('.flutuar');

    emoji.textContent = '🔓'
    title.textContent = "Misão  Concluído!";
    sub.innerHTML = `Muito bem! Agora prepare-se para o desafio dos <strong>Cadeados Coloridos</strong>.<br>Encontre a chave que abre cada cadeado!`;
    btn.textContent = "🔐 IR PARA O NÍVEL 2";
    btn.className = 'btn-primario btn-nivel2';
    btn.onclick = () => {
        iniciarNivel2();
    };

    screen.classList.remove('hidden');
}

function prepararRodada() {
    const btnTut = document.getElementById('btn-tutorial-flutuante');
    if (btnTut) btnTut.style.display = 'flex';

    acertos = 0; vidas = 3;
    atualizarVidasUI();
    atualizarProgresso();

    if (nivelAtual === 1) {
        board.classList.remove('nivel-2-board');
        if (faseAtual === 1) {
            totalChaves = 3;
            tempoInicial = 20;
        } else if (faseAtual === 2) {
            totalChaves = 4;
            tempoInicial = 15;
        } else {
            totalChaves = 5;
            tempoInicial = 15;
        }
        /*_document.getElementById('nivel-indicador').textContent = `Nível 1`;*/
        /*statusEl.textContent = "Arraste as chaves para os moldes!";*/
    } else {
        board.classList.add('nivel-2-board');
        totalChaves = 8;
        tempoInicial = 90;
        /*document.getElementById('nivel-indicador').textContent = 'Nível 2 - Cadeados';
        statusEl.textContent = "Descubra a chave de cada cadeado!";*/
    }
    statusEl.style.color = 'var(--text-main)';

    gerarDadosRodada();
    renderizarMesa();
    iniciarTemporizador();
}

function iniciarJogo() {
    const nome = document.getElementById('nome-jogador').value.trim() || "Mestre das chaves";
    document.getElementById('display-nome').textContent = nome;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    pontuacao = 0; 
    nivelAtual = 1; 
    faseAtual = 1;
    errosTotal = 0;
    pontuacaoEl.textContent = 0;
    /*document.getElementById('nivel-indicador').textContent = 'Nível 1';*/
    prepararRodada();
}

function calcularEstrelas() {
    if (vidas === 3 && errosTotal === 0) return 3;
    if (vidas >= 2 && errosTotal <= 2) return 2;
    return 1;
}

function gameOver(venceu, motivo = 'tempo') {
    const btnTut = document.getElementById('btn-tutorial-flutuante');
    if (btnTut) btnTut.style.display = 'none';

    document.getElementById('end-screen').classList.remove('hidden');
    const nome = document.getElementById('display-nome').textContent;
    document.getElementById('pontuacao-final').textContent = pontuacao;
    document.getElementById('stat-acertos').textContent = `${acertos}/${totalChaves}`;
    document.getElementById('stat-erros').textContent = errosTotal;
    document.getElementById('stat-tempo').textContent = `${tempoInicial - tempoRestante}s`;
    document.getElementById('stat-nivel').textContent = nivelAtual === 1 ? `Nível 1 - Fase ${faseAtual}/3` : `Nível 2`;

    const titulo = document.getElementById('titulo-final');
    const sub = document.getElementById('subtitulo-final');
    const icone = document.getElementById('icone-final');
    const estCont = document.getElementById('estrelas-container');

    if (venceu) {
        somVitoria.currentTime = 0;
        somVitoria.play().catch(e => console.log("Erro de áudio:", e));

        const n = calcularEstrelas();
        icone.textContent = '🏆';
        titulo.innerHTML = `Parabéns, <span id="nome-vencedor">${nome}</span>!`;
        titulo.style.color = 'var(--success-color)';
        sub.textContent = mensagensEncerramento.vitoria[Math.floor(Math.random() * mensagensEncerramento.vitoria.length)];
        estCont.querySelectorAll('.estrela').forEach((e, i) => {
            setTimeout(() => {
                if (i < n) {
                    e.classList.add('ativa');
                    e.classList.remove('vazia');
                    const somClone = somCorreto.cloneNode();
                    somClone.play().catch(err => console.log(err));
                } else {
                    e.classList.add('vazia');
                    e.classList.remove('ativa');
                }
            }, 300 + i * 300);
        });
        criarConfetti();
    } else {
        estCont.querySelectorAll('.estrela').forEach(e => { e.classList.remove('ativa'); e.classList.add('vazia'); });
        if (motivo === 'vidas') {
            icone.textContent = '💔'; 
            titulo.textContent = "Ficou sem vidas!"; 
            titulo.style.color = 'var(--error-color)';
            sub.textContent = mensagensEncerramento.derrota_vidas[Math.floor(Math.random() * mensagensEncerramento.derrota_vidas.length)];
        } else {
        

            icone.textContent = '⏱️'; 
            titulo.textContent = "Tempo esgotado!"; 
            titulo.style.color = 'var(--error-color)';
            sub.textContent = mensagensEncerramento.derrota_tempo[Math.floor(Math.random() * mensagensEncerramento.derrota_tempo.length)];
        }
    }
}

function reiniciarJogo() {
   
    somVitoria.pause();
    somVitoria.currentTime = 0;

    document.querySelectorAll('.estrela').forEach(e => e.classList.remove('ativa', 'vazia'));
    iniciarJogo();
}

/* ==========================================================================
   7. EFEITOS VISUAIS
   ========================================================================== */

function criarParticulas(el) {
    const estrelas = ['⭐', '🌟', '✨'];
    const r = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const cx = (r.left - cr.left) + r.width / 2;
    const cy = (r.top - cr.top) + r.height / 2;

    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.textContent = estrelas[Math.floor(Math.random() * estrelas.length)];
        p.className = 'particula explosao';
        p.style.left = `${cx}px`; p.style.top = `${cy}px`;
        
        const tamanho = 1 + Math.random() * 1.2;
        p.style.fontSize = `${tamanho}rem`;
        
        const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 80;
        p.style.setProperty('--tx', `${Math.cos(a) * d}px`);
        p.style.setProperty('--ty', `${Math.sin(a) * d}px`);
        container.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

function criarConfetti() {
    const cores = ['#FF6B6B', '#54A0FF', '#5CD85C', '#FECA57', '#A29BFE', '#FF9F43', '#FF6B9D', '#48DBFB'];
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = `${Math.random() * 100}%`;
        c.style.top = '-10px';
        c.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        c.style.setProperty('--duration', `${1.5 + Math.random() * 2}s`);
        c.style.setProperty('--delay', `${Math.random()}s`);
        c.style.width = `${6 + Math.random() * 8}px`;
        c.style.height = `${6 + Math.random() * 8}px`;
        c.style.borderRadius = Math.random() > 0.5 ? '35%' : '2px';
        container.appendChild(c);
        setTimeout(() => c.remove(), 4000);
    }
}

/* ==========================================================================
   8. INIT
   ========================================================================== */
document.getElementById('nome-jogador').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') iniciarJogo();
});
