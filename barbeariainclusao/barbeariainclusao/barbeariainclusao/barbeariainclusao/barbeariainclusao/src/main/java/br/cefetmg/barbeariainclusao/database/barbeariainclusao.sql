-- ============================================
-- 📋 DDL - Criação de Tabelas
-- ============================================

CREATE TABLE barbearia (
    id_barbearia BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_barbearia VARCHAR(100) NOT NULL,
    endereco_barbearia VARCHAR(200),
    descricao_barbearia VARCHAR(255),
    senha_barbearia VARCHAR(100),
    email_barbearia VARCHAR(100),
    foto_barbearia LONGBLOB,
    latitude DOUBLE,
    longitude DOUBLE
);

CREATE TABLE barbeiro (
    id_barbeiro BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_barbeiro VARCHAR(100) NOT NULL,
    email_barbeiro VARCHAR(100) NOT NULL,
    senha_barbeiro VARCHAR(100) NOT NULL,
    telefone_barbeiro VARCHAR(20),
    descricao_barbeiro VARCHAR(255),
    foto_barbeiro VARCHAR(255),
    id_barbearia_barbeiro BIGINT,
    FOREIGN KEY (id_barbearia_barbeiro) REFERENCES barbearia(id_barbearia)
);

CREATE TABLE servico (
    id_servico BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_servico VARCHAR(100) NOT NULL,
    descricao_servico VARCHAR(255),
    preco_servico DOUBLE,
    id_barbearia_servico BIGINT,
    id_barbeiro_servico BIGINT,
    FOREIGN KEY (id_barbearia_servico) REFERENCES barbearia(id_barbearia),
    FOREIGN KEY (id_barbeiro_servico) REFERENCES barbeiro(id_barbeiro)
);

CREATE TABLE caracteristica (
    id_caracteristica BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_caracteristica VARCHAR(100) NOT NULL UNIQUE,
    descricao_caracteristica VARCHAR(255)
);

CREATE TABLE barbearia_caracteristica (
    id_barbearia BIGINT NOT NULL,
    id_caracteristica BIGINT NOT NULL,
    possui BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_barbearia, id_caracteristica),
    FOREIGN KEY (id_barbearia) REFERENCES barbearia(id_barbearia) ON DELETE CASCADE,
    FOREIGN KEY (id_caracteristica) REFERENCES caracteristica(id_caracteristica) ON DELETE CASCADE
);

CREATE TABLE tag (
    id_tag BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_tag VARCHAR(100) NOT NULL UNIQUE,
    descricao_tag VARCHAR(255)
);

CREATE TABLE barbeiro_tag (
    id_barbeiro BIGINT NOT NULL,
    id_tag BIGINT NOT NULL,
    possui BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_barbeiro, id_tag),
    FOREIGN KEY (id_barbeiro) REFERENCES barbeiro(id_barbeiro) ON DELETE CASCADE,
    FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE
);

CREATE TABLE usuario (
    id_usuario BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(100) NOT NULL UNIQUE,
    telefone_usuario VARCHAR(20),
    senha_usuario VARCHAR(100) NOT NULL,
    foto_usuario VARCHAR(255)
);

ALTER TABLE usuario
MODIFY COLUMN foto_usuario LONGTEXT;

SET GLOBAL max_allowed_packet = 67108864;

CREATE TABLE atendimento (
    id_atendimento BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_atendimento BIGINT NOT NULL,
    id_barbeiro_atendimento BIGINT NOT NULL,
    id_servico_atendimento BIGINT NOT NULL,
    data_atendimento DATE NOT NULL,
    hora_atendimento TIME NOT NULL,
    status_atendimento VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_usuario_atendimento) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_barbeiro_atendimento) REFERENCES barbeiro(id_barbeiro),
    FOREIGN KEY (id_servico_atendimento) REFERENCES servico(id_servico)
);

