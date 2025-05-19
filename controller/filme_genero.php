<?php
require_once(__DIR__ . "/../configs/utils.php");
require_once(__DIR__ . "/../model/Filme_genero.php");

header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = tratarEntradaJson();

if (method("GET")) {
    try {
            $filmesGeneros = FilmeGenero::listar();
            respostaJson(['valid' => true, 'data' => $filmesGeneros], 200);
    } catch (Exception $e) {
        respostaJson(['valid' => false, 'message' => $e->getMessage()], $e->getCode());
    }
}
