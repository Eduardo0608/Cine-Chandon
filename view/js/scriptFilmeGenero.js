const base = "http://localhost/pasta/webservice/controller";
let filmesGeneros = [];

async function carregarFilmesGeneros() {
    try {
        let resultado = await fetch(`${base}/filme_genero.php`);
        if (!resultado.ok) {
            throw new Error(`Erro na resposta: ${resultado.status}`);
        }
        
        filmesGeneros = await resultado.json();
        if (!filmesGeneros.valid) {
            throw new Error(filmesGeneros.message || "Erro desconhecido ao carregar os dados.");
        }

        const tbody = document.querySelector("#listaFilmes tbody");
        tbody.innerHTML = "";

        filmesGeneros.data.forEach(relacionamento => {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${relacionamento.titulo}</td><td>${relacionamento.genero}</td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar filmes e gêneros:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const listaFilmes = document.getElementById("listaFilmes");
    listaFilmes.style.display = "block";
    await carregarFilmesGeneros();
});
