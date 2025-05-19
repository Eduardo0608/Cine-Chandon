function updateHeader() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navLinks = document.querySelector(".nav-links");

    navLinks.innerHTML = `
        <li><a href="/pasta/webservice/view/filme.html" class="nav-link">Filmes</a></li>
        <li><a href="/pasta/webservice/view/sessao.html" class="nav-link">Sessões</a></li>
        <li><a href="/pasta/webservice/view/genero.html" class="nav-link">Gêneros</a></li>
        <li><a href="/pasta/webservice/view/compra.html" class="nav-link">Compras</a></li>
    `;

    if (user) {
        navLinks.innerHTML += `
            <li><a href="/pasta/webservice/view/gerenciarConta.html" class="nav-link">Contas</a></li>
            <li><a href="#" class="btn btn-danger mr-2" id="logout">Sair</a></li>
        `;
    } else {
        navLinks.innerHTML += `
            <li><a href="/pasta/webservice/view/login.html" class="btn btn-success mr-2">Fazer Login</a></li>
        `;
    }

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("user");
            updateHeader();
            checkAccessRestrictions();
            updateCompraButton(); 
            Swal.fire("Sessão Encerrada", "Você saiu da sua conta.", "success");
        });
    }
}

function checkAccessRestrictions() {
    const user = JSON.parse(localStorage.getItem("user"));

    document.querySelectorAll("#btnCadastrar").forEach(button => {
        button.style.display = user ? "inline-block" : "none";
    });

    document.querySelectorAll(".col-acao").forEach(col => {
        col.style.display = user ? "table-cell" : "none";
    });

    document.querySelectorAll(".col-acao-compra").forEach(col => {
        col.style.display = user ? "table-cell" : "none";
    });

    updateCompraButton();
}

function updateCompraButton() {
    const user = JSON.parse(localStorage.getItem("user"));
    const btnCompra = document.getElementById("btnCadastrarCompra");

    if (btnCompra) {
        btnCompra.textContent = user ? "Cadastrar Compra" : "Cadastrar Compra";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateHeader(); 
    checkAccessRestrictions();
});
