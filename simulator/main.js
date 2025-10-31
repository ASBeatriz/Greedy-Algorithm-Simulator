const botaoProx = document.getElementById("botao-proximo");
const botoesEscolher = document.querySelectorAll('.botao-escolha');
const filas = document.getElementsByClassName("fila");

const FRAMEMAX = 4
const filaAndar = [[1],[],[2],[3,4]]
const filaAumentar = [[1, 2],[3],[],[3,4]]
const caixaQuebrar = [[1],[],[],[]]
var caixaConsertar = [[],[],[],[]]
var frame = 0;


function removerPessoa(filaId) {
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
    }
};

function addPessoa(filaId){
    // Adiciona uma pessoa na fila
    const pessoa = document.createElement('div');
    pessoa.classList.add('pessoa');
    pessoa.innerText = Math.floor(Math.random() * 10);  
    
    filas[filaId].insertBefore(pessoa, filas[filaId].querySelector('.botao-escolha'));
}

function quebraCaixa(filaId){
    const caixa = filas[filaId].querySelector('.caixa')
    caixa.style.backgroundColor = 'red'
    if (frame+2 > FRAMEMAX) return;
    caixaConsertar[frame + 2].push(filaId);
}

function consertaCaixa(filaId){
    const caixa = filas[filaId].querySelector('.caixa')
    caixa.style.backgroundColor = 'green'
}

function posicionarPlayer(thisButton){
    parent = thisButton.parentElement

    // Remove o player já adicionado em outra fila
    document.querySelectorAll('.pessoa.player').forEach(el => el.remove());

    // Adiciona o player na fila
    const player = document.createElement('div');
    player.classList.add('pessoa', 'player');
    player.innerText = 'player';     
    parent.insertBefore(player, thisButton);
}

function proximoFrame(){
    filaAndar[frame].forEach(id => removerPessoa(id-1));
    filaAumentar[frame].forEach(id => addPessoa(id-1));
    caixaQuebrar[frame].forEach(id => quebraCaixa(id-1));
    // caixaConsertar[frame].forEach(id => consertaCaixa(id-1));    // ARRUMAR ISSO

    frame++;
}

botaoProx.addEventListener("click", proximoFrame)

// Associa a função a cada botão
botoesEscolher.forEach(botao => {
    botao.addEventListener('click', () => {posicionarPlayer(botao)} );
});