CREATE TABLE avaliacao (
    id_avaliacao BIGINT PRIMARY KEY AUTO_INCREMENT,
    nota INT NOT NULL,
    comentario TEXT,
    id_atendimento_avaliacao BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_atendimento_avaliacao 
        FOREIGN KEY (id_atendimento_avaliacao) 
        REFERENCES atendimento(id_atendimento) 
        ON DELETE CASCADE
);

CREATE TABLE solicitacao (
    id_solicitacao BIGINT PRIMARY KEY AUTO_INCREMENT,

    id_barbeiro_destinatario BIGINT NOT NULL,
    id_barbearia_remetente BIGINT NOT NULL,

    estado_solicitacao VARCHAR(20) NOT NULL,

    -- Relacionamentos
    FOREIGN KEY (id_barbeiro_destinatario)
        REFERENCES barbeiro(id_barbeiro)
        ON DELETE CASCADE,

    FOREIGN KEY (id_barbearia_remetente)
        REFERENCES barbearia(id_barbearia)
        ON DELETE CASCADE
);

CREATE TABLE barbeiro_barbearia (
    id_barbeiro BIGINT NOT NULL,
    id_barbearia BIGINT NOT NULL,
    PRIMARY KEY (id_barbeiro, id_barbearia),
    FOREIGN KEY (id_barbeiro) REFERENCES barbeiro(id_barbeiro) ON DELETE CASCADE,
    FOREIGN KEY (id_barbearia) REFERENCES barbearia(id_barbearia) ON DELETE CASCADE
);

-- ============================================
-- 📦 DML - Inserção de Dados de Teste
-- ============================================

-- 1. Barbearias
INSERT INTO barbearia (id_barbearia, nome_barbearia, endereco_barbearia, descricao_barbearia, senha_barbearia, email_barbearia, latitude, longitude) VALUES
(6, 'The Vintage Cut', 'Rua A, 100', 'Barbearia clássica com foco em atendimento personalizado.', 'senha123', 'vintage@barbearia.com', -19.9167, -43.9345),
(7, 'Barbearia Inclusiva', 'Av. Principal, 50', 'Focada em acessibilidade e atendimento para todas as necessidades.', 'senha123', 'inclusiva@barbearia.com', -19.8900, -43.9100);

-- 2. Barbeiros (GARANTINDO IDs 1, 2 e 3)
INSERT INTO barbeiro (id_barbeiro, nome_barbeiro, email_barbeiro, senha_barbeiro, telefone_barbeiro, descricao_barbeiro, id_barbearia_barbeiro) VALUES
(1, 'Lucas Silva', 'lucas@vintage.com', 'barbeiro1', '31987654321', 'Especialista em barba e navalha.', 6),
(2, 'Pedro Especialista', 'pedro@vintage.com', 'barbeiro2', '31998765432', 'Cortes modernos e degradê.', 6),
(3, 'João Ferreira', 'joao@vintage.com', 'barbeiro3', '31991234567', 'Experiência em todos os tipos de cabelo.', 6),
(4, 'Mariana Oliveira', 'mariana@inclusiva.com', 'barbeiro4', '31976543210', 'Atendimento focado em clientes com TDAH.', 7),
(5, 'José Santos', 'jose@inclusiva.com', 'barbeiro5', '31965432109', 'Libras e comunicação alternativa.', 7);

-- 3. Serviços
INSERT INTO servico (id_servico, nome_servico, descricao_servico, preco_servico, id_barbearia_servico, id_barbeiro_servico) VALUES
(1, 'Corte Clássico', 'Corte social ou executivo.', 50.00, 6, 1),
(2, 'Corte Moderno', 'Corte com degradê e acabamento detalhado.', 55.00, 6, 2),
(3, 'Barba à Navalha', 'Modelagem e acabamento com toalha quente.', 45.00, 6, 3),
(4, 'Corte Silencioso', 'Corte com uso mínimo de equipamentos barulhentos.', 60.00, 7, 4),
(5, 'Corte Inclusivo', 'Tempo extra e atenção dedicada para clientes com TEA/TDAH.', 75.00, 7, 5);

