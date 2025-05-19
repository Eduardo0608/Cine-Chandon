const base = "http://localhost/pasta/webservice/controller";
let filmes = [];
let generos = [];

async function carregarGeneros() {
    try {
        let resultado = await fetch(`${base}/genero.php`);
        generos = await resultado.json();

        // identifica o ID do "Sem Gênero"
        let semGeneroId = null;
        generos.data.forEach(g => {
            const nomeLower = g.nome.toLowerCase();
            if (nomeLower === "sem gênero" || nomeLower === "sem genero") {
                semGeneroId = g.id_genero;
            }
        });

        // formulário de cadastro
        const checkboxContainer = document.getElementById("checkboxGeneros");
        checkboxContainer.innerHTML = '';
        generos.data.forEach(genero => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = genero.id_genero;
            checkbox.id = `genero_${genero.id_genero}`;
            checkbox.name = "generos[]";

            // marca "Sem Gênero" por padrão
            if (genero.id_genero === semGeneroId) {
                checkbox.checked = true;
            }

            // se for "Sem Gênero", ao marcar desmarca todos os outros
            if (genero.id_genero === semGeneroId) {
                checkbox.addEventListener("change", () => {
                    if (checkbox.checked) {
                        generos.data.forEach(g2 => {
                            if (g2.id_genero !== semGeneroId) {
                                const otherCb = document.getElementById(`genero_${g2.id_genero}`);
                                if (otherCb) otherCb.checked = false;
                            }
                        });
                    }
                });
            } 
            // se for qualquer outro, ao marcar desmarca o "Sem Gênero"
            else {
                checkbox.addEventListener("change", () => {
                    if (checkbox.checked) {
                        const semCb = document.getElementById(`genero_${semGeneroId}`);
                        if (semCb) semCb.checked = false;
                    }
                });
            }

            let label = document.createElement("label");
            label.htmlFor = `genero_${genero.id_genero}`;
            label.textContent = genero.nome;

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxContainer.appendChild(document.createElement("br"));
        });

        // formulário de edição (sem alteração no comportamento)
        const checkboxEditarContainer = document.getElementById("checkboxGenerosEditar");
        checkboxEditarContainer.innerHTML = '';
        generos.data.forEach(genero => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = genero.id_genero;
            checkbox.id = `generoEditar_${genero.id_genero}`;
            checkbox.name = "generos[]";

            let label = document.createElement("label");
            label.htmlFor = `generoEditar_${genero.id_genero}`;
            label.textContent = genero.nome;

            checkboxEditarContainer.appendChild(checkbox);
            checkboxEditarContainer.appendChild(label);
            checkboxEditarContainer.appendChild(document.createElement("br"));
        });
    } catch (error) {
        console.error("Erro ao carregar gêneros:", error);
    }
        configurarValidacaoGenero("formCadastrar");
        configurarValidacaoGenero("formEditarFilme"); // agora sim após gerar os elementos
}

function configurarValidacaoGenero(formId) {
    const form = document.getElementById(formId);
    const grupoCheckbox = form.querySelectorAll("input[name='generos[]']");

    // Impede envio do formulário se nenhum gênero estiver marcado
    form.addEventListener("submit", (e) => {
        const algumSelecionado = Array.from(grupoCheckbox).some(cb => cb.checked);
        if (!algumSelecionado) {
            e.preventDefault();
            Swal.fire("Atenção", "Selecione pelo menos um gênero para o filme.", "warning");
        }
    });

    // Lógica para desmarcar "Sem Gênero" ao escolher outro
    grupoCheckbox.forEach(cb => {
        cb.addEventListener("change", () => {
            if (cb.checked && cb.labels[0].textContent !== "Sem Gênero") {
                grupoCheckbox.forEach(outro => {
                    if (outro.labels[0].textContent === "Sem Gênero") {
                        outro.checked = false;
                    }
                });
            }
        });
    });
}


