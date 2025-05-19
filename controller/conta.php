<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Conta.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
        if (valid($_GET, ["id"])) {
            $conta = Conta::getById($_GET["id"]);
            if (!$conta) {
                throw new Exception("Conta não encontrada", 404);
            }
            respostaJson(['valid' => true, 'data' => $conta], 200);
        } else {
            $contas = Conta::listar();
            respostaJson(['valid' => true, 'data' => $contas], 200);
        }
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("POST")) {
    try {
        if (!valid($data, ["nome", "email", "cpf", "data_nascimento"])) {
            throw new Exception("Dados da conta não enviados corretamente", 400);
        }

        $res = Conta::insert($data["nome"], $data["email"], $data["cpf"], $data["data_nascimento"], $data["senha"]);
        if (!$res) {
            throw new Exception("Falha ao cadastrar a conta", 500);
        }
        respostaJson(['valid' => true, 'message' => "Conta criada com sucesso"], 201);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("PUT")) {
    try {
        if (!valid($data, ["id_conta", "nome", "email", "cpf", "data_nascimento"])) {
            throw new Exception("Dados da conta não enviados corretamente", 400);
        }

        $res = Conta::update($data["id_conta"], $data["nome"], $data["email"], $data["cpf"], $data["data_nascimento"], $data["senha"]);
        
        if ($res === false) {
            throw new Exception("Não foi possível atualizar a conta", 500);
        }

        respostaJson(['valid' => true, 'message' => "Conta atualizada com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("DELETE")) {
    try {
        if (!valid($_GET, ["id"])) {
            throw new Exception("ID não enviado", 400);
        }

        $res = Conta::delete($_GET["id"]);
        if (!$res) {
            throw new Exception("Não foi possível excluir a conta", 500);
        }
        respostaJson(['valid' => true, 'message' => "Conta excluída com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
