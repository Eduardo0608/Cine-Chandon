<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Conta.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("POST")) {
    try {
        if (!valid($data, ["email", "senha"])) {
            throw new Exception("E-mail e senha são obrigatórios", 400);
        }

        $conta = Conta::validarLogin($data["email"], $data["senha"]);

        respostaJson(['valid' => true, 'message' => 'Login bem-sucedido', 'data' => $conta], 200);

    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}