<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Login
{
    public static function validarLogin($email, $senha) {
        try {
            if (empty($email) || empty($senha)) {
                throw new Exception("E-mail e senha são obrigatórios", 400);
            }
    
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM conta WHERE email = ?");
            $sql->execute([$email]);
            $conta = $sql->fetch();
    
            if (!$conta) {
                throw new Exception("E-mail ou senha inválidos", 401);
            }
    
            if (!password_verify($senha, $conta['senha'])) {
                throw new Exception("E-mail ou senha inválidos", 401);
            }

            unset($conta['senha']);
            return $conta;
    
        } catch (Exception $e) {
            echo json_encode(['valid' => false, 'message' => $e->getMessage()]);
            http_response_code($e->getCode() ?: 500);
            exit;
        }
    }
}
