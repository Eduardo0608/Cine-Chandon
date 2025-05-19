const base = "http://localhost/pasta/webservice/controller";
let generos = [];

function esconderCampos() {
    document.getElementById("listaGeneros").style.display = "none";
    document.getElementById("formCadastrar").style.display = "none";
    document.getElementById("formEditarGenero").style.display = "none";
}

async function listarGeneros() {
    esconderCampos();
    const listaGeneros = document.getElementById("listaGeneros");
    listaGeneros.style.display = "block";
    const tbody = listaGeneros.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        let resultado = await fetch(`${base}/genero.php`);
        generos = await resultado.json();

        generos.data.forEach(genero => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${genero.nome}</td>
                <td>${new Date(genero.data_cadastro).toLocaleString("pt-BR")}</td>
                <td class="col-acao">
                    <button class="btn btn-warning btn-sm btnEditarGenero" data-id="${genero.id_genero}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm btnExcluirGenero" data-id="${genero.id_genero}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btnEditarGenero').forEach(button => {
            button.addEventListener('click', () => {
                const idGenero = button.getAttribute('data-id');
                carregarFormularioEdicao(idGenero);
            });
        });

        document.querySelectorAll('.btnExcluirGenero').forEach(button => {
            button.addEventListener('click', () => {
                const idGenero = button.getAttribute('data-id');
                excluirGenero(idGenero);
            });
        });

        checkAccessRestrictions();
    } catch (error) {
        console.error("Erro ao carregar gêneros:", error);
    }
}

async function carregarFormularioEdicao(idGenero) {
    try {
        let resultado = await fetch(`${base}/genero.php?id=${idGenero}`);
        const genero = await resultado.json();

        if (!genero || !genero.data) {
            Swal.fire({
                icon: 'error',
                title: 'Gênero não encontrado!',
            });
            return;
        }

        esconderCampos();
        document.getElementById("formEditarGenero").style.display = "block";

        document.getElementById("editId").textContent = idGenero;
        document.getElementById("formEditarGenero").nome.value = genero.data.nome;
    } catch (error) {
        console.error("Erro ao carregar formulário de edição:", error);
    }
}

document.getElementById("formEditarGenero").addEventListener("submit", async (event) => {
    event.preventDefault();

    const idGenero = document.getElementById("editId").textContent;
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    dados.id_genero = idGenero;

    try {
        const response = await fetch(`${base}/genero.php`, {
            method: "PUT",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro ao atualizar gênero',
                text: errorData.message,
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Gênero atualizado com sucesso!',
        });
        listarGeneros();
    } catch (error) {
        console.error("Erro ao atualizar gênero:", error);
        Swal.fire("Erro", "Erro ao tentar atualizar o gênero!", "error");
    }
});

async function excluirGenero(idGenero) {
    const confirmDelete = await Swal.fire({
        title: "Tem certeza?",
        text: "Você tem certeza que quer excluir esse gênero?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Não",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const response = await fetch(`${base}/genero.php?id=${idGenero}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro ao excluir gênero',
                text: errorData.message || "Não foi possível excluir o gênero.",
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Gênero excluído com sucesso!',
        });
        listarGeneros();
    } catch (error) {
        console.error("Erro ao excluir gênero:", error);
        Swal.fire("Erro", "Não foi possível excluir o gênero!", "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    listarGeneros();
    checkAccessRestrictions();
});

document.getElementById("btnCadastrar").addEventListener("click", () => {
    esconderCampos();
    document.getElementById("formCadastrar").style.display = "block";
});

document.getElementById("formCadastrar").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);

    if (dados.nome.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o nome do Gênero.", "warning");
        return;
    }

    try {
        const response = await fetch(`${base}/genero.php`, {
            method: "POST",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar gênero',
                text: errorData.message,
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Gênero cadastrado com sucesso!',
        });
        document.getElementById("formCadastrar").reset();
        listarGeneros();
    } catch (error) {
        console.error("Erro ao cadastrar gênero:", error);
    }
});

document.getElementById("btnCancelarCadastro").addEventListener("click", listarGeneros);
document.getElementById("btnCancelarEdicao").addEventListener("click", listarGeneros);
