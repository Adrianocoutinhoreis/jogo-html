/* ==========================================================================
   TUTORIAL JS - Chave Mágica
   Lógica do tutorial interativo com destaques e controle do jogo
   ========================================================================== */

let passoAtual = 0;
let tutorialAtivo = false;
let tutorialOrigemStartScreen = false;

// Passos do tutorial
const passosTutorial = [
    {
        titulo: "🔑 Bem-vindo ao jogo da Chave Mágica!",
        descricao: "Este é um jogo divertido onde você deve encontrar a chave perfeita. Vamos aprender como jogar?",
        alvo: "#game-container",
        posicao: "centro"
    },
    {
        titulo: "👤 Jogador e Vidas",
        descricao: "Aqui é exibido as suas vidas. Você começa com 3 vidas ❤️. A cada erro de combinação de chave, você perde uma vida!",
        alvo: "#vidas-container",
        posicao: "abaixo"
    },
    {
        titulo: "⏱️ O Tempo e o Cronômetro",
        descricao: "Fique de olho aqui! Você tem um tempo limite para resolver cada rodada. Seja rápido para garantir pontuações extras!",
        alvo: "#timer",
        posicao: "abaixo"
    },
    {
        titulo: "🔑 Área dos Desafios",
        descricao: "Aa silhueta escura correspondente a uma chave secreta.",
        alvo: "#wooden-board",
        posicao: "centro-interno"
    },
    {
        titulo: "🔑 Bandeja de Chaves",
        descricao: "Estas são as chaves disponíveis! Compare o formato dos dentes para arrastar e soltar a chave correta em cada silhueta.",
        alvo: "#key-tray",
        posicao: "acima"
    },
    {
        titulo: "🎉 Tudo Pronto!",
        descricao: "Agora você está pronto para se divertir e treinar sua percepção espacial. Encontre as chaves certas e boa sorte!",
        alvo: "#game-container",
        posicao: "centro"
    }
];

// Inicia o tutorial
function iniciarTutorial() {
    if (tutorialAtivo) return;
    tutorialAtivo = true;
    passoAtual = 0;

    // Verificar se foi aberto a partir da tela inicial
    const startScreen = document.getElementById('start-screen');
    if (startScreen && !startScreen.classList.contains('hidden')) {
        tutorialOrigemStartScreen = true;
        startScreen.classList.add('hidden');
        
        // Garante que haja elementos na mesa para visualizar durante o tutorial
        const board = document.getElementById('wooden-board');
        if (board && board.children.length === 0) {
            totalChaves = 3;
            faseAtual = 1;
            nivelAtual = 1;
            gerarDadosRodada();
            renderizarMesa();
        }
    } else {
        tutorialOrigemStartScreen = false;
        // Pausar o cronômetro do jogo
        if (typeof timerInterval !== 'undefined') {
            clearInterval(timerInterval);
        }
    }

    // Criar elementos de overlay se não existirem
    criarElementosTutorial();

    // Mostrar overlay
    const overlay = document.getElementById('tutorial-overlay');
    overlay.classList.add('active');

    // Executar o primeiro passo
    mostrarPasso(0);
}

