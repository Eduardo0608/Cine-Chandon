<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Filme
{
    public static function getById($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM filme WHERE id_filme = ?");
            $sql->execute([$id]);
            $filme = $sql->fetch();

            if (!$filme) {
                return null;
            }

            $sqlGeneros = $conexao->prepare("SELECT id_genero FROM filme_genero WHERE id_filme = ?");
            $sqlGeneros->execute([$id]);
            $generos = $sqlGeneros->fetchAll(PDO::FETCH_COLUMN);

            $filme['generos'] = $generos;

            return $filme;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function exist($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM filme WHERE id_filme = ?");
            $sql->execute([$id]);
            return $sql->fetchColumn() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function listar() {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM filme");
            $sql->execute();
            return $sql->fetchAll();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function insert($titulo, $duracao, $sinopse, $data_lancamento, $generos) {
    try {
        if (!validarString($titulo)) {
            throw new Exception("Título inválido", 400);
        }
        if (!validarDuracao($duracao)) {
            throw new Exception("Duração inválida", 400);
        }
        if (!validarData($data_lancamento)) {
            throw new Exception("Data de lançamento inválida", 400);
        }
        if (!is_array($generos) || count($generos) === 0) {
            throw new Exception("Pelo menos um gênero deve ser informado", 400);
        }

        $conexao = Conexao::getConexao();
        $stmt = $conexao->prepare("CALL CadastrarFilme(?, ?, ?, ?, ?)");
        $stmt->execute([$titulo, $duracao, $sinopse, $data_lancamento, json_encode($generos)]);

        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode() ?: 500);
    }
}


    public static function update($id, $titulo, $duracao, $sinopse, $data_lancamento, $generos) {
    try {
        if (!self::exist($id)) {
            throw new Exception("Filme não encontrado", 404);
        }
        if (!validarString($titulo)) {
            throw new Exception("Título inválido", 400);
        }
        if (!validarDuracao($duracao)) {
            throw new Exception("Duração inválida", 400);
        }
        if (!validarData($data_lancamento)) {
            throw new Exception("Data de lançamento inválida", 400);
        }
        if (!is_array($generos) || count($generos) === 0) {
            throw new Exception("Pelo menos um gênero deve ser informado", 400);
        }

        $conexao = Conexao::getConexao();
        $stmt = $conexao->prepare("CALL AtualizarFilme(?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $titulo, $duracao, $sinopse, $data_lancamento, json_encode($generos)]);

        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode() ?: 500);
    }
}
 

    public static function delete($id) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Filme não encontrado", 404);
            }

            $conexao = Conexao::getConexao();
            $stmt = $conexao->prepare("DELETE FROM filme_genero WHERE id_filme = ?");
            $stmt->execute([$id]);

            $sql = $conexao->prepare("DELETE FROM filme WHERE id_filme = ?");
            return $sql->execute([$id]);
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }
}
