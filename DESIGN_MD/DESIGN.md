# Diretrizes de Design - Série de Jogos Numerandus

Este documento estabelece o padrão visual, de design e de experiência do usuário (UX) para a **série de jogos educativos Numerandus**, garantindo consistência visual, acessibilidade e uma experiência lúdica e engajadora voltada para alunos do 2º ano do Ensino Fundamental.

---

## 🎨 1. Identidade Visual e Paleta de Cores

Os jogos do projeto Numerandus utilizam uma paleta de cores vibrantes e contrastantes, essencial para manter a atenção do público infantil e apoiar a distinção conceitual e pedagógica dos conteúdos de matemática.

### 1.1 Cores Padrão do Sistema (Tema Geral)
Estes são os tons que unificam a interface de todos os jogos:

*   **Fundo Geral da Aplicação:** `#F0F8FF` (Azul bebê suave) | `--bg-primary`
*   **Fundo dos Cartões/Módulos:** `#FFFFFF` | `--bg-card`
*   **Texto Principal:** `#333333` | `--text-main`
*   **Texto Secundário / Destaques:** `#2C3E50` | `--text-muted`
*   **Cor Clássica de Elementos de Madeira:** `#4A2311` (Tom de madeira natural para cubos/blocos) | `--wood-color`

### 1.2 Código de Cores Pedagógico (Exemplo: CDU)
Para jogos que envolvem ordens posicionais (Centenas, Dezenas, Unidades), o código de cores abaixo deve ser rigorosamente seguido:



## font 2. Tipografia

Para garantir legibilidade para crianças em fase de alfabetização e manter o tom amigável e descontraído da plataforma, a tipografia segue um padrão geométrico e arredondado:

*   **Fonte Principal:** `'Fredoka'`, importada do Google Fonts.
*   **Fallback:** `'Segoe UI'`, Tahoma, Geneva, Verdana, sans-serif.
*   **Estilos de Peso e Hierarquia:**
    *   **Títulos de Destaque / Overlays:** `font-weight: 800` (Extra Bold)
    *   **Textos de Botões e Interfaces Ativas:** `font-weight: 700` (Bold)
    *   **Descrições, Subtítulos e Dicas:** `font-weight: 500` (Medium)

---

## 📐 3. Layout e Estrutura de Telas

Cada jogo da suíte Numerandus deve ser autocontido em um contêiner central com proporções padronizadas, reduzindo a fadiga visual e garantindo uma apresentação ideal em telas de tablets escolares e desktops.

### 3.1 O Container do Jogo (`.container`)
*   **Largura Máxima:** `950px`
*   **Altura Fixa do Jogo:** `660px`
*   **Bordas:** Arredondadas com `40px` (estilo cartoon/infantil).
*   **Estilos visuais:** Fundo semi-transparente para mesclar com o background dinâmico (`rgba(200, 226, 250, 0.87)`), sombra projetada suave (`box-shadow: 0 20px 40px rgba(0,0,0,0.2)`) e borda leve (`1.5px solid rgba(0,0,0,0.15)`).

### 3.2 Componentes e Áreas Compartilhadas

#### A. Cabeçalho de Pontuação e Turnos (`.placar-header`)
*   Deve conter duas seções laterais de placar (`.placar-lado`) e uma central para mensagens rápidas (`#status`).
*   **Feedback de Turno Ativo:** O lado do jogador ativo deve ter opacidade total (`1`), escala de destaque (`scale(1.03)`) e fundo destacado. O oponente inativo deve permanecer esmaecido (`opacity: 0.55`).

#### B. Área de Interação Principal (`main`)
*   Espaço destinado ao conteúdo interativo central do jogo (ex: pratos, copos, balanças, tabuleiros, etc.).
*   Os elementos interativos devem possuir transições suaves de escala (`transform: scale(1.05)`) no estado `:hover` para indicar claramente aos alunos onde clicar.

#### C. Seção de Entrada e Confirmação (`.controles` / `#secao-resposta`)
*   Área centralizada de input numérico ou caixas de seleção.
*   **Input padrão:** Centralizado, com fontes grandes (mínimo `15px` a `18px`), placeholder instrutivo claro, e bordas arredondadas com destaque de foco colorido (`--bg-primary` ou cor principal do jogo).

#### D. Telas de Transição e Overlays (`.overlay`)
Todos os jogos devem utilizar overlays consistentes com desfoque de fundo (`backdrop-filter: blur(8px)`) e cartões centralizados contendo:
*   **Tela Inicial:** Logotipo do jogo, campo de entrada de nome e botão grande de início.
*   **Tela de Fim de Jogo / Vitória:** Mensagem parabenizando o vencedor, placar de encerramento em destaque e botão de reinício.
*   **Tela de Tempo Esgotado:** Animação de relógio, mensagem explicativa e botão de continuação rápida.

---

## ⚡ 4. Animações e Micro-interações Padrão

O dinamismo visual é fundamental para manter os alunos motivados e transmitir clareza sobre o andamento das ações:

1.  **Queda / Aparecimento de Objetos (`cairDoAlto`):**
    Qualquer bloco, cubinho ou ficha lançado na tela deve cair do topo com física elástica (efeito de rebote).
    ```css
    animation: cairDoAlto 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    ```
2.  **Feedback de Erro em Respostas (`shakeInput`):**
    Inputs ou elementos que contenham respostas inválidas devem pulsar em vermelho e tremer horizontalmente.
3.  **Alerta de Urgência de Tempo (`timerPulsar`):**
    O cronômetro do jogo deve pulsar levemente e mudar a cor para vermelho quando faltarem menos de 5 segundos para expirar o limite.
4.  **Objetos Flutuantes (`trofeuFlutuar` / `jogo-icon`):**
    Elementos decorativos e de recompensa (como troféus e insígnias) devem realizar um movimento suave e contínuo de oscilação vertical.

---

## 📱 5. Responsividade e Adaptação Móvel

Os jogos do Numerandus devem ser totalmente jogáveis em smartphones na orientação vertical ou horizontal:
*   **Disposição de Controles:** Componentes inline (como inputs ao lado de botões) devem se empilhar verticalmente em telas com largura menor que `600px`.
*   **Dimensões Flexíveis:** Utilizar a unidade de medida `clamp()` para fontes, margens e tamanhos de componentes, permitindo que a interface encolha graciosamente em telas pequenas.
*   **Preenchimento de Tela:** Garantir que o contêiner e os overlays ocupem a altura total do dispositivo móvel (`height: 100dvh`).
