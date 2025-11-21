const botaoIniciar0 = document.getElementById("botao-iniciar0");
const botaoIniciar1 = document.getElementById("botao-iniciar1");
const botaoProx = document.getElementById("botao-proximo");
const botaoReiniciar = document.getElementById("botao-reiniciar");
const botoesEscolher = document.querySelectorAll('.botao-escolha');
const filas = document.getElementsByClassName("fila");
const telaInicio = document.getElementById("tela-inicio")
const telaInteracao = document.getElementById("interacao")
const telaMenu = document.getElementById("menu")
const telaFim = document.getElementById("tela-fim")

const QTDE_FILAS = 4
const FRAME_MAX = 10
const TEMPO_MANUTENCAO = 3
var tipo = 0                // tipo de cenário (0 = funciona, 1 = não funciona)
var frame = -1;

// Array de booleano para indicar se o próximo tempo de retirada de uma fila deve ser calculado ou não (com base no cliente da frente)
var atualizaTempo = [1,1,1,1]

/* 
Duas configurações para cada variável: dois cenários diferentes.
Cenário 0 -> monta o cenário que o alogitmo funciona.
Cenário 1 -> monta o cenário que o alogitmo NÃO funciona.
*/

const TEMPO_MIN = [6, 4]     // tempo mínimo pra terminar o jogo

// configuração de clientes inicial
const configInicial = [[[3, 3, 2],
                       [1, 2, 2, 3],
                       [1, 1],
                       [2, 3]],
                    
                        [[3],
                        [1,2],
                        [1,1,1],
                        [2]]]

                       
//                 tempo ------------------------------>
// conteúdo binário
var filaAndar =  [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f1
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f2
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f3
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]    // f4

// conteúdo = tipo do cliente adicionado
const filaAumentar = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // f1
                      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f2
                      [0, 0, 0, 2, 0, 0, 0, 0, 0, 0],    // f3
                      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],   // f4
                    
                    [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // f1
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f2
                    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f3
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]]]   // f4

// conteúdo = -1 para quebrar, 0 para manter (e 1 para arrumar, mas é colocado dinamicamente)
var caixaEstado =   [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // f1
                     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],     // f2
                     [0, -1, 0, 0, 0, 0, 0, 0, 0, 0],    // f3
                     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],    // f4
                    
                    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],     // f1
                     [0, 0, 0, -1, 0, 0, 0, 0, 0, 0],    // f2
                     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],     // f3
                     [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0]]]   // f4


// situação atual dos caixas (1 = ok, 0 = quebrado)
var caixaAtual = [1,1,1,1]

function fimDeJogo(){
    telaFim.classList.remove("invisible")
    telaFim.querySelector("p span").textContent = frame+1
    telaFim.querySelector("#tempo-min").textContent = TEMPO_MIN[tipo]
}

function reiniciar(){
    window.location.reload();
}

function removerPessoa(filaId) {
    // Se ainda não chegou a hora de remover, ignora
    if(!filaAndar[filaId][frame]) return;

    const pessoas = filas[filaId].querySelectorAll(".pessoa");

    if (pessoas.length > 0) {
        // Remove a primeira pessoa
        const primeira = pessoas[0];
        primeira.style.opacity = "0";
        primeira.style.transform = "translateY(-20px)";

        // Espera a animação e depois remove do DOM
        setTimeout(() => {
            primeira.remove();
        }, 400);

        // Detecta fim de jogo
        if(primeira.className.includes('player'))   
            fimDeJogo()
        
        // sinaliza que o tempo da próxima pessoa sair precisa ser atualizado
        atualizaTempo[filaId] = 1
    }
};

// função auxiliar para retornar a classe da pessoa de acordo com um índice
function __tipoPessoa(num){
    if(num == 1) return 'pouco'
    if(num == 2) return 'medio'
    if(num == 3) return 'muito'
    if(num == 4) return 'player'
}

// Função auxiliar para adicionar uma div de pessoa no html
function __inserirPessoa(tipoNum, filaId){
    const pessoa = document.createElement('div');
    pessoa.classList.add('pessoa');
    pessoa.classList.add(__tipoPessoa(tipoNum));
    
    filas[filaId].insertBefore(pessoa, filas[filaId].querySelector('.botao-escolha'));

    // Se for a primeira pessoa, precisa setar um tempo de saída
    const fila = document.querySelectorAll(".fila")[filaId]
    if(fila.querySelectorAll(".pessoa").length == 1)
        atualizaTempo[filaId] = 1; 
}

