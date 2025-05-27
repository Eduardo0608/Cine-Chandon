<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Sessao.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
        if (valid($_GET, ["id"])) {
            $sessao = Sessao::getById($_GET["id"]);
            if (!$sessao) {
                throw new Exception("Sessão não encontrada", 404);
            }
            respostaJson(['valid' => true, 'data' => $sessao], 200);
        } else {
            $sessoes = Sessao::listar(!isset($_GET["admin"]));
            respostaJson(['valid' => true, 'data' => $sessoes], 200);
        }
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("POST")) {
    try {
        if (!valid($data, ["id_filme", "horario", "quantidade_maxima_ingressos"])) {
            throw new Exception("Dados da sessão não enviados corretamente", 400);
        }

        $res = Sessao::insert($data["id_filme"], $data["horario"], $data["quantidade_maxima_ingressos"]);
        if (!$res) {
            throw new Exception("Falha ao cadastrar a sessão", 500);
        }
        respostaJson(['valid' => true, 'message' => "Sessão criada com sucesso"], 201);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("PUT")) {
    try {
        if (isset($data["id_sessao"], $data["ativa"])) {
            Sessao::alterarStatus($data["id_sessao"], $data["ativa"]);
            respostaJson(['valid' => true, 'message' => "Status atualizado com sucesso"], 200);
            exit;
        }

        if (!valid($data, ["id_sessao", "id_filme", "horario", "ingressos_disponiveis", "quantidade_maxima_ingressos"])) {
            throw new Exception("Dados da sessão não enviados corretamente", 400);
        }

        $idSessao = $data["id_sessao"];
        $idFilme = $data["id_filme"];
        $horario = $data["horario"];
        $disp    = (int)$data["ingressos_disponiveis"];
        $max     = (int)$data["quantidade_maxima_ingressos"];

        if (!Sessao::exist($idSessao)) {
            throw new Exception("Sessão não encontrada", 404);
        }
        if (!validarId($idFilme)) {
            throw new Exception("ID do filme inválido", 400);
        }
        if (!validarDataHora($horario)) {
            throw new Exception("Horário inválido", 400);
        }
        if (!validarId($disp) || !validarId($max)) {
            throw new Exception("Valores de ingressos inválidos", 400);
        }
        if ($disp > $max) {
            throw new Exception("Ingressos disponíveis não podem exceder a capacidade máxima", 400);
        }

        $res = Sessao::update(
            $idSessao,
            $idFilme,
            $horario,
            $disp,
            $max
        );
        if (!$res) {
            throw new Exception("Não foi possível atualizar a sessão", 500);
        }
        respostaJson(['valid' => true, 'message' => "Sessão atualizada com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}

if (method("DELETE")) {
    try {
        if (!valid($_GET, ["id"])) {
            throw new Exception("ID não enviado", 400);
        }

        $res = Sessao::delete($_GET["id"]);
        if (!$res) {
            throw new Exception("Não foi possível excluir a sessão", 500);
        }
        respostaJson(['valid' => true, 'message' => "Sessão excluída com sucesso"], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
