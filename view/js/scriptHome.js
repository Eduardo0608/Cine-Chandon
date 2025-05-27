const base = "http://localhost/pasta/webservice/controller";
let sessoesOriginais = [];

// formata ISO em "dd/MM/yyyy HH:mm"
function formatarHorario(iso) {
    const d = new Date(iso);
    const pad = v => String(v).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderizarSessoes(sessoes) {
    const container = document.getElementById("movies-container");
    container.innerHTML = "";

    if (sessoes.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p>Nenhuma sessão encontrada.</p>
            </div>
        `;
        return;
    }

    sessoes.forEach(sessao => {
        const horarioFmt = formatarHorario(sessao.horario);

        const col = document.createElement("div");
        col.className = "col-md-3 mb-4";

        col.innerHTML = `
            <div class="card h-100 border rounded overflow-hidden">
                <img src="${sessao.imagem_url || 'assets/images/cine.webp'}" class="card-img-top" alt="${sessao.nome_filme}">

                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${sessao.nome_filme}</h5>
                    <p class="card-text">Horário: ${horarioFmt}</p>
                    <p class="card-text"><strong>Ingressos Disp.:</strong> ${sessao.ingressos_disponiveis}</p>
                    <button class="btn btn-primary mt-auto btnComprar"
                        data-id="${sessao.id_sessao}"
                        data-horario="${encodeURIComponent(sessao.horario)}"
                        data-nome="${encodeURIComponent(sessao.nome_filme)}">
                        Cadastrar Compra
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });

    document.querySelectorAll(".btnComprar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id_sessao = btn.dataset.id;
            const horario = decodeURIComponent(btn.dataset.horario);
            const nome_sessao = decodeURIComponent(btn.dataset.nome);

            const sessaoSelecionada = {
                id_sessao: id_sessao,
                id_filme: sessoesOriginais.find(s => String(s.id_sessao) === String(id_sessao)).id_filme,
                horario: horario,
                nome_sessao: nome_sessao
            };

            localStorage.setItem("sessaoSelecionada", JSON.stringify(sessaoSelecionada));
            window.location.href = "compra.html";
        });
    });
}

async function carregarSessões() {
    const container = document.getElementById("movies-container");
    container.innerHTML = "";

    try {
        const res = await fetch(`${base}/sessao.php`);
        const json = await res.json();
        sessoesOriginais = json.data;
        renderizarSessoes(sessoesOriginais);
    } catch (err) {
        console.error("Erro ao carregar sessões:", err);
        container.innerHTML = `
            <div class="col-12 text-center">
                <p>Erro ao carregar as sessões. Tente novamente mais tarde.</p>
            </div>
        `;
        Swal.fire("Erro", "Não foi possível carregar as sessões!", "error");
    }
}

document.getElementById("inputBuscaSessao").addEventListener("input", e => {
    const termo = e.target.value.toLowerCase();
    const filtradas = sessoesOriginais.filter(s =>
        s.nome_filme.toLowerCase().includes(termo) ||
        formatarHorario(s.horario).toLowerCase().includes(termo)
    );
    renderizarSessoes(filtradas);
});

document.addEventListener("DOMContentLoaded", carregarSessões);
