const base = "http://localhost/pasta/webservice/controller";

document.getElementById("form-login-conta").addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
    };

    if (dados.email.trim() === "") {
        Swal.fire("Erro", "Insira corretamente o email do Usuário.", "warning");
        return;
    }

    if (dados.senha.trim() === "") {
        Swal.fire("Erro", "Insira uma senha válida do Usuário.", "warning");
        return;
    }

    try {
        const response = await fetch(`${base}/login.php`, {
            method: "POST",
            body: JSON.stringify(dados),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            Swal.fire("Erro", errorData.message, "error");
            return;
        }

        const userData = await response.json();

        localStorage.setItem("user", JSON.stringify(userData.data));

        Swal.fire("Sucesso", "Login bem-sucedido!", "success").then(() => {
            window.location.href = "home.html"; 
        });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        Swal.fire("Erro", "Erro desconhecido ao tentar fazer login.", "error");
    }
});
