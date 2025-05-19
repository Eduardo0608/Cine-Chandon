<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Genero
{
    public static function getById($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM genero WHERE id_genero = ?");
            $sql->execute([$id]);
            return $sql->fetch();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function exist($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM genero WHERE id_genero = ?");
            $sql->execute([$id]);
            return $sql->fetchColumn() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function listar() {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM genero");
            $sql->execute();
            return $sql->fetchAll();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function insert($nome) {
        try {
            if (empty($nome)) {
                throw new Exception("Nome do gênero não pode ser vazio", 400);
            }

            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("INSERT INTO genero (nome) VALUES (?)");
            $sql->execute([$nome]);
            return $sql->rowCount();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function update($id, $nome) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Gênero não encontrado", 404);
            }
            if (empty($nome)) {
                throw new Exception("Nome do gênero não pode ser vazio", 400);
            }

            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("UPDATE genero SET nome = ? WHERE id_genero = ?");
            $sql->execute([$nome, $id]);
            return $sql->rowCount();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function delete($id) {
    try {
        if (!self::exist($id)) {
            throw new Exception("Gênero não encontrado", 404);
        }

        $conexao = Conexao::getConexao();
        $stmt = $conexao->prepare("CALL ExcluirGenero(?)");
        $stmt->execute([$id]);

        return true;
    } catch (PDOException $e) {
        // Captura erro da procedure (gênero vinculado a filme)
        if (str_contains($e->getMessage(), "não pode ser excluído")) {
            throw new Exception("Este gênero está associado a um ou mais filmes e não pode ser excluído.", 400);
        }
        throw new Exception($e->getMessage(), 500);
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

}
