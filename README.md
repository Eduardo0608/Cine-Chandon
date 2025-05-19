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
-- Tabela de Gêneros
CREATE TABLE genero (
  id_genero INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

-- Tabela de Filmes
CREATE TABLE filme (
  id_filme INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  duracao INT NOT NULL,
  diretor VARCHAR(255)
);

-- Tabela de Associação Filme ↔ Gênero
CREATE TABLE filme_genero (
  id_filme INT NOT NULL,
  id_genero INT NOT NULL,
  PRIMARY KEY (id_filme, id_genero),
  FOREIGN KEY (id_filme)  REFERENCES filme(id_filme)  ON DELETE CASCADE,
  FOREIGN KEY (id_genero) REFERENCES genero(id_genero) ON DELETE CASCADE
);

-- Tabela de Sessões
CREATE TABLE sessao (
  id_sessao INT AUTO_INCREMENT PRIMARY KEY,
  id_filme INT NOT NULL,
  horario DATETIME NOT NULL,
  quantidade_maxima_ingressos INT NOT NULL,
  ingressos_disponiveis INT NOT NULL,
  FOREIGN KEY (id_filme) REFERENCES filme(id_filme) ON DELETE CASCADE
);

-- Tabela de Contas de Usuário
CREATE TABLE conta (
  id_conta INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  idade INT,
  endereco VARCHAR(255),
  telefone VARCHAR(50),
  cpf VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL
);

-- Tabela de Compras de Ingressos
CREATE TABLE compra (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  id_conta INT NOT NULL,
  id_sessao INT NOT NULL,
  quantidade_ingressos INT NOT NULL,
  data_compra DATETIME NOT NULL,
  FOREIGN KEY (id_conta)  REFERENCES conta(id_conta)  ON DELETE CASCADE,
  FOREIGN KEY (id_sessao) REFERENCES sessao(id_sessao) ON DELETE CASCADE
);

-- Stored Procedure para exclusão de gênero (usa cascade manual)
DELIMITER //
CREATE PROCEDURE ExcluirGenero(IN generoId INT)
BEGIN
  DELETE FROM filme_genero WHERE id_genero = generoId;
  DELETE FROM genero         WHERE id_genero = generoId;
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

## Endpoints da API

| Recurso | Método                                | URL                           | Função                            |
| ------- | ------------------------------------- | ----------------------------- | --------------------------------- |
| Gêneros | GET                                   | `/controller/genero.php`      | Listar todos                      |
|         | POST                                  | `/controller/genero.php`      | Inserir novo                      |
|         | PUT                                   | `/controller/genero.php?id=X` | Atualizar gênero com `id=X`       |
|         | DELETE                                | `/controller/genero.php?id=X` | Excluir (usa procedure)           |
| Filmes  | GET/POST/PUT/DELETE similar a Gêneros |                               |                                   |
| Sessões | GET/POST/PUT/DELETE similar           |                               |                                   |
| Contas  | GET/POST/PUT/DELETE similar           |                               |                                   |
| Compras | GET/POST/PUT/DELETE similar           |                               |                                   |
| Login   | POST                                  | `/controller/login.php`       | Autenticar usuário (retorna JSON) |

> Consulte os arquivos em `controller/` para parâmetros detalhados.

## Front-end

* Acesse via navegador em:

  ```
  http://localhost/webservice/view/home.html
  ```
* As páginas utilizam **AJAX** (fetch) para consumir os endpoints PHP e **localStorage** para armazenamento de sessão/usuário.
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

3. **Cadastre** gêneros, filmes, sessões e crie contas de usuário.
4. Simule **compra de ingressos** e observe o controle de disponibilidade.

## Considerações Finais

* Para ajustar a conexão ao banco, edite `configs/Database.php`.
* Para **debug** de requisições, use o console do navegador ou o log de erros do PHP.
* Novas features podem ser adicionadas criando controladores e modelos seguindo o padrão existente.

Bom trabalho e bons filmes! 🍿🎬
