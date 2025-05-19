<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Filme.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
        if (valid($_GET, ["id"])) {
            $filme = Filme::getById($_GET["id"]);
            if (!$filme) {
                throw new Exception("Filme não encontrado", 404);
            }
            respostaJson(['valid' => true, 'data' => $filme], 200);
        } else {
            $filmes = Filme::listar();
            respostaJson(['valid' => true, 'data' => $filmes], 200);
        }
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("POST")) {
    try {
        if (!valid($data, ["titulo", "duracao", "sinopse", "data_lancamento", "generos"])) {
    throw new Exception("Dados do filme não enviados corretamente", 400);
}
if (!is_array($data["generos"]) || count($data["generos"]) === 0) {
    throw new Exception("Pelo menos um gênero deve ser selecionado", 400);
}


        $res = Filme::insert($data["titulo"], $data["duracao"], $data["sinopse"], $data["data_lancamento"], $data["generos"]);
        if ($res !== true) {
            throw new Exception("Falha ao cadastrar o filme", 500);
        }
        respostaJson(['valid' => true, 'message' => "Filme criado com sucesso"], 201);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("PUT")) {
    try {
        if (!valid($data, ["id_filme", "titulo", "duracao", "sinopse", "data_lancamento", "generos"])) {
            throw new Exception("Dados do filme não enviados corretamente", 400);
        }

        $res = Filme::update($data["id_filme"], $data["titulo"], $data["duracao"], $data["sinopse"], $data["data_lancamento"], $data["generos"]);
        
        if ($res !== true) {
            throw new Exception("Nenhuma alteração realizada", 400);
        }
        
        respostaJson(['valid' => true, 'message' => "Filme e gêneros atualizados com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("DELETE")) {
    try {
        if (!valid($_GET, ["id"])) {
            throw new Exception("ID não enviado", 400);
        }

        $res = Filme::delete($_GET["id"]);
        if (!$res) {
            throw new Exception("Filme não encontrado", 404);
        }
        respostaJson(['valid' => true, 'message' => "Filme excluído com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
