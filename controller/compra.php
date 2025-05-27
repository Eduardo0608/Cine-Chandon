<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Compra.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
        if (valid($_GET, ["id"])) {
            $compra = Compra::getById($_GET["id"]);
            if (!$compra) {
                throw new Exception("Compra não encontrada", 404);
            }
            respostaJson(['valid' => true, 'data' => $compra], 200);
        } else {
            $compras = Compra::listar();
            respostaJson(['valid' => true, 'data' => $compras], 200);
        }
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("POST")) {
    try {
        if (!valid($data, ["id_conta", "id_sessao", "quantidade_ingressos", "tipo_ingresso"])) {
            throw new Exception("Dados da compra não enviados corretamente", 400);
        }

        $res = Compra::insert(
            $data["id_conta"],
            $data["id_sessao"],
            $data["quantidade_ingressos"],
            $data["tipo_ingresso"]
        );

        if (!$res) {
            throw new Exception("Falha ao cadastrar a compra", 500);
        }

        respostaJson(['valid' => true, 'message' => "Compra criada com sucesso"], 201);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("PUT")) {
    try {
        if (!valid($data, ["id_compra", "id_sessao", "quantidade_ingressos", "tipo_ingresso"])) {
            throw new Exception("Dados da compra não enviados corretamente", 400);
        }

        $idConta = isset($data["id_conta"]) && $data["id_conta"] !== "" && $data["id_conta"] !== "null"
            ? $data["id_conta"]
            : null;

        $res = Compra::update(
            $data["id_compra"],
            $idConta,
            $data["id_sessao"],
            $data["quantidade_ingressos"],
            $data["tipo_ingresso"]
        );

        if (!$res) {
            throw new Exception("Não foi possível atualizar a compra", 500);
        }

        respostaJson(['valid' => true, 'message' => "Compra atualizada com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("DELETE")) {
    try {
        if (!valid($_GET, ["id"])) {
            throw new Exception("ID não enviado", 400);
        }

        $res = Compra::delete($_GET["id"]);
        if (!$res) {
            throw new Exception("Não foi possível excluir a compra", 500);
        }

        respostaJson(['valid' => true, 'message' => "Compra excluída com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
