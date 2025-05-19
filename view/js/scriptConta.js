const base = "http://localhost/pasta/webservice/controller";
let contas = [];

document.getElementById("form-criar-conta").addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
        cpf: document.getElementById("cpf").value,
        data_nascimento: document.getElementById("nascimento").value
    };

    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if(dados.nome.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o nome do Usuário.", "warning");
        return;
    }

    if(dados.email.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o email do Usuário.", "warning");
        return;
    }

    if(dados.senha.trim() === "") {
        Swal.fire("Erro", "Insira uma senha válida do Usuário.", "warning");
        return;
    }

    if(dados.senha !== confirmarSenha) {
        Swal.fire("Erro", "As senhas não coincidem. Por favor, verifique.", "warning");
        return;
    }

    if(dados.cpf.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o CPF do Usuário.", "warning");
        return;
    }

    if(dados.data_nascimento.trim() === "") {
        Swal.fire("Erro", "Insira corretamente a Data de Nascimento do Usuário.", "warning");
        return;
    }

    console.log(dados)

    try {        
        const response = await fetch(`${base}/conta.php`, {
            method: "POST",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json"
            }
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao cadastrar conta:", errorData);
    
            if (errorData && errorData.message) {
                if (errorData.message.includes("Já existe uma conta cadastrada com este e-mail")) {
                    Swal.fire("Erro", "Já existe uma conta cadastrada com este e-mail.", "warning");
                } else {
                    Swal.fire("Erro", `Erro ao cadastrar conta: ${errorData.message}`, "error");
                }
            } else {
                Swal.fire("Erro", "Erro desconhecido ao tentar cadastrar conta.", "error");
            }
    
            return;
        }
    
        Swal.fire("Sucesso", "Conta cadastrada com sucesso!", "success").then(() => {
            window.location.href = "http://localhost/pasta/webservice/view/login.html";
        });        
    } catch (error) {
        console.error("Erro ao cadastrar conta:", error);
        Swal.fire("Erro", "Erro desconhecido ao tentar cadastrar conta.", "error");
    }
    
});

document.getElementById("btnCancelarCriacao").addEventListener("click", () => {
    window.location.href = "http://localhost/pasta/webservice/view/login.html";
});