async function listarFilmes() {
    const listaFilmes = document.getElementById("listaFilmes");
    const tbody = listaFilmes.querySelector("tbody");

    try {
        let resultado = await fetch(`${base}/filme.php`);
        filmes = await resultado.json();

        if (filmes.data && filmes.data.length > 0) {
            tbody.innerHTML = '';
            filmes.data.forEach(filme => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${filme.titulo}</td>
                    <td>${filme.sinopse}</td>
                    <td>${new Date(filme.data_lancamento).toLocaleDateString("pt-BR")}</td>
                    <td>${filme.duracao}</td>
                    <td>${new Date(filme.data_cadastro).toLocaleDateString("pt-BR")}</td>
                    <td class="col-acao" style="display: none;">
                        <button class="btn btn-warning btn-sm btnEditarFilme" data-id="${filme.id_filme}">Editar</button>
                        <button class="btn btn-danger btn-sm btnExcluirFilme" data-id="${filme.id_filme}">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll(".btnEditarFilme")
                .forEach(button => button.addEventListener("click", () => carregarFormularioEdicao(button.dataset.id)));
            document.querySelectorAll(".btnExcluirFilme")
                .forEach(button => button.addEventListener("click", () => excluirFilme(button.dataset.id)));

            listaFilmes.style.display = "block";
        } else {
            tbody.innerHTML = "<tr><td colspan='6' class='text-center'>Nenhum filme cadastrado</td></tr>";
            listaFilmes.style.display = "block";
        }

        checkAccessRestrictions();
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
    }
}

function alternarExibicao({ tabela = false, cadastro = false, edicao = false }) {
    document.getElementById("listaFilmes").style.display = tabela ? "block" : "none";
    document.getElementById("formCadastrar").style.display = cadastro ? "block" : "none";
    document.getElementById("formEditarFilme").style.display = edicao ? "block" : "none";
}

async function carregarFormularioEdicao(idFilme) {
    try {
        let resultado = await fetch(`${base}/filme.php?id=${idFilme}`);
        const filme = await resultado.json();

        if (!filme || !filme.data) {
            Swal.fire("Erro", "Filme não encontrado!", "warning");
            return;
        }

        alternarExibicao({ edicao: true });

        document.getElementById("editId").textContent = idFilme;
        document.querySelector("#formEditarFilme input[name='titulo']").value = filme.data.titulo;
        document.querySelector("#formEditarFilme input[name='duracao']").value = filme.data.duracao;
        document.querySelector("#formEditarFilme textarea[name='sinopse']").value = filme.data.sinopse;
        document.querySelector("#formEditarFilme input[name='data_lancamento']").value = filme.data.data_lancamento;

        const checkboxesEditar = document.querySelectorAll('#checkboxGenerosEditar input[type="checkbox"]');
        checkboxesEditar.forEach(checkbox => {
            checkbox.checked = filme.data.generos.includes(Number(checkbox.value));
        });
    } catch (error) {
        console.error("Erro ao carregar formulário de edição:", error);
    }
}

document.getElementById("formEditarFilme").addEventListener("submit", async (event) => {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('#checkboxGenerosEditar input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Atenção",
            text: "Selecione pelo menos um gênero para editar o filme."
        });
        return;
    }

    const idFilme = document.getElementById("editId").textContent;
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    dados.id_filme = idFilme;

    const generosSelecionados = [];
    checkboxes.forEach(checkbox => generosSelecionados.push(checkbox.value));
    dados.generos = generosSelecionados;

    try {
        const response = await fetch(`${base}/filme.php`, {
            method: "PUT",
            body: JSON.stringify(dados),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire("Erro", `Erro ao editar filme: ${errorData.message}`, "error");
            return;
        }

        Swal.fire("Sucesso", "Filme editado com sucesso!", "success");
        listarFilmes();
        alternarExibicao({ tabela: true });
    } catch (error) {
        console.error("Erro ao editar filme:", error);
        Swal.fire("Erro", "Erro ao tentar editar o filme!", "error");
    }
});


async function excluirFilme(idFilme) {
    const confirmDelete = await Swal.fire({
        title: "Tem certeza?",
        text: "Você tem certeza que quer excluir esse filme?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Não",
    });
    if (!confirmDelete.isConfirmed) return;

    try {
        const response = await fetch(`${base}/filme.php?id=${idFilme}`, { method: "DELETE" });
        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire("Erro", `Erro ao excluir filme: ${errorData.msg}`, "error");
            return;
        }
        Swal.fire("Sucesso", "Filme excluído com sucesso!", "success");
        listarFilmes();
    } catch (error) {
        console.error("Erro ao excluir filme:", error);
        Swal.fire("Erro", "Não foi possível excluir o filme!", "error");
    }
};

document.getElementById("formCadastrar").addEventListener("submit", async (event) => {
    // valida se há ao menos um gênero marcado
    const selecionados = document.querySelectorAll('#checkboxGeneros input[type="checkbox"]:checked');
    if (selecionados.length === 0) {
        event.preventDefault();
        Swal.fire({
            icon: "warning",
            title: "Atenção",
            text: "Selecione pelo menos um gênero para cadastrar o filme."
        });
        return;
    }

    // envio do cadastro
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    const generosSelecionados = [];
    selecionados.forEach(checkbox => generosSelecionados.push(checkbox.value));
    dados.generos = generosSelecionados;

    try {
        const response = await fetch(`${base}/filme.php`, {
            method: "POST",
            body: JSON.stringify(dados),
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire("Erro", `Erro ao cadastrar filme: ${errorData.message}`, "error");
            return;
        }
        Swal.fire("Sucesso", "Filme cadastrado com sucesso!", "success");
        listarFilmes();
        alternarExibicao({ tabela: true });
    } catch (error) {
        console.error("Erro ao cadastrar filme:", error);
        Swal.fire("Erro", "Erro ao tentar cadastrar o filme!", "error");
    }
});

document.getElementById("btnCadastrar").addEventListener("click", () =>
    alternarExibicao({ cadastro: true })
);
document.getElementById("btnCancelarCadastro").addEventListener("click", () =>
    alternarExibicao({ tabela: true })
);
document.getElementById("btnCancelarEdicao").addEventListener("click", () =>
    alternarExibicao({ tabela: true })
);

document.addEventListener("DOMContentLoaded", async () => {
    await carregarGeneros();
    await listarFilmes();
});
