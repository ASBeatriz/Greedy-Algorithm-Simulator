const botao = document.getElementById("botaoSai");
const filaContainer = document.getElementById("fila-container");

function removerPessoa() {
    const pessoas = filaContainer.querySelectorAll(".pessoa");

    if (pessoas.length > 0) {
        // Remove a primeira pessoa
        const primeira = pessoas[0];
        primeira.style.opacity = "0";
        primeira.style.transform = "translateY(-20px)";

        // Espera a animação e depois remove do DOM
        setTimeout(() => {
            primeira.remove();
        }, 400);
    } else {
        alert("A fila está vazia!");
    }
};


botao.addEventListener("click", removerPessoa)


