<?php
function method($expectedMethod) {
    return $_SERVER['REQUEST_METHOD'] === strtoupper($expectedMethod);
}

function tratarEntradaJson() {
    $json = file_get_contents("php://input");
    return json_decode($json, true);
}

function valid($data, $requiredKeys) {
    if (!$data) {
        return false;
    }
    foreach ($requiredKeys as $key) {
        if (!isset($data[$key])) {
            return false;
        }
    }
    return true;
}

function respostaJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
}

function validarString($string) {
    return !empty($string) && is_string($string) && strlen(trim($string)) > 0;
}

function validarId($id) {
    return is_numeric($id) && $id > 0 && intval($id) == $id;
}

function validarDuracao($duracao) {
    return is_numeric($duracao) && $duracao > 0;
}

function validarData($data) {
    $d = DateTime::createFromFormat('Y-m-d', $data);
    return $d && $d->format('Y-m-d') === $data;
}

function validarDataHora($dataHora) {
    $d = DateTime::createFromFormat('Y-m-d H:i:s', $dataHora);
    return $d && $d->format('Y-m-d H:i:s') === $dataHora;
}

function validarQuantidadeIngressos($quantidade) {
    return is_numeric($quantidade) && $quantidade > 0 && intval($quantidade) == $quantidade;
}


function output($statusCode, $message) {
    http_response_code($statusCode);
    echo json_encode($message);
    exit();
}