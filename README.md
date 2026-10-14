### Estágio atual — Front-end (painel web)

- Interfaces em **HTML5, CSS3 e JavaScript puro** (sem framework e sem etapa de build), com **Chart.js 4.4.1 embutido no projeto** — os gráficos funcionam sem internet, o que garante a demonstração na apresentação.
- **Autenticação e sessão**: tela de login consumindo o `POST /api/auth/login`; o token JWT fica na sessão do navegador, é enviado como `Authorization: Bearer` em todas as requisições e é descartado no logout; sessão expirada (401) redireciona para o login.
- **Perfis de acesso na interface**: os botões de criar/editar configurações aparecem apenas para administrador e o encerramento de alerta inclui o técnico — sempre sabendo que a autorização real é feita pela API.
- **Tratamento amigável de erros**: 401 volta ao login, 403 mostra "acesso negado", 429 pede para aguardar e 500 mostra mensagem genérica (detalhe técnico apenas no console). A interface nunca exibe `token_hash` nem `senha_hash`.
- **Cinco telas, em navegação por hash**:
  - *Visão geral*: cartões com total de salas, salas online/offline, consumo do dia, alertas abertos, maior potência e qualidade média do sinal, além da lista de alertas abertos;
  - *Salas*: lista (status, potência atual, consumo do dia, funcionamento, capacidade e alertas abertos) e detalhe da sala com dados do dispositivo, sensores, alertas, configurações e dois gráficos (potência das últimas leituras e energia por hora);
  - *Alertas*: filtros por sala, gravidade, status e tipo, com destaque visual para alertas abertos e ação de encerramento;
  - *Configuração de alertas*: listagem com nomes amigáveis das regras R1 a R8, limite com unidade, persistência, buzzer e status; criação/edição em formulário e ativação/desativação;
  - *Relatórios*: geração por sala, tipo e período, com histórico e detalhe exibindo consumo total, anomalias e picos de consumo.
- A interface **já lê os campos novos da API** (consumo diário e mensal, pico de potência, alertas abertos por sala e sensores) — eles aparecem automaticamente, sem alteração no front.
- Valores e datas formatados em português, sempre com unidade (W, kWh, s, %); a URL da API fica centralizada em um único arquivo de configuração.
- Documentação de execução (Live Server), estrutura dos arquivos e solução de problemas no README do front-end.


## Estágio atual — API e banco de dados

### Banco de dados (MySQL + Sequelize)

- Schema completo com **11 tabelas** (`sala`, `dispositivo`, `sensor`, `atuador`, `leitura`, `estado_porta`, `calibracao`, `configuracao_alerta`, `alerta`, `usuario`, `relatorio`), criado e versionado por **migrations** do Sequelize, com chaves estrangeiras e regras de exclusão (`CASCADE`, `SET NULL`, `RESTRICT`).
- **Índices** para as consultas mais frequentes: `leitura(id_sensor, timestamp)`, `leitura(timestamp)`, `estado_porta(id_sensor, timestamp)`, `dispositivo(ultimo_contato)`, `alerta(status)`, `alerta(id_sala, status)` e `configuracao_alerta(id_sala, status)`.
- **Seeders** para demonstração: 2 salas, 2 dispositivos ESP32, 4 sensores (sensor de corrente SCT-013 e reed switch por sala), 2 atuadores (buzzer), 40 leituras (20 por sala), estados de porta, 9 configurações de alerta (R1 a R8, incluindo R3A/R3B) e usuário administrador.
- Modelo de autenticação de dispositivo: cada dispositivo tem `token_hash` (SHA-256) e `intervalo_envio_segundos`; o token puro nunca é armazenado.
- O banco é **reprodutível do zero** com `db:migrate` + `db:seed:all`.

### API (Node.js + Express + Sequelize)

- API REST em JSON, com **autenticação dupla**: usuários por **JWT** (senha com bcrypt, expiração de 8h) e dispositivos por **token próprio** (gerado com `crypto`, armazenado apenas como hash SHA-256, exibido uma única vez, com endpoints de geração e revogação).
- **Perfis de acesso**: rotas de escrita restritas a administrador (configurações de alertas, dispositivos) e encerramento de alertas também para técnico.
- **Validação de entrada com Zod** em todas as rotas com corpo, tratamento de erros centralizado e códigos HTTP padronizados (400, 401, 403, 404, 429, 500, 503).
- **Limite de requisições**: login (10 por 15 min) e envio de leituras (120 por minuto).
- **Endpoints implementados**: teste de conexão; login; salas (lista e consumo por hora com filtro de data); dispositivos (listar, cadastrar, gerar/revogar token); leituras (envio pelo ESP32 e consultas com filtros e paginação); alertas (listar com filtros de status, gravidade, tipo, sala e período; buscar; encerrar); configurações de alertas (listar, criar, editar, ativar/desativar); relatórios (gerar, listar, detalhar).
- `GET /api/salas` devolve, por sala: dados cadastrais, status online/offline do dispositivo, último estado da porta, **consumo do dia e do mês**, **pico de potência do dia**, **contagem de alertas abertos** e a **lista de sensores**.
- **Regras de anomalia R1 a R8 implementadas**: R1, R2, R3A, R3B, R4, R5, R6 e R8 são avaliadas na ingestão de cada leitura; R7 (dispositivo offline) em verificação periódica a cada 30 segundos.
- **Ciclo de vida dos alertas** `PENDENTE → ABERTO → FECHADO`, com tempo de persistência configurável por regra (o alerta só "abre" se a condição se mantiver pelo tempo configurado).
- **Controle do buzzer** pelo retorno do próprio `POST /api/leituras` (campo `comandos`), em modelo **baseado em estado** reafirmado a cada leitura — tolerante a perda de pacotes — com supressão automática do buzzer da R3A quando a R3B dispara.
- **Relatórios**: consumo total do período, picos de consumo (10 maiores potências por hora) e contagem de anomalias, com histórico persistido.
- **Testes automatizados** (`node:test`): unitários e de integração cobrindo as regras R1 a R6 e R8, o ciclo de persistência de alertas, os filtros de alertas e as agregações de salas/sensores.

### Em desenvolvimento — API e banco de dados

- **Histórico de calibração dos sensores**: a tabela e o modelo já existem; faltam as rotas e o serviço para registrar calibrações e aplicar o fator de correção nas leituras.
- **Notificações automáticas**: o campo `acao_automatica` é armazenado, mas nenhuma ação é executada — não há envio de avisos (e-mail ou push) implementado.
- **Geração de arquivo de relatório (PDF/CSV)** e **cálculo de custo estimado**: hoje os relatórios registram consumo total, picos e anomalias, mas sem arquivo gerado (campos `arquivo_path` e `custo_estimado` ficam vazios).
- **Endurecimento de segurança para implantação**: restrição das origens permitidas na API (hoje o CORS está liberado, adequado apenas para desenvolvimento).


