const base = "http://localhost/pasta/webservice/controller";
let sessoes = [];

function esconderCampos() {
    document.getElementById("formCadastrar").style.display = "none";
    document.getElementById("formEditarSessao").style.display = "none";
    document.getElementById("listaSessoes").style.display = "none";
}

async function carregarFilmesDropdown(selectId) {
    try {
        const response = await fetch(`${base}/filme.php`);
        const filmes = await response.json();

        const dropdown = document.getElementById(selectId);
        dropdown.innerHTML = '<option value="">Selecione um filme</option>';

        filmes.data.forEach(filme => {
            const option = document.createElement("option");
            option.value = filme.id_filme;
            option.textContent = filme.titulo;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        Swal.fire("Erro", "Não foi possível carregar os filmes!", "error");
    }
}

async function listarSessoes() {
    esconderCampos();
    const listaSessoes = document.getElementById("listaSessoes");
    listaSessoes.style.display = "block";
    const tbody = listaSessoes.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        const resultado = await fetch(`${base}/sessao.php`);
        const json     = await resultado.json();
        sessoes  = json.data;

        const user = JSON.parse(localStorage.getItem("user"));
        const isLoggedIn = Boolean(user);

        document.querySelectorAll("th.col-acao").forEach(th => {
            th.style.display = isLoggedIn ? "table-cell" : "none";
        });

        sessoes.forEach(sessao => {
            const d = new Date(sessao.horario);
            const horarioFormatado = d.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const acoes = isLoggedIn
              ? `<td class="col-acao">
                    <button class="btn btn-warning btn-sm btnEditarSessao" data-id="${sessao.id_sessao}">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm btnExcluirSessao" data-id="${sessao.id_sessao}">
                        Excluir
                    </button>
                </td>`
              : "";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${sessao.nome_filme}</td>
                <td>${horarioFormatado}</td>
                <td>${sessao.ingressos_disponiveis}</td>
                <td>${sessao.quantidade_maxima_ingressos}</td>
                ${acoes}
            `;
            tbody.appendChild(tr);
        });

        if (isLoggedIn) {
            document.querySelectorAll('.btnExcluirSessao').forEach(button => {
                button.addEventListener('click', () => {
                    excluirSessao(button.getAttribute('data-id'));
                });
            });
            document.querySelectorAll('.btnEditarSessao').forEach(button => {
                button.addEventListener('click', () => {
                    carregarFormularioEdicao(button.getAttribute('data-id'));
                });
            });
        }

    } catch (error) {
        console.error("Erro ao listar sessões:", error);
        Swal.fire("Erro", "Não foi possível carregar as sessões!", "error");
    }
}

async function carregarFormularioEdicao(idSessao) {
    try {
        let resultado = await fetch(`${base}/sessao.php?id=${idSessao}`);
        const sessao = await resultado.json();

        if (!sessao || !sessao.data) {
            Swal.fire("Erro", "Sessão não encontrada!", "error");
            return;
        }

        esconderCampos();
        document.getElementById("formEditarSessao").style.display = "block";

        await carregarFilmesDropdown("editFilme");
        document.getElementById("editFilme").value = sessao.data.id_filme;

        document.getElementById("editId").textContent = idSessao;
        document.getElementById("editHorario").value = sessao.data.horario;
        document.getElementById("editIngressosDisponiveis").value = sessao.data.ingressos_disponiveis;
        document.getElementById("editQuantidadeMaxima").value = sessao.data.quantidade_maxima_ingressos;
    } catch (error) {
        console.error("Erro ao buscar sessão:", error);
        Swal.fire("Erro", "Erro ao carregar os dados da sessão!", "error");
    }
}

async function excluirSessao(idSessao) {
    const confirmacao = await Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá desfazer esta ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar"
    });

    if (confirmacao.isConfirmed) {
        try {
            const response = await fetch(`${base}/sessao.php?id=${idSessao}`, {
                method: "DELETE"
            });
            const result = await response.json();

            if (result.valid) {
                Swal.fire("Excluído!", "A sessão foi excluída com sucesso.", "success");
                listarSessoes();
            } else {
                Swal.fire("Erro", result.message || "Não foi possível excluir a sessão.", "error");
            }
        } catch (error) {
            console.error("Erro ao excluir sessão:", error);
            Swal.fire("Erro", "Erro ao tentar excluir a sessão!", "error");
        }
    }
}

document.getElementById("btnCadastrar").addEventListener("click", () => {
    esconderCampos();
    carregarFilmesDropdown("id_filme");
    document.getElementById("formCadastrar").style.display = "block";
});

document.getElementById("formCadastrar").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);

    dados.horario = formatarHorario(dados.horario);

    try {
        const response = await fetch(`${base}/sessao.php`, {
            method: "POST",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao cadastrar sessão:", errorData);
            Swal.fire("Erro", `Erro ao cadastrar sessão: ${errorData.msg}`, "error");
            return;
        }

        Swal.fire("Sucesso", "Sessão cadastrada com sucesso!", "success");
        document.getElementById("formCadastrar").reset();
        listarSessoes();
    } catch (error) {
        console.error("Erro ao cadastrar sessão:", error);
        Swal.fire("Erro", "Erro ao tentar cadastrar a sessão!", "error");
    }
});

document.getElementById("formEditarSessao").addEventListener("submit", async (event) => {
    event.preventDefault();

    const idSessao = document.getElementById("editId").textContent;
    const dados = {
        id_sessao: idSessao,
        id_filme: document.getElementById("editFilme").value,
        horario: formatarHorario(document.getElementById("editHorario").value),
        ingressos_disponiveis: document.getElementById("editIngressosDisponiveis").value,
        quantidade_maxima_ingressos: document.getElementById("editQuantidadeMaxima").value,
    };

    try {
        const response = await fetch(`${base}/sessao.php`, {
            method: "PUT",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire("Erro", `Erro ao atualizar sessão: ${errorData.message}`, "error");
            return;
        }

        Swal.fire("Sucesso", "Sessão atualizada com sucesso!", "success");
        listarSessoes();
    } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
        Swal.fire("Erro", "Erro ao tentar atualizar a sessão!", "error");
    }
});

function formatarHorario(horario) {
    const dataLocal = new Date(horario);
    dataLocal.setHours(dataLocal.getHours() - 3);
    return dataLocal.toISOString().slice(0, 19).replace('T', ' ');
}

document.getElementById("btnCancelarCadastro").addEventListener("click", () => {
    document.getElementById("formCadastrar").reset();
    esconderCampos();
    listarSessoes();
});

document.getElementById("btnCancelarEdicao").addEventListener("click", () => {
    document.getElementById("formEditarSessao").reset();
    esconderCampos();
    listarSessoes();
});

document.addEventListener("DOMContentLoaded", () => {
    listarSessoes();
    checkAccessRestrictions();
});
