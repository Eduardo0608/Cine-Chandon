<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Genero.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
        if (valid($_GET, ["id"])) {
            $genero = Genero::getById($_GET["id"]);
            if (!$genero) {
                throw new Exception("Gênero não encontrado", 404);
            }
            respostaJson(['valid' => true, 'data' => $genero], 200);
        } else {
            $generos = Genero::listar();
            respostaJson(['valid' => true, 'data' => $generos], 200);
        }
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("POST")) {
    try {
        if (!valid($data, ["nome"])) {
            throw new Exception("Dados do gênero não enviados corretamente", 400);
        }

        $res = Genero::insert($data["nome"]);
        if (!$res) {
            throw new Exception("Falha ao cadastrar o gênero", 500);
        }
        respostaJson(['valid' => true, 'message' => "Gênero criado com sucesso"], 201);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("PUT")) {
    try {
        if (!valid($data, ["id_genero", "nome"])) {
            throw new Exception("Dados do gênero não enviados corretamente", 400);
        }

        $res = Genero::update($data["id_genero"], $data["nome"]);
        if (!$res) {
            throw new Exception("Não foi possível atualizar o gênero", 500);
        }
        respostaJson(['valid' => true, 'message' => "Gênero atualizado com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("DELETE")) {
    try {
        if (!valid($_GET, ["id"])) {
            throw new Exception("ID não enviado", 400);
        }

        $res = Genero::delete($_GET["id"]);
        if (!$res) {
            throw new Exception("Não foi possível excluir o gênero", 500);
        }
        respostaJson(['valid' => true, 'message' => "Gênero excluído com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
