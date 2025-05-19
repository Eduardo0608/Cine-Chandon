<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class FilmeGenero
{
    public static function listar() {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("
                SELECT f.id_filme, f.titulo, g.id_genero, g.nome AS genero
                FROM filme_genero fg
                JOIN filme f ON fg.id_filme = f.id_filme
                JOIN genero g ON fg.id_genero = g.id_genero
            ");
            $sql->execute();
            return $sql->fetchAll();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }
}