function addPessoa(filaId){
    const tipoNum = filaAumentar[tipo][filaId][frame]
    if(tipoNum == 0) return

    // Adiciona uma pessoa na fila
    __inserirPessoa(tipoNum, filaId)
}

function quebrarCaixa(filaId){
    const caixa = filas[filaId].querySelector('.caixa')
    caixa.style.backgroundImage = "url(img/caixaQuebrado.jpg)"
    if (frame+2 >= FRAME_MAX) return;
    caixaEstado[tipo][filaId][frame + TEMPO_MANUTENCAO] = 1;

    // zera a expectativa do caixa andar
    filaAndar[filaId] = Array(FRAME_MAX).fill(0)
    caixaAtual[filaId] = 0;
    console.log("zereei")
}

function consertarCaixa(filaId){
    const caixa = filas[filaId].querySelector('.caixa')
    caixa.style.backgroundImage = "url(img/caixa.jpg)"

    atualizaTempo[filaId] = 1
    caixaAtual[filaId] = 1;
}

function posicionarPlayer(thisButton){
    parent = thisButton.parentElement

    // Remove o player já adicionado em outra fila
    document.querySelectorAll('.pessoa.player').forEach(el => el.remove());
    
    const filaId = Array.from(parent.parentNode.children).indexOf(parent);

    // Adiciona o player na fila
    __inserirPessoa(4, filaId)

    // Para o caso em que o player foi adicionado como primeiro da fila e precisa atualizar o tempo de saída relativo ao frame atual
    atualizarTemposSaida()
}

// Função para decidir o estado de um caixa em cada frame, de acordo com os índices em caixaEstado[tipo]
function operaCaixa(filaId){
    if(caixaEstado[tipo][filaId][frame] == 0) return;
    else if (caixaEstado[tipo][filaId][frame] == -1)
        quebrarCaixa(filaId)
    else
        consertarCaixa(filaId)
}

// Função para atualizar o próximo frame (tempo) em que as filas vão andar
function atualizarTemposSaida(){
    for (let index = 0; index < QTDE_FILAS; index++) {
        if(atualizaTempo[index]){
            if(!caixaAtual[index]) continue

            const fila = document.querySelectorAll(".fila")[index]
            if(fila.querySelectorAll(".pessoa").length == 0) continue
            
            const primeira = fila.querySelectorAll(".pessoa")[0]
            if((primeira.className).includes("pouco") || (primeira.className).includes("player"))
                offset = 1
            else if((primeira.className).includes("medio"))
                offset = 2
            else
                offset = 3
            
            if(frame + offset >= FRAME_MAX) continue;
            // atualiza
            filaAndar[index][frame+offset] = 1

            
        }
    }   
    // zera as flags
    atualizaTempo = [0,0,0,0]
}

// Função principal da simulação
function proximoFrame(){
    // Impede que o botão seja apertado antes que as animações acabem, evitando bugs
    botaoProx.style.pointerEvents = "none"
    
    frame++;
    if(frame == FRAME_MAX) return

    for (let index = 0; index < QTDE_FILAS; index++){
        addPessoa(index)
        removerPessoa(index)
        operaCaixa(index)
    }
    
    // Espera o tempo da animação antes de atualizar tempos
    setTimeout(() => {
        atualizarTemposSaida()
        botaoProx.style.pointerEvents = "all"
    }, 400)

    imprimeTempo()
}

function imprimeTempo(){
    document.querySelector("#clock span").textContent = frame+1;
}

function init(type){
    tipo = type
    telaInicio.classList.add("invisible")
    telaInteracao.classList.remove("invisible")
    telaMenu.classList.remove("invisible")


    for (let index = 0; index < QTDE_FILAS; index++) {
        configInicial[tipo][index].forEach(tipo => __inserirPessoa(tipo, index))
    }
    atualizarTemposSaida()

    imprimeTempo()
}

// Associa as funçãos para cada botão
botaoIniciar0.addEventListener("click", () => {init(0)})
botaoIniciar1.addEventListener("click", () => {init(1)})

botaoProx.addEventListener("click", proximoFrame)

botaoReiniciar.addEventListener("click", reiniciar)

botoesEscolher.forEach(botao => {
    botao.addEventListener('click', () => {posicionarPlayer(botao)} );
});
