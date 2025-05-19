const base = "http://localhost/pasta/webservice/controller";
let sessoes = [];

// Esconde todas as views
function esconderCampos() {
  document.getElementById("listaCompras").style.display = "none";
  document.getElementById("formCadastrar").style.display = "none";
  document.getElementById("formEditarCompra").style.display = "none";
}

// Carrega contas no dropdown
async function carregarContasDropdown(id) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">Selecione uma conta</option>';
  try {
    const res = await fetch(`${base}/conta.php`);
    const json = await res.json();
    json.data.forEach(c => {
      const o = document.createElement("option");
      o.value = c.id_conta;
      o.textContent = c.nome;
      sel.appendChild(o);
    });
  } catch {
    Swal.fire("Erro", "Não foi possível carregar as contas!", "error");
  }
}

// Carrega sessões no dropdown **com filmes únicos** e armazena globalmente
async function carregarSessoesDropdown(id) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">Selecione um filme</option>';
  try {
    const res = await fetch(`${base}/sessao.php`);
    const json = await res.json();
    sessoes = json.data;

    // agrupa pelo id_filme para não repetir filme no select
    const filmesMap = new Map();
    sessoes.forEach(s => {
      filmesMap.set(s.id_filme, s.nome_filme);
    });

    filmesMap.forEach((nome, id_filme) => {
      const o = document.createElement("option");
      o.value = id_filme;       // agora armazena id_filme
      o.textContent = nome;
      sel.appendChild(o);
    });
  } catch {
    Swal.fire("Erro", "Não foi possível carregar as sessões!", "error");
  }
}

// Popula horários conforme o **filme** (id_filme) selecionado
function popularHorarios(sessId, horId, selecionada = null) {
  const sessVal = document.getElementById(sessId).value;   // aqui é id_filme
  const sel = document.getElementById(horId);
  sel.innerHTML = '<option value="">Selecione um horário</option>';
  if (!sessVal) {
    sel.disabled = true;
    return;
  }
  sel.disabled = false;

  sessoes
    .filter(s => String(s.id_filme) === sessVal)            // filtra por id_filme
    .forEach(s => {
      const d = new Date(s.horario);
      const pad = v => String(v).padStart(2, "0");
      const txt = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const o = document.createElement("option");
      o.value = s.id_sessao;    // ainda envia id_sessao no horário
      o.textContent = txt;
      if (String(s.id_sessao) === String(selecionada)) o.selected = true;
      sel.appendChild(o);
    });
}

async function listarCompras() {
  esconderCampos();
  document.getElementById("listaCompras").style.display = "block";
  const tb = document.querySelector("#listaCompras tbody");
  tb.innerHTML = "";
  try {
    const res = await fetch(`${base}/compra.php`);
    const json = await res.json();
    const show = Boolean(JSON.parse(localStorage.getItem("user")));
    document.querySelectorAll("th.col-acao-compra").forEach(th => {
      th.style.display = show ? "" : "none";
    });
    json.data.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nome_sessao}</td>
        <td>${new Date(c.horario).toLocaleString("pt-BR")}</td>
        <td>${c.quantidade_ingressos}</td>
        <td>${new Date(c.data_compra).toLocaleString("pt-BR")}</td>
        ${show ? `
          <td class="col-acao-compra">
            <button class="btn btn-warning btn-sm btnEditarCompra" data-id="${c.id_compra}">Editar</button>
            <button class="btn btn-danger btn-sm btnExcluirCompra" data-id="${c.id_compra}">Excluir</button>
          </td>` : ""}
      `;
      tb.appendChild(tr);
    });
    if (show) {
      document.querySelectorAll(".btnEditarCompra").forEach(b =>
        b.addEventListener("click", () => carregarFormularioEdicao(b.dataset.id))
      );
      document.querySelectorAll(".btnExcluirCompra").forEach(b =>
        b.addEventListener("click", () => excluirCompra(b.dataset.id))
      );
    }
  } catch {
    Swal.fire("Erro", "Não foi possível listar as compras!", "error");
  }
}

// Preenche o formulário de edição
async function carregarFormularioEdicao(id) {
  esconderCampos();
  document.getElementById("formEditarCompra").style.display = "block";

  const res = await fetch(`${base}/compra.php?id=${id}`);
  const json = await res.json();
  const c = json.data;

  await carregarContasDropdown("editIdConta");
  await carregarSessoesDropdown("editIdSessao");

  // Adiciona "Conta Removida" se não existir mais
  const selConta = document.getElementById("editIdConta");
  if (!c.id_conta || !selConta.querySelector(`option[value="${c.id_conta}"]`)) {
    const opt = document.createElement("option");
    opt.value = "null";
    opt.textContent = "Conta Removida";
    selConta.appendChild(opt);
    selConta.value = "null";
  } else {
    selConta.value = c.id_conta;
  }

  // Preenche sessão (por id_filme)
  document.getElementById("editId").value = c.id_compra;
  document.getElementById("editIdSessao").value = c.id_filme;

  // Preenche horários (por id_sessao)
  popularHorarios("editIdSessao", "editHorarioSelect", c.id_sessao);

  document.getElementById("editQuantidadeIngressos").value = c.quantidade_ingressos;
}


// Eventos de submit/ações
document.getElementById("formEditarCompra").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));

  // Converte "null" ou string vazia para valor nulo real
  if (data.id_conta === "null" || data.id_conta === "") data.id_conta = null;

  try {
    const res = await fetch(`${base}/compra.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw "";
    Swal.fire("Sucesso", "Compra atualizada!", "success");
    listarCompras();
  } catch {
    Swal.fire("Erro", "Não foi possível atualizar a compra.", "error");
  }
});


