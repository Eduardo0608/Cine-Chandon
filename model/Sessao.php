<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Sessao
{
    public static function getById($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM sessao WHERE id_sessao = ?");
            $sql->execute([$id]);
            return $sql->fetch();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function exist($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM sessao WHERE id_sessao = ?");
            $sql->execute([$id]);
            return $sql->fetchColumn() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function listar($somenteAtivas = false) {
    try {
        $conexao = Conexao::getConexao();
        $sql = $conexao->prepare("
    SELECT s.id_sessao, s.id_filme, f.titulo AS nome_filme, f.imagem_url,
           s.horario, s.ingressos_disponiveis, s.quantidade_maxima_ingressos, s.ativa
    FROM sessao s
    INNER JOIN filme f ON s.id_filme = f.id_filme
    " . ($somenteAtivas ? "WHERE s.ativa = 1" : "")
);
        $sql->execute();
        return $sql->fetchAll();
    } catch (Exception $e) {
        output(500, ["msg" => $e->getMessage()]);
    }
}

public static function alterarStatus($id, $ativa) {
    try {
        $conexao = Conexao::getConexao();
        $sql = $conexao->prepare("UPDATE sessao SET ativa = ? WHERE id_sessao = ?");
        $sql->execute([(int)$ativa, $id]);
        return true;
    } catch (Exception $e) {
        output(500, ["msg" => $e->getMessage()]);
    }
}
    

    public static function insert($id_filme, $horario, $quantidade_maxima_ingressos) {
        try {
            if (!validarId($id_filme)) {
                throw new Exception("ID do filme inválido", 400);
            }
            if (!validarDataHora($horario)) {
                throw new Exception("Horário inválido", 400);
            }
            if (!validarId($quantidade_maxima_ingressos)) {
                throw new Exception("Quantidade máxima de ingressos inválida", 400);
            }
            
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM filme WHERE id_filme = ?");
            $sql->execute([$id_filme]);
            if ($sql->fetchColumn() == 0) {
                throw new Exception("Filme não encontrado", 404);
            }
    
            $sql = $conexao->prepare("INSERT INTO sessao (id_filme, horario, quantidade_maxima_ingressos, ingressos_disponiveis) 
                                    VALUES (?, ?, ?, ?)");
            $sql->execute([$id_filme, $horario, $quantidade_maxima_ingressos, $quantidade_maxima_ingressos]);
    
            return $sql->rowCount();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }
    

    public static function update($id, $id_filme, $horario, $ingressos_disponiveis, $quantidade_maxima_ingressos) {
    try {
        $conexao = Conexao::getConexao();
        $sql = $conexao->prepare(
            "UPDATE sessao SET
                id_filme = ?,
                horario = ?,
                quantidade_maxima_ingressos = ?,
                ingressos_disponiveis = ?
             WHERE id_sessao = ?"
        );
        $sql->execute([
            $id_filme,
            $horario,
            $quantidade_maxima_ingressos,
            $ingressos_disponiveis,
            $id
        ]);
        return $sql->rowCount();
    } catch (Exception $e) {
        output(500, ["msg" => $e->getMessage()]);
    }
}


    public static function delete($id) {
    if (!self::exist($id)) {
        throw new Exception("Sessão não encontrada", 404);
    }

    $conexao = Conexao::getConexao();
    $sql = $conexao->prepare("DELETE FROM sessao WHERE id_sessao = ?");
    $sql->execute([$id]);

    if ($sql->rowCount() === 0) {
        throw new Exception("Nenhuma sessão foi excluída", 500);
    }

    return true;
}

}