// Cria a estrutura HTML do tutorial dinamicamente
function criarElementosTutorial() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Overlay principal
    if (!document.getElementById('tutorial-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';
        gameContainer.appendChild(overlay);
    }

    // Caixa de destaque (Highlight box)
    if (!document.getElementById('tutorial-highlight-box')) {
        const highlightBox = document.createElement('div');
        highlightBox.id = 'tutorial-highlight-box';
        gameContainer.appendChild(highlightBox);
    }

    // Tooltip
    if (!document.getElementById('tutorial-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.className = 'tutorial-tooltip';
        gameContainer.appendChild(tooltip);
    }
}

// Exibe um passo específico do tutorial
function mostrarPasso(index) {
    if (index < 0 || index >= passosTutorial.length) return;
    passoAtual = index;

    const passo = passosTutorial[index];
    const highlightBox = document.getElementById('tutorial-highlight-box');
    const tooltip = document.getElementById('tutorial-tooltip');
    const gameContainer = document.getElementById('game-container');

    // Reset de classes e transição suave do tooltip
    tooltip.classList.remove('active');

    // Obter o elemento alvo
    const targetEl = document.querySelector(passo.alvo);

    if (targetEl && passo.alvo !== '#game-container') {
        highlightBox.style.display = 'block';
        
        // Ajustar caixa de destaque dinamicamente
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        const top = targetRect.top - containerRect.top;
        const left = targetRect.left - containerRect.left;
        const width = targetRect.width;
        const height = targetRect.height;

        highlightBox.style.top = `${top - 4}px`;
        highlightBox.style.left = `${left - 4}px`;
        highlightBox.style.width = `${width + 8}px`;
        highlightBox.style.height = `${height + 8}px`;
    } else {
        // Se for o container do jogo ou não houver alvo específico, destaca tudo por igual
        highlightBox.style.display = 'none';
    }

    // Atualizar HTML do tooltip
    setTimeout(() => {
        const dotsHTML = passosTutorial.map((_, i) => 
            `<span class="tutorial-dot ${i === passoAtual ? 'active' : ''}"></span>`
        ).join('');

        const isLastStep = passoAtual === passosTutorial.length - 1;
        const isFirstStep = passoAtual === 0;

        tooltip.innerHTML = `
            <h3>${passo.titulo}</h3>
            <p>${passo.descricao}</p>
            <div class="tutorial-footer">
                <div class="tutorial-dots">
                    ${dotsHTML}
                </div>
                <div class="tutorial-btns">
                    ${!isFirstStep ? `<button class="btn-tutorial btn-tutorial-sec" onclick="voltarPasso()">Voltar</button>` : ''}
                    <button class="btn-tutorial btn-tutorial-prim" onclick="proximoPasso()">
                        ${isLastStep ? 'Começar! 🔑' : 'Avançar'}
                    </button>
                </div>
            </div>
        `;

        // Posicionar tooltip
        posicionarTooltip(targetEl, passo.posicao);
        tooltip.classList.add('active');
    }, 150);
}

// Posiciona o balão de ajuda com base no alvo e na posição desejada
function posicionarTooltip(targetEl, posicao) {
    const tooltip = document.getElementById('tutorial-tooltip');
    const gameContainer = document.getElementById('game-container');
    const containerRect = gameContainer.getBoundingClientRect();

    // Reset de estilos de posicionamento
    tooltip.style.left = '';
    tooltip.style.top = '';
    tooltip.style.bottom = '';
    tooltip.style.right = '';
    tooltip.style.transform = '';

    if (!targetEl || posicao === 'centro') {
        // Centralizado na tela do jogo
        tooltip.style.left = '50%';
        tooltip.style.top = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        return;
    }

    const targetRect = targetEl.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top;
    const targetLeft = targetRect.left - containerRect.left;

    const tooltipWidth = tooltip.offsetWidth || 320;

    if (posicao === 'abaixo') {
        tooltip.style.left = `${targetLeft + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
        tooltip.style.top = `${targetTop + targetRect.height + 15}px`;
    } else if (posicao === 'acima') {
        tooltip.style.left = `${targetLeft + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
        tooltip.style.top = `${targetTop - tooltip.offsetHeight - 145}px`; // Ajuste com margem de segurança
    } else if (posicao === 'centro-interno') {
        tooltip.style.left = `${targetLeft + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
        tooltip.style.top = `${targetTop + (targetRect.height / 2) - 80}px`;
    }

    // Ajustes de limites (não deixar sair das bordas do container)
    let leftVal = parseFloat(tooltip.style.left);
    if (leftVal < 15) {
        tooltip.style.left = '15px';
    } else if (leftVal + tooltipWidth > containerRect.width - 15) {
        tooltip.style.left = `${containerRect.width - tooltipWidth - 15}px`;
    }
}

// Avança para o próximo passo ou encerra o tutorial
function proximoPasso() {
    if (passoAtual < passosTutorial.length - 1) {
        mostrarPasso(passoAtual + 1);
    } else {
        encerrarTutorial();
    }
}

// Retorna ao passo anterior
function voltarPasso() {
    if (passoAtual > 0) {
        mostrarPasso(passoAtual - 1);
    }
}

// Encerra e limpa o tutorial
function encerrarTutorial() {
    tutorialAtivo = false;

    const overlay = document.getElementById('tutorial-overlay');
    const highlightBox = document.getElementById('tutorial-highlight-box');
    const tooltip = document.getElementById('tutorial-tooltip');

    if (overlay) overlay.classList.remove('active');
    if (highlightBox) highlightBox.style.display = 'none';
    if (tooltip) tooltip.classList.remove('active');

    // Restaurar estado do jogo
    if (tutorialOrigemStartScreen) {
        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.classList.remove('hidden');
    } else {
        // Retomar cronômetro do jogo
        retomarCronometroJogo();
    }
}

// Função para retomar o cronômetro do jogo mantendo os segundos restantes
function retomarCronometroJogo() {
    if (typeof timerInterval !== 'undefined') {
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            tempoRestante--;
            if (typeof atualizarTimerUI === 'function') {
                atualizarTimerUI();
            } else {
                const timerEl = document.getElementById('timer');
                if (timerEl) timerEl.innerHTML = `⏳ ${tempoRestante}s`;
            }
            
            if (tempoRestante <= 0) {
                clearInterval(timerInterval);
                if (typeof gameOver === 'function') {
                    gameOver(false);
                }
            }
        }, 1000);
    }
}
