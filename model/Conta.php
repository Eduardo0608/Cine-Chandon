<?php
require_once(__DIR__ . "/../configs/Database.php");
require_once(__DIR__ . "/../configs/utils.php");

class Conta
{
    public static function getById($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM conta WHERE id_conta = ?");
            $sql->execute([$id]);
            return $sql->fetch();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function exist($id) {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT COUNT(*) FROM conta WHERE id_conta = ?");
            $sql->execute([$id]);
            return $sql->fetchColumn() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function listar() {
        try {
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("SELECT * FROM conta");
            $sql->execute();
            return $sql->fetchAll();
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }

    public static function insert($nome, $email, $cpf, $data_nascimento, $senha) {
        try {
            if (empty($nome) || empty($email) || empty($cpf) || empty($data_nascimento) || empty($senha)) {
                throw new Exception("Nome, e-mail, CPF, data de nascimento e senha são obrigatórios", 400);
            }

            $hashedSenha = password_hash($senha, PASSWORD_BCRYPT);
    
            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("INSERT INTO conta (nome, email, cpf, data_nascimento, senha) VALUES (?, ?, ?, ?, ?)");
            $sql->execute([$nome, $email, $cpf, $data_nascimento, $hashedSenha]);
    
            return $sql->rowCount();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['valid' => false, 'message' => 'Já existe uma conta cadastrada com este e-mail.']);
                http_response_code(409);
            } else {
                echo json_encode(['valid' => false, 'message' => $e->getMessage()]);
                http_response_code(500);
            }
            exit;
        } catch (Exception $e) {
            echo json_encode(['valid' => false, 'message' => $e->getMessage()]);
            http_response_code(500);
        }
    }
    

    public static function update($id, $nome, $email, $cpf, $data_nascimento, $senha) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Conta não encontrada", 404);
            }

            if (!empty($senha)) {
                $hashedSenha = password_hash($senha, PASSWORD_BCRYPT);
            } else {
                $hashedSenha = null;
            }
    
            $conexao = Conexao::getConexao();
            if ($hashedSenha) {
                $sql = $conexao->prepare("UPDATE conta SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, senha = ? WHERE id_conta = ?");
                $sql->execute([$nome, $email, $cpf, $data_nascimento, $hashedSenha, $id]);
            } else {
                $sql = $conexao->prepare("UPDATE conta SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_conta = ?");
                $sql->execute([$nome, $email, $cpf, $data_nascimento, $id]);
            }
            
            return $sql->rowCount() > 0 ? $sql->rowCount() : true;
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['valid' => false, 'message' => 'Já existe uma conta cadastrada com este e-mail.']);
                http_response_code(409);
            } else {
                echo json_encode(['valid' => false, 'message' => $e->getMessage()]);
                http_response_code(500);
            }
            exit;
        } catch (Exception $e) {
            echo json_encode(['valid' => false, 'message' => $e->getMessage()]);
            http_response_code($e->getCode() ?: 500);
        }
    }    

    public static function delete($id) {
        try {
            if (!self::exist($id)) {
                throw new Exception("Conta não encontrada", 404);
            }

            $conexao = Conexao::getConexao();
            $sql = $conexao->prepare("DELETE FROM conta WHERE id_conta = ?");
            $sql->execute([$id]);
            return $sql->rowCount() > 0;
        } catch (Exception $e) {
            output(500, ["msg" => $e->getMessage()]);
        }
    }
    
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