document.getElementById("btnCancelarEdicao").addEventListener("click", listarCompras);

async function excluirCompra(id) {
  const conf = await Swal.fire({
    title: "Confirma exclusão?",
    icon: "warning",
    showCancelButton: true
  });
  if (!conf.isConfirmed) return;
  try {
    const res = await fetch(`${base}/compra.php?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw "";
    Swal.fire("Sucesso", "Compra excluída!", "success");
    listarCompras();
  } catch {
    Swal.fire("Erro", "Não foi possível excluir a compra.", "error");
  }
}

// Abre o form de cadastro (botão)
document.getElementById("btnCadastrarCompra").addEventListener("click", async () => {
  esconderCampos();
  await carregarContasDropdown("idConta");
  await carregarSessoesDropdown("idSessao");
  document.getElementById("formCadastrar").style.display = "block";
});

// Seleção de filme no cadastro agora popula horários
document.getElementById("idSessao").addEventListener("change", () =>
  popularHorarios("idSessao", "horarioSelect")
);

// Submit de cadastro
document.getElementById("formCadastrar").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));

  try {
    const response = await fetch(`${base}/compra.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // sempre parseie o JSON de resposta
    const result = await response.json();

    // trate tanto o status HTTP quanto o campo valid do JSON
    if (!response.ok || !result.valid) {
      throw new Error(result.message || "Não foi possível cadastrar a compra");
    }

    // sucesso real
    Swal.fire("Sucesso", result.message, "success");
    listarCompras();
  } catch (err) {
    console.error("Erro ao cadastrar compra:", err);
    Swal.fire("Erro ao cadastrar compra", err.message, "error");
  }
});



document.getElementById("btnCancelarCadastro").addEventListener("click", listarCompras);

// On load: lista ou pré-preenche se vier da home
document.addEventListener("DOMContentLoaded", async () => {
  const sessaoSelecionada = localStorage.getItem("sessaoSelecionada");

  if (sessaoSelecionada) {
    const sessao = JSON.parse(sessaoSelecionada);

    esconderCampos();
    await carregarContasDropdown("idConta");
    await carregarSessoesDropdown("idSessao");

    // Preenche o select de sessão (por id_filme)
    document.getElementById("idSessao").value = sessao.id_filme;

    // Preenche o horário (por id_sessao)
    popularHorarios("idSessao", "horarioSelect", sessao.id_sessao);

    // Exibe o formulário preenchido
    document.getElementById("formCadastrar").style.display = "block";

    // Limpa o localStorage após uso
    localStorage.removeItem("sessaoSelecionada");
  } else {
    listarCompras();
  }
});

