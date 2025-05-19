<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Compra
{
    public static function getById($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("
                SELECT c.id_compra, c.id_conta, c.id_sessao, c.quantidade_ingressos, c.data_compra,
                       s.horario, s.id_filme, co.nome AS nome_conta, f.titulo AS nome_sessao
                FROM compra c
                LEFT JOIN conta co ON c.id_conta = co.id_conta
                INNER JOIN sessao s ON c.id_sessao = s.id_sessao
                INNER JOIN filme f ON s.id_filme = f.id_filme
                WHERE c.id_compra = ?
            ");
            $sql->execute([$id]);
            return $sql->fetch();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function exist($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM compra WHERE id_compra = ?");
            $sql->execute([$id]);
            return $sql->fetchColumn() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function listar() {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("
                SELECT c.id_compra, c.id_conta, s.horario, c.id_sessao, c.quantidade_ingressos, c.data_compra, 
                       COALESCE(co.nome, 'Conta removida') AS nome_conta, 
                       f.titulo AS nome_sessao
                FROM compra c
                LEFT JOIN conta co ON c.id_conta = co.id_conta
                INNER JOIN sessao s ON c.id_sessao = s.id_sessao
                INNER JOIN filme f ON s.id_filme = f.id_filme
            ");
            $sql->execute();
            return $sql->fetchAll();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function insert($id_conta, $id_sessao, $quantidade_ingressos) {
        try {
            if (!validarId($id_conta) || !validarId($id_sessao) || !validarQuantidadeIngressos($quantidade_ingressos)) {
                throw new Exception("Dados inválidos", 400);
            }

            $conexao = Conexao::getConexao();
            // executa a procedure que já trata transação internamente
            $sql = $conexao->prepare("CALL RealizarCompra(?, ?, ?)");
            $sql->execute([$id_conta, $id_sessao, $quantidade_ingressos]);

            return true;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function update($id, $id_conta, $id_sessao, $quantidade_ingressos) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Compra não encontrada", 404);
            }
            if ($id_conta !== null && !validarId($id_conta)) {
                throw new Exception("ID da conta inválido", 400);
            }
            if (!validarId($id_sessao)) {
                throw new Exception("ID da sessão inválido", 400);
            }
            if (!validarQuantidadeIngressos($quantidade_ingressos)) {
                throw new Exception("Quantidade de ingressos inválida", 400);
            }

            $conexao = Conexao::getConexao();
            $conexao->beginTransaction();

            // Recupera dados da compra anterior
            $sql = $conexao->prepare("SELECT id_sessao, quantidade_ingressos FROM compra WHERE id_compra = ?");
            $sql->execute([$id]);
            $compraAnterior = $sql->fetch(PDO::FETCH_ASSOC);
            if (!$compraAnterior) {
                throw new Exception("Compra original não encontrada", 404);
            }

            $sessaoAntiga = $compraAnterior['id_sessao'];
            $quantAnterior = $compraAnterior['quantidade_ingressos'];

            // Reembolsa ingressos na sessão antiga
            $sql = $conexao->prepare("UPDATE sessao SET ingressos_disponiveis = ingressos_disponiveis + ? WHERE id_sessao = ?");
            $sql->execute([$quantAnterior, $sessaoAntiga]);

            // Verifica disponibilidade na nova sessão
            $sql = $conexao->prepare("SELECT ingressos_disponiveis FROM sessao WHERE id_sessao = ?");
            $sql->execute([$id_sessao]);
            $sessao = $sql->fetch(PDO::FETCH_ASSOC);
            if (!$sessao) {
                throw new Exception("Sessão não encontrada", 404);
            }
            if ($sessao['ingressos_disponiveis'] < $quantidade_ingressos) {
                throw new Exception("Ingressos insuficientes para completar a alteração da compra", 400);
            }

            // Debita ingressos da nova sessão e atualiza a compra
            $sql = $conexao->prepare("UPDATE sessao SET ingressos_disponiveis = ingressos_disponiveis - ? WHERE id_sessao = ?");
            $sql->execute([$quantidade_ingressos, $id_sessao]);

            $sql = $conexao->prepare("UPDATE compra SET id_conta = ?, id_sessao = ?, quantidade_ingressos = ? WHERE id_compra = ?");
            $sql->execute([$id_conta, $id_sessao, $quantidade_ingressos, $id]);

            $conexao->commit();
            return true;
        } catch (Exception $e) {
            if ($conexao->inTransaction()) {
                $conexao->rollBack();
            }
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function delete($id) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Compra não encontrada", 404);
            }

            $conexao = Conexao::getConexao();
            $conexao->beginTransaction();

            // Recupera quantidade e sessão antes de excluir
            $sql = $conexao->prepare("SELECT id_sessao, quantidade_ingressos FROM compra WHERE id_compra = ?");
            $sql->execute([$id]);
            $compra = $sql->fetch(PDO::FETCH_ASSOC);

            // Restaura ingressos na sessão
            $sql = $conexao->prepare("UPDATE sessao SET ingressos_disponiveis = ingressos_disponiveis + ? WHERE id_sessao = ?");
            $sql->execute([$compra['quantidade_ingressos'], $compra['id_sessao']]);

            // Exclui a compra
            $sql = $conexao->prepare("DELETE FROM compra WHERE id_compra = ?");
            $sql->execute([$id]);

            $conexao->commit();
            return true;
        } catch (Exception $e) {
            if ($conexao->inTransaction()) {
                $conexao->rollBack();
            }
            output(500, ["msg" => $e->getMessage()]);
        }
    }
}
