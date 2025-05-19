# Gerenciamento de Cinema (Projeto CineChandon)

## Índice

- [Visão Geral](#visão-geral)  
- [Pré-requisitos](#pré-requisitos)  
- [Instalação](#instalação)  
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)  
- [Estrutura do Projeto](#estrutura-do-projeto)  
- [Endpoints da API](#endpoints-da-api)  
- [Front-end](#front-end)  
- [Uso](#uso)  
- [Considerações Finais](#considerações-finais)  

---

## Visão Geral

Este projeto é um sistema de gerenciamento de sessões de cinema, contendo:

- **Back-end** em PHP (estrutura com PDO/MySQL).  
- **Front-end** com HTML, CSS e JavaScript (uso de localStorage + chamadas AJAX à API).  
- Gerenciamento de **gêneros**, **filmes**, **sessões**, **contas** e **compras**.

Ideal para rodar localmente com **XAMPP** (Apache + MySQL + PHP).

---

## Pré-requisitos

- XAMPP instalado (versão PHP ≥ 7.2).  
- Git (opcional) para clonar o repositório.  
- Navegador moderno (Chrome, Firefox, Edge etc.).  

---

## Instalação

1. **Clone** ou **copie** a pasta do projeto para o diretório de htdocs do XAMPP:  
   ```bash
   C:\xampp\htdocs\webservice

2. Abra o **XAMPP Control Panel** e inicie os módulos:

   * Apache
   * MySQL

3. Acesse o **phpMyAdmin** em `http://localhost/phpmyadmin` para configurar o banco de dados.

## Configuração do Banco de Dados

1. No phpMyAdmin, crie um database chamado `cinechandon`.
2. Com o `cinechandon` selecionado, vá em **SQL** e cole o script abaixo para criar tabelas e procedure:

```sql
-- Criação do banco de dados
DROP DATABASE IF EXISTS cinechandon;
CREATE DATABASE cinechandon;
USE cinechandon;

-- Criando a tabela genero
CREATE TABLE genero (
    id_genero INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo os gêneros
INSERT INTO genero (nome) VALUES
('Sem Gênero'),
('Ação'),
('Comédia'),
('Drama'),
('Terror'),
('Aventura'),
('Ficção Científica'),
('Romance'),
('Fantasia'),
('Suspense'),
('Musical');

-- Criando a tabela filme
CREATE TABLE filme (
    id_filme INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    duracao INT NOT NULL,
    sinopse TEXT NOT NULL,
    data_lancamento DATE NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criando a tabela filme_genero
CREATE TABLE filme_genero (
    id_filme_genero INT AUTO_INCREMENT PRIMARY KEY,
    id_filme INT NOT NULL,
    id_genero INT NOT NULL,
    FOREIGN KEY (id_filme) REFERENCES filme(id_filme),
    FOREIGN KEY (id_genero) REFERENCES genero(id_genero)
);

-- Criando a tabela sessao
CREATE TABLE sessao (
    id_sessao INT AUTO_INCREMENT PRIMARY KEY,
    id_filme INT NOT NULL,
    horario DATETIME NOT NULL,
    quantidade_maxima_ingressos INT NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_filme) REFERENCES filme(id_filme) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criando a tabela conta
CREATE TABLE conta (
    id_conta INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha CHAR(60) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    data_nascimento DATE NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criando a tabela compra
CREATE TABLE compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_conta INT NULL,
    id_sessao INT NOT NULL,
    quantidade_ingressos INT NOT NULL,
    data_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta) REFERENCES conta(id_conta) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_sessao) REFERENCES sessao(id_sessao) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Inserindo dados na tabela filme
INSERT INTO filme (titulo, duracao, sinopse, data_lancamento) VALUES
('Vingadores: Ultimato', 181, 'Os Vingadores enfrentam Thanos.', '2019-04-26'),
('O Rei Leão', 118, 'Simba, um jovem leão, herda o reino.', '1994-06-24'),
('Titanic', 195, 'Um romance a bordo do Titanic.', '1997-12-19'),
('Corra!', 104, 'Um jovem negro visita a família de sua namorada branca.', '2017-02-24'),
('Star Wars: Episódio IV', 121, 'Luke Skywalker junta-se à Aliança Rebelde.', '1977-05-25'),
('Matrix', 136, 'Neo descobre a verdade sobre a realidade.', '1999-03-31'),
('Orgulho e Preconceito', 129, 'Uma jovem enfrenta os desafios do amor e da sociedade.', '2005-09-16'),
('O Senhor dos Anéis: A Sociedade do Anel', 178, 'Frodo deve destruir o Anel.', '2001-12-19'),
('O Silêncio dos Inocentes', 118, 'Uma jovem agente do FBI pede ajuda a Hannibal Lecter.', '1991-02-14'),
('La La Land', 128, 'Um músico e uma atriz se apaixonam em Los Angeles.', '2016-12-09');

-- Inserindo dados na tabela filme_genero
INSERT INTO filme_genero (id_filme, id_genero) VALUES
(1, 1),  -- Vingadores: Ultimato -> Ação
(1, 5),  -- Vingadores: Ultimato -> Aventura
(2, 5),  -- O Rei Leão -> Aventura
(2, 3),  -- O Rei Leão -> Drama
(3, 3),  -- Titanic -> Drama
(3, 7),  -- Titanic -> Romance
(4, 4),  -- Corra! -> Terror
(4, 9),  -- Corra! -> Suspense
(5, 6),  -- Star Wars: Episódio IV -> Ficção Científica
(5, 5),  -- Star Wars: Episódio IV -> Aventura
(6, 6),  -- Matrix -> Ficção Científica
(6, 9),  -- Matrix -> Suspense
(7, 7),  -- Orgulho e Preconceito -> Romance
(7, 3),  -- Orgulho e Preconceito -> Drama
(8, 8),  -- O Senhor dos Anéis: A Sociedade do Anel -> Fantasia
(8, 5),  -- O Senhor dos Anéis: A Sociedade do Anel -> Aventura
(9, 9),  -- O Silêncio dos Inocentes -> Suspense
(9, 4),  -- O Silêncio dos Inocentes -> Terror
(10, 10), -- La La Land -> Musical
(10, 7);  -- La La Land -> Romance

-- Inserindo dados na tabela sessao
INSERT INTO sessao (id_filme, horario, quantidade_maxima_ingressos) VALUES
(1, '2025-05-14 14:00:00', 50),
(2, '2025-05-14 16:00:00', 45),
(3, '2025-05-14 18:00:00', 60),
(4, '2025-05-14 20:00:00', 40),
(5, '2025-05-14 22:00:00', 55),
(6, '2025-05-15 14:00:00', 50),
(7, '2025-05-15 16:00:00', 45),
(8, '2025-05-15 18:00:00', 60),
(9, '2025-05-15 20:00:00', 40),
(10, '2025-05-15 22:00:00', 55);

ALTER TABLE sessao ADD COLUMN ingressos_disponiveis INT NOT NULL;

UPDATE sessao SET ingressos_disponiveis = 48
WHERE id_filme = 1;
UPDATE sessao SET ingressos_disponiveis = 44
WHERE id_filme = 2;
UPDATE sessao SET ingressos_disponiveis = 57
WHERE id_filme = 3;
UPDATE sessao SET ingressos_disponiveis = 38
WHERE id_filme = 4;
UPDATE sessao SET ingressos_disponiveis = 50
WHERE id_filme = 5;
UPDATE sessao SET ingressos_disponiveis = 46
WHERE id_filme = 6;
UPDATE sessao SET ingressos_disponiveis = 42
WHERE id_filme = 7;
UPDATE sessao SET ingressos_disponiveis = 58
WHERE id_filme = 8;
UPDATE sessao SET ingressos_disponiveis = 39
WHERE id_filme = 9;
UPDATE sessao SET ingressos_disponiveis = 53
WHERE id_filme = 10;

-- Inserindo dados na tabela conta
INSERT INTO conta (nome, email, senha, cpf, data_nascimento) VALUES
('João Silva',      'joao.silva@gmail.com',      '$2y$10$SoXEqMvda/A1pVyQHqXvQO42ICSBsXjq.BGz6fAz8Gm89NxXlJ93S', '529.982.247-25', '1990-01-15'),
('Maria Souza',     'maria.souza@gmail.com',     '$2y$10$A1eYpMvxa/91XzQvRvYpAQ42JDNTAXkp.CDZ6uAl2Em67AxToK32D', '762.807.785-73', '1985-07-23');

-- Inserindo dados na tabela compra
INSERT INTO compra (id_conta, id_sessao, quantidade_ingressos) VALUES
(1, 1, 2),
(2, 2, 1),
(1, 3, 3),
(1, 4, 2),
(2, 5, 5),
(1, 6, 4),
(1, 7, 3),
(2, 8, 2),
(2, 9, 1),
(1, 10, 2);

-- Procedure para verificar se o ID do gênero existe
DELIMITER //
CREATE OR REPLACE PROCEDURE VerificarGeneroExistente(IN genero_id INT)
BEGIN
    DECLARE genero_count INT;
    SELECT COUNT(*) INTO genero_count FROM genero WHERE id_genero = genero_id;
    IF genero_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gênero não encontrado';
    END IF;
END//
DELIMITER ;

-- Procedure para cadastrar filme com transação e verificação de gêneros
DELIMITER //
CREATE OR REPLACE PROCEDURE CadastrarFilme(
    IN titulo VARCHAR(255),
    IN duracao INT,
    IN sinopse TEXT,
    IN data_lancamento DATE,
    IN generos JSON
)
BEGIN
    DECLARE genero_id INT;
    DECLARE i INT DEFAULT 0;
    DECLARE genero_count INT;
    DECLARE filme_id INT;

    START TRANSACTION;

    INSERT INTO filme (titulo, duracao, sinopse, data_lancamento)
    VALUES (titulo, duracao, sinopse, data_lancamento);

    SET filme_id = LAST_INSERT_ID();

    SET genero_count = JSON_LENGTH(generos);

    IF genero_count = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Pelo menos um gênero deve ser informado para cadastrar o filme';
    END IF;

    WHILE i < genero_count DO
        SET genero_id = JSON_UNQUOTE(JSON_EXTRACT(generos, CONCAT('$[', i, ']')));

        CALL VerificarGeneroExistente(genero_id);

        INSERT INTO filme_genero (id_filme, id_genero) VALUES (filme_id, genero_id);

        SET i = i + 1;
    END WHILE;

    COMMIT;
END//
DELIMITER ;

-- Procedure para atualizar filme com transação e verificação de gêneros
DELIMITER //
CREATE OR REPLACE PROCEDURE AtualizarFilme(
    IN filme_id INT,
    IN titulo VARCHAR(255),
    IN duracao INT,
    IN sinopse TEXT,
    IN data_lancamento DATE,
    IN generos JSON
)
BEGIN
    DECLARE genero_id INT;
    DECLARE i INT DEFAULT 0;
    DECLARE genero_count INT;

    START TRANSACTION;

    UPDATE filme 
    SET titulo = titulo, 
        duracao = duracao, 
        sinopse = sinopse, 
        data_lancamento = data_lancamento 
    WHERE id_filme = filme_id;

    DELETE FROM filme_genero WHERE id_filme = filme_id;

    SET genero_count = JSON_LENGTH(generos);

    IF genero_count = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Pelo menos um gênero deve ser informado para atualizar o filme';
    END IF;

    WHILE i < genero_count DO
        SET genero_id = JSON_UNQUOTE(JSON_EXTRACT(generos, CONCAT('$[', i, ']')));

        CALL VerificarGeneroExistente(genero_id);

        INSERT INTO filme_genero (id_filme, id_genero) VALUES (filme_id, genero_id);

        SET i = i + 1;
    END WHILE;

    COMMIT;
END//
DELIMITER ;

-- Procedure para excluir filme com transação e atualizações
DELIMITER //
CREATE OR REPLACE PROCEDURE ExcluirFilme(IN filme_id INT)
BEGIN

    START TRANSACTION;

    DELETE FROM filme WHERE id_filme = filme_id;

    DELETE FROM filme_genero WHERE id_filme = filme_id;

    COMMIT;
END//
DELIMITER ;

-- Procedure que realiza a compra e faz a atualização dos ingressos disponíveis na sessão

DELIMITER //
CREATE OR REPLACE PROCEDURE RealizarCompra(
    IN conta_id INT,
    IN sessao_id INT,
    IN quantidade_ingressos INT
)
BEGIN
    DECLARE ingressos_restantes INT;

    START TRANSACTION;

    SELECT ingressos_disponiveis INTO ingressos_restantes
    FROM sessao
    WHERE id_sessao = sessao_id;

    IF ingressos_restantes >= quantidade_ingressos THEN
        UPDATE sessao
        SET ingressos_disponiveis = ingressos_disponiveis - quantidade_ingressos
        WHERE id_sessao = sessao_id;

        INSERT INTO compra (id_conta, id_sessao, quantidade_ingressos)
        VALUES (conta_id, sessao_id, quantidade_ingressos);

        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ingressos insuficientes para completar a compra';
    END IF;
END//
DELIMITER ;

-- Procedure que edita a compra e faz a atualização dos ingressos disponíveis na sessão

DELIMITER //
CREATE OR REPLACE PROCEDURE AtualizarCompra(
    IN compra_id INT,
    IN nova_quantidade_ingressos INT
)
BEGIN
    DECLARE quantidade_atual INT;
    DECLARE quantidade_diferenca INT;
    DECLARE ingressos_restantes INT;
    DECLARE sessao_id INT;

    START TRANSACTION;

    SELECT quantidade_ingressos, id_sessao INTO quantidade_atual, sessao_id
    FROM compra
    WHERE id_compra = compra_id;

    SELECT ingressos_disponiveis INTO ingressos_restantes
    FROM sessao
    WHERE id_sessao = sessao_id;

    IF nova_quantidade_ingressos > ingressos_restantes THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ingressos insuficientes para completar a alteração da compra';
    ELSE
        SET quantidade_diferenca = nova_quantidade_ingressos - quantidade_atual;

        UPDATE sessao
        SET ingressos_disponiveis = ingressos_disponiveis - quantidade_diferenca
        WHERE id_sessao = sessao_id;

        UPDATE compra
        SET quantidade_ingressos = nova_quantidade_ingressos
        WHERE id_compra = compra_id;

        COMMIT;
    END IF;

END//
DELIMITER ;

-- Procedure para criar sessão

DELIMITER //
CREATE OR REPLACE PROCEDURE CriarSessao(
    IN nova_sessao_id INT,
    IN nova_quantidade_maxima_ingressos INT
)
BEGIN
    START TRANSACTION;

    INSERT INTO sessao (id_sessao, quantidade_maxima_ingressos, ingressos_disponiveis)
    VALUES (nova_sessao_id, nova_quantidade_maxima_ingressos, nova_quantidade_maxima_ingressos);

    COMMIT;
END//
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE AtualizarSessao(
    IN p_id_sessao INT,
    IN p_id_filme INT,
    IN p_horario DATETIME,
    IN p_quantidade_maxima_ingressos INT,
    IN p_ingressos_disponiveis INT
)
BEGIN
    DECLARE ingressos_disponiveis_atual INT;

    SELECT ingressos_disponiveis INTO ingressos_disponiveis_atual
    FROM sessao
    WHERE id_sessao = p_id_sessao;

    IF p_quantidade_maxima_ingressos >= ingressos_disponiveis_atual THEN
        UPDATE sessao
        SET id_filme = p_id_filme,
            horario = p_horario,
            quantidade_maxima_ingressos = p_quantidade_maxima_ingressos,
            ingressos_disponiveis = p_ingressos_disponiveis
        WHERE id_sessao = p_id_sessao;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Quantidade máxima de ingressos não pode ser menor que a quantidade de ingressos disponíveis';
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE ExcluirGenero(IN p_id_genero INT)
BEGIN
    DECLARE genero_em_uso INT;

    SELECT COUNT(*) INTO genero_em_uso
    FROM filme_genero
    WHERE id_genero = p_id_genero;

    IF genero_em_uso > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Este gênero está associado a um ou mais filmes e não pode ser excluído.';
    END IF;

    DELETE FROM genero WHERE id_genero = p_id_genero;
END//
DELIMITER ;
```
3. Verifique em `webservice/configs/Database.php` se as credenciais (host, usuário, senha) correspondem ao seu XAMPP:

   * **Padrão XAMPP**: usuário `root`, senha em branco (`''`), host `localhost`.

## Estrutura do Projeto

```text
webservice/
├── configs/           # Conexão PDO e funções utilitárias
│   ├── Database.php
│   └── utils.php
├── controller/        # Endpoints RESTful (GET/POST/PUT/DELETE)
│   ├── genero.php
│   ├── filme.php
│   ├── sessao.php
│   ├── conta.php
│   ├── compra.php
│   └── login.php
├── model/             # Classes de acesso a dados (DAO)
│   ├── Genero.php
│   ├── Filme.php
│   ├── Filme_genero.php
│   ├── Sessao.php
│   ├── Conta.php
│   ├── Compra.php
│   └── Login.php
├── view/              # Front-end estático
│   ├── *.html
│   └── js/            # Scripts JavaScript para interações
└── index.html         # Página de entrada (ou redirecionamento)
```

## Front-end

* Acesse via navegador em:

  ```
  http://localhost/webservice/view/home.html
  ```
  
* Scripts principais em `view/js/`:

  * `scriptGeneros.js` → gerenciamento de gêneros
  * `scriptFilme.js`, `scriptFilmeGenero.js` → filmes e categorias
  * `scriptSessoes.js` → gerenciamento de sessões
  * `scriptConta.js`, `scriptGerenciarConta.js` → perfis de usuário
  * `scriptCompra.js` → fluxo de compra de ingressos
  * `sessionManager.js` → controle de autenticação

## Uso

1. **Inicie** Apache e MySQL no XAMPP.
2. **Abra** no navegador a página `home.html`:

   ```
   http://localhost/webservice/view/home.html
   ```

3. **Cadastre** gêneros, filmes, sessões e crie contas.
4. Simule **compra de ingressos** e observe o controle de disponibilidade.

## Considerações Finais

* Para ajustar a conexão ao banco, edite `configs/Database.php`.
* Para **debug** de requisições, use o console do navegador ou o log de erros do PHP.
* Novas features podem ser adicionadas criando controladores e modelos seguindo o padrão existente.
