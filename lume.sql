-- Criação do banco
CREATE DATABASE IF NOT EXISTS lume;
USE lume;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Tabela de eletrodomésticos
CREATE TABLE eletrodomesticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    potencia DECIMAL(5,2) NOT NULL,
    minutos_uso INT NOT NULL,
    consumo_mensal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Inserindo usuários de exemplo
INSERT INTO usuarios (nome, email, senha) VALUES
('Vinicius Assis', 'vinicius@teste.com', '1234'),
('Diego Fernandes', 'diego@teste.com', '1234');

-- Inserindo eletrodomésticos de exemplo
INSERT INTO eletrodomesticos (id_usuario, nome, potencia, minutos_uso, consumo_mensal) VALUES
(1, 'Geladeira', 0.15, 1440, 108.00),
(1, 'TV', 0.10, 120, 6.00),
(2, 'Ar-condicionado', 1.00, 240, 120.00);
