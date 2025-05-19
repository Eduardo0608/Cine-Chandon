const base = "http://localhost/pasta/webservice/controller";
let contas = [];

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        Swal.fire({
            title: "Acesso Negado",
            text: "Você precisa estar logado para acessar esta página.",
            icon: "warning",
            confirmButtonText: "Ir para a Home"
        }).then(() => {
            window.location.href = "/pasta/webservice/view/home.html"; 
        });
    } else {
        listarContas();
    }
});

async function listarContas() {
    esconderCampos();
    const listaContas = document.getElementById("listaContas");
    listaContas.style.display = "block";
    const tbody = listaContas.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        let resultado = await fetch(`${base}/conta.php`);
        contas = await resultado.json();

        contas.data.forEach(conta => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${conta.nome}</td>
                <td>${conta.email}</td>
                <td>${conta.cpf}</td>
                <td>${new Date(conta.data_cadastro).toLocaleString("pt-BR")}</td>
                <td>
                    <button class="btn btn-warning btn-sm btnEditarConta" data-id="${conta.id_conta}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm btnExcluirConta" data-id="${conta.id_conta}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btnEditarConta').forEach(button => {
            button.addEventListener('click', (event) => {
                const idConta = event.target.getAttribute('data-id');
                editarConta(idConta);
            });
        });

        document.querySelectorAll('.btnExcluirConta').forEach(button => {
            button.addEventListener('click', (event) => {
                const idConta = event.target.getAttribute('data-id');
                excluirConta(idConta);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar contas:", error);
    }
}

document.getElementById("formEditarConta").addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
        id_conta: document.getElementById("editId").value,
        nome: document.getElementById("editNome").value,
        email: document.getElementById("editEmail").value,
        cpf: document.getElementById("editCpf").value,
        data_nascimento: document.getElementById("editNascimento").value
    };

    if (dados.nome.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o nome do Usuário.", "warning");
        return;
    }
    if (dados.email.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o email do Usuário.", "warning");
        return;
    }
    if (dados.senha.trim() === "") {
        Swal.fire("Erro", "Insira uma senha válida do Usuário.", "warning");
        return;
    }
    if (dados.cpf.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o CPF do Usuário.", "warning");
        return;
    }
    if (dados.data_nascimento.trim() === "") {
        Swal.fire("Erro", "Insira corretamente a Data de Nascimento do Usuário.", "warning");
        return;
    }

    try {
        const response = await fetch(`${base}/conta.php`, {
            method: "PUT",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao atualizar conta:", errorData);
            Swal.fire("Erro", `Erro ao atualizar conta: ${errorData.message}`, "error");
            return;
        }

        Swal.fire("Sucesso", "Conta atualizada com sucesso!", "success").then(() => {
            location.reload();
        });
    } catch (error) {
        console.error("Erro ao atualizar conta:", error);
        Swal.fire("Erro", "Ocorreu um erro ao atualizar a conta", "error").then(() => {
            location.reload();
        });
    }
});

async function editarConta(id) {
    console.log(id);

    if (!id) return;

    try {
        let resultado = await fetch(`${base}/conta.php?id=${id}`);
        const conta = await resultado.json();
        console.log(conta);

        esconderCampos();
        document.getElementById("formEditarConta").style.display = "block";

        document.getElementById("editId").value = conta.data.id_conta;
        document.getElementById("editNome").value = conta.data.nome;
        document.getElementById("editEmail").value = conta.data.email;
        document.getElementById("editCpf").value = conta.data.cpf;
        document.getElementById("editNascimento").value = conta.data.data_nascimento;

    } catch (error) {
        console.error("Erro ao buscar conta:", error);
        Swal.fire("Erro", "Erro ao carregar os dados da conta", "error");
    }
}

async function excluirConta(id) {
    console.log(id);

    if (!id) return;

    const confirmDelete = await Swal.fire({
        title: "Tem certeza?",
        text: "Você tem certeza que quer excluir essa conta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const response = await fetch(`${base}/conta.php?id=${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao excluir conta:", errorData);
            Swal.fire("Erro", `Erro ao excluir conta: ${errorData.message}`, "error");
            return;
        }

        Swal.fire("Sucesso", "Conta excluída com sucesso!", "success").then(() => {
            location.reload();
        });
    } catch (error) {
        console.error("Erro ao excluir conta:", error);
        Swal.fire("Erro", "Não foi possível excluir a conta. Tente novamente mais tarde.", "error");
    }
}

function esconderCampos() {
    document.getElementById("listaContas").style.display = "none";
    document.getElementById("formEditarConta").style.display = "none";
}

document.getElementById("btnCancelar").addEventListener("click", () => {
    listarContas();
});