-- 4. Características
INSERT INTO caracteristica (nome_caracteristica, descricao_caracteristica) VALUES
('Rampa de Acesso', 'Possui rampa de acesso para cadeirantes na entrada.'),
('Banheiro Acessível', 'O banheiro é adaptado para cadeirantes.'),
('Estacionamento Prioritário', 'Vagas de estacionamento reservadas e próximas à entrada.'),
('Iluminação Suave', 'A iluminação do ambiente é mais difusa e não ofuscante.'),
('Música Baixa', 'O volume da música é mantido baixo (ambiente de baixo ruído).'),
('Cadeira Hidráulica Adaptável', 'Possui cadeira de corte com ajuste de altura extra baixo.'),
('Piso Antiderrapante', 'Todo o piso interno e externo é antiderrapante.'),
('Espaço Sensorial', 'Área de espera com estímulos reduzidos ou itens de conforto sensorial.'),
('Bebedouro Adaptado', 'Bebedouro acessível para cadeirantes.'),
('Atendimento por Agendamento', 'Reduz o tempo de espera e a sobrecarga sensorial.');

-- 5. Tags
INSERT INTO tag (nome_tag, descricao_tag) VALUES
('Libras', 'Profissional se comunica em Língua Brasileira de Sinais.'),
('Comunicação Alternativa', 'Uso de pranchas, pictogramas ou escrita para comunicação.'),
('Atendimento TEA/TDAH', 'Treinamento específico para manejo de clientes no espectro autista ou TDAH.'),
('Sensibilidade Tátil', 'Atenção especial à sensibilidade tátil e pressão do toque.'),
('Ambiente Silencioso', 'Capacidade de realizar o serviço em um ambiente com ruído zero.'),
('Descrição de Ações', 'Habilidade de narrar as ações para clientes com deficiência visual.'),
('Cortes Relaxantes', 'Técnicas para cortes mais longos e sem pressa.'),
('Manuseio de Cadeira', 'Habilidade para auxiliar na transferência ou manuseio da cadeira de rodas.'),
('Empatia e Calma', 'Profissional com alto grau de paciência e calma.'),
('Flexibilidade de Tempo', 'Disponibilidade para agendamentos com tempo estendido.');

-- 6. Vínculos de Tag
INSERT INTO barbeiro_tag (id_barbeiro, id_tag, possui) VALUES
(1, 7, TRUE),
(1, 9, TRUE),
(2, 9, TRUE),
(3, 7, TRUE),
(4, 3, TRUE),
(4, 4, TRUE),
(4, 5, TRUE),
(5, 1, TRUE),
(5, 2, TRUE),
(5, 6, TRUE);

-- 7. Características por Barbearia
INSERT INTO barbearia_caracteristica (id_barbearia, id_caracteristica, possui) VALUES
(7, 1, TRUE),
(7, 2, TRUE),
(7, 4, TRUE),
(7, 5, TRUE),
(7, 8, TRUE),
(6, 3, TRUE),
(6, 9, TRUE);

INSERT INTO barbearia (
    id_barbearia,
    nome_barbearia,
    endereco_barbearia,
    descricao_barbearia,
    senha_barbearia,
    email_barbearia,
    latitude,
    longitude,
    foto_barbearia
)
VALUES (
    1,
    'Barbearia do Renan',
    'Rua das Tesouras, 123 - Centro',
    'Especializada em cortes modernos e barbas estilosas',
    'senha123',
    'barbearia@exemplo.com',
    -19.9208,
    -43.9378,
    NULL
);


-- ============================================
-- ✅ GARANTIA FINAL
-- ============================================

-- Assegura que barbeiros 1, 2 e 3 existem
SELECT * FROM barbeiro WHERE id_barbeiro IN (1, 2, 3);
