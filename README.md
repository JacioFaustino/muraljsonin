# Avisos Acadêmicos

Aplicação web que reúne comunicados, prazos e orientações da comunidade escolar.

**Grupo 01 — Programação para Internet**

- Jacio Faustino
- Erick de Lima
- João Victor

---

## Problema atendido e público beneficiado

Avisos importantes da escola (matrículas, reuniões, prazos de estágio, mudanças de
calendário) costumam circular por murais físicos, grupos de mensagem e bilhetes, o que
dificulta saber **o que é urgente** e **desde quando** o comunicado está valendo.

Esta aplicação centraliza esses comunicados em um portal único, indicando o **setor
responsável**, a **data de publicação** e a **prioridade** de cada aviso. O público
beneficiado é a comunidade escolar: estudantes, responsáveis, professores e os setores
administrativos que publicam os avisos.

## Entidade principal e campos

A entidade é **`Aviso`**, definida em `models/aviso.js` e persistida na tabela `avisos`.

| Campo | Tipo Sequelize | Obrigatório | Finalidade |
|---|---|---|---|
| `id` | INTEGER (chave primária, auto incremento) | sim | Identificador do registro |
| `titulo` | STRING(120) | sim | Identificar o aviso |
| `setor` | STRING(80) | sim | Informar o setor responsável |
| `prioridade` | STRING(10) | sim | Alta, Média ou Baixa |
| `data` | DATEONLY | sim | Data de publicação |
| `mensagem` | TEXT | sim | Comunicado completo |

Validações aplicadas: `notEmpty` em `titulo`, `setor` e `mensagem`, tamanho mínimo de 3
caracteres em `titulo` e `isIn: [["Alta", "Média", "Baixa"]]` em `prioridade`.

## Tecnologias utilizadas

- **Node.js** — execução do servidor
- **Express** — rotas, middlewares e arquivos estáticos
- **express-handlebars** — renderização das páginas no servidor
- **Sequelize** — modelagem e consultas
- **SQLite** — banco de dados em arquivo
- **Supertest + Node Test** — testes automatizados

## Pré-requisitos

- Node.js 18 ou superior (`node -v`)
- NPM (`npm -v`)

## Instalação das dependências

```bash
npm install
```

## Execução do servidor

```bash
npm start
```

A aplicação fica disponível em <http://localhost:3000>. O endereço também é exibido no
terminal ao iniciar. Para desenvolvimento com reinício automático:

```bash
npm run dev
```

A porta pode ser alterada pela variável de ambiente `PORT`.

Na primeira execução, o arquivo `database/avisos.sqlite` é criado automaticamente com
**seis registros iniciais**. A inserção só acontece quando a tabela está vazia, então os
dados **não são duplicados** ao reiniciar o servidor.

## Execução dos testes

```bash
npm test
```

A suíte cobre a página inicial, os destaques vindos do banco, o endpoint de saúde, a
listagem, a ordenação por data, o detalhamento, os campos obrigatórios, os identificadores
inválidos e inexistentes, a página 404 e os arquivos estáticos.

## Rotas disponíveis

| Método e rota | Resposta |
|---|---|
| `GET /` | Página inicial, com três avisos em destaque vindos do banco |
| `GET /saude` | Diagnóstico em JSON: `{ "status": "ok" }` |
| `GET /avisos` | Listagem de todos os avisos, da data mais recente para a mais antiga |
| `GET /avisos/:id` | Detalhamento de um aviso (404 quando o identificador é inválido ou não existe) |
| Rota desconhecida | Página 404 contextualizada |
| Erro interno | Página 500, sem detalhes técnicos para o usuário |

## Organização dos diretórios

```
.
├── app.js                 Configuração do Express, Handlebars, middlewares, rotas e erros
├── server.js              Sincronização do banco, dados iniciais e inicialização
├── package.json
├── package-lock.json
├── README.md
├── models/
│   ├── index.js           Conexão com o SQLite e carregamento do modelo
│   └── aviso.js           Entidade Aviso, campos e validações
├── routes/
│   ├── index.js           Página inicial e endpoint de saúde
│   └── avisos.js          Listagem e detalhamento dos avisos
├── views/
│   ├── layouts/main.hbs
│   ├── partials/componente-avisos-academicos.hbs
│   ├── avisos/listar.hbs
│   ├── avisos/detalhar.hbs
│   ├── index.hbs
│   ├── 404.hbs
│   └── erro.hbs
├── public/
│   ├── images/aviso-academico.svg
│   └── stylesheets/style.css
├── database/
│   └── avisos.sqlite      Criado automaticamente na primeira execução
├── capturas/              Capturas de tela das quatro páginas (entrega)
└── test/app.test.js
```

> A pasta `instrucoes/` reúne o PDF e os wireframes fornecidos pelo professor para o
> desenvolvimento do trabalho.

## Correspondência com os quatro wireframes

| Wireframe | Página da aplicação | O que foi implementado |
|---|---|---|
| Página inicial | `GET /` | Composição dividida: título **Explore os avisos acadêmicos** e texto de boas-vindas à esquerda, área visual emoldurada à direita, botão **Acessar listagem** que conduz a `/avisos` e a seção **Destaques do portal** com três avisos recuperados do banco |
| Listagem | `GET /avisos` | Blocos horizontais, um por aviso, com faixa laranja à esquerda, título, setor, data, selo de prioridade e botão **Abrir**; contador de registros no topo e mensagem de lista vazia |
| Detalhamento | `GET /avisos/:id` | Painel principal à esquerda com barra laranja no topo, os cinco campos separados por linhas e a mensagem completa; painel lateral à direita reforçando a prioridade e botão **Voltar para a lista** fora do painel; trilha de navegação com o identificador |
| Erro 404 | rota desconhecida ou identificador inválido | Cartão central contornado em laranja com o código 404, a mensagem **Aviso indisponível**, explicação do problema com o endereço consultado e botão **Retornar com segurança** para `/avisos` |

## Decisões e adaptações realizadas pelo grupo

- **Entidade renomeada para `Aviso`.** O projeto de referência da Aula 02 tratava de
  publicações do mural; aqui a entidade, os arquivos (`models/aviso.js`,
  `routes/avisos.js`, `views/avisos/`) e os identificadores foram reescritos para o
  domínio de avisos acadêmicos, sem resíduos do projeto original.
- **Ordenação por data decrescente.** O critério de ordenação é a data de publicação, do
  mais recente para o mais antigo. A prioridade define o **indicador visual** (o selo),
  não a ordem da listagem.
- **Selo de prioridade com cor e texto.** Os três níveis (Alta, Média e Baixa) têm cores
  e formatos diferentes, mas sempre acompanhados do texto — a informação de estado não
  depende apenas da cor.
- **Campo `data` como `DATEONLY`.** Como o sistema trabalha com datas de publicação (sem
  horário), esse tipo evita deslocamentos de fuso horário. O helper `formatarData`
  apresenta o valor no formato `dd/mm/aaaa` a partir do texto retornado pelo banco.
- **Consultas com `raw: true`.** O Handlebars não acessa propriedades que ficam no
  protótipo das instâncias do Sequelize; com `raw: true` as consultas devolvem objetos
  simples, que o template consegue ler.
- **Menu sem o item "Sobre".** Para não existir link sem destino, o menu apresenta apenas
  **Início** e **Lista**. O cabeçalho mantém a identidade do projeto.
- **Middleware próprio.** Toda requisição é registrada no terminal com método e endereço,
  auxiliando a explicar o percurso da requisição.
- **Erro 500 sem detalhes técnicos.** Stack traces e mensagens do banco ficam apenas no
  terminal do servidor; a interface informa somente que ocorreu uma falha inesperada.
- **Identidade visual extraída dos wireframes.** A paleta do CSS foi levantada a partir
  das próprias imagens de referência em `instrucoes/`: laranja `#b45309`, escuro
  `#243447`, fundo `#f7f9fb`, painel claro `#eef3f7`, texto secundário `#667788` e
  divisórias `#d9e1e8`. A composição também segue as medidas dos wireframes — faixa
  laranja de 13 px no cabeçalho, cartões horizontais de 146 px com faixa laranja à
  esquerda, painel lateral de 341 px no detalhamento e botões com contorno laranja.
- **Selo de prioridade com cor, texto e rótulo acessível.** As três prioridades têm cores
  e formatos diferentes (Alta preenchida, Média em âmbar, Baixa apenas contornada). O
  rótulo "Prioridade" continua na página, mas em um elemento visível apenas para leitores
  de tela (`.apenas-leitor`), para que a leitura do wireframe não seja alterada sem
  perder a informação — o nível aparece escrito no selo, sem depender da cor.
- **Área visual com ilustração real.** O wireframe trazia a marcação "ÁREA VISUAL"; no
  lugar dela ficou uma ilustração em SVG (megafone e quadro de recados) salva em
  `public/images/aviso-academico.svg`, referenciada pelo caminho público
  `/images/aviso-academico.svg` e com texto alternativo descritivo.
- **Rótulos reais no lugar das marcações.** Textos como "Wireframe temático",
  "Valor demonstrativo de título" e "Aviso em destaque" foram substituídos pelos dados do
  banco: setor, data de publicação e prioridade reais de cada aviso.
- **Página 404 com o endereço consultado.** Além da mensagem prevista no wireframe
  ("404 / Aviso indisponível"), o cartão informa discretamente qual endereço foi
  solicitado, em um bloco `code`, sem expor stack trace, SQL ou caminhos internos.
- **Foco visível e contraste.** Os botões de contorno mantêm contraste suficiente nos
  estados normal, `hover` e foco de teclado.
- **Testes com Supertest.** Os testes foram reescritos para o domínio de avisos e cobrem
  também os identificadores inválidos, garantindo que um endereço malformado resulte em
  404 — e não em erro interno.

## Acessibilidade e responsividade

- documento com `lang="pt-BR"` e uso de `header`, `nav`, `main` e `footer`;
- um único `h1` por página e hierarquia de títulos sem saltos;
- foco visível em links e botões e navegação possível por teclado;
- textos de ação que indicam o destino ("Acessar listagem", "Abrir", "Voltar para a
  lista", "Retornar com segurança");
- imagem com texto alternativo e ícones decorativos marcados com `aria-hidden`;
- indicador de prioridade lido como "Prioridade: Alta" por leitores de tela, mesmo que a
  palavra "Prioridade" não apareça visualmente no selo;
- layout em colunas que reduz para duas e depois uma conforme a largura da tela; no
  celular, o painel lateral do detalhamento passa para baixo do conteúdo principal e os
  blocos da listagem deixam de ficar lado a lado;
- as capturas de tela documentadas em `capturas/` foram conferidas em 1375 px, 820 px e
  390 px de largura, sem transbordo horizontal.

## Solução de problemas

**`npm install` falha ao compilar o `sqlite3`.** Esse pacote é nativo: ele tenta baixar um
binário pronto e, se não conseguir, compila do zero. Nesse caso é preciso ter as
ferramentas de compilação instaladas:

- **Windows:** Python 3 e o Visual Studio Build Tools com a carga de trabalho
  "Desenvolvimento para desktop com C++";
- **Linux:** `build-essential` e `python3` (`sudo apt install build-essential python3`);
- **macOS:** Xcode Command Line Tools (`xcode-select --install`).

**Porta 3000 ocupada.** Execute com outra porta:

```bash
PORT=3001 npm start
```

**Recomeçar do zero com os dados iniciais.** Pare o servidor, apague o arquivo
`database/avisos.sqlite` e inicie novamente: o banco é recriado e os seis registros são
inseridos outra vez.

## Capturas de tela (entrega)

As capturas das quatro telas devem ser salvas na pasta `capturas/`, com os nomes:

| Arquivo | Tela |
|---|---|
| `01-pagina-inicial.png` | `http://localhost:3000/` |
| `02-listagem.png` | `http://localhost:3000/avisos` |
| `03-detalhamento.png` | `http://localhost:3000/avisos/1` |
| `04-erro-404.png` | `http://localhost:3000/rota-inexistente` |

Com o servidor em execução, basta abrir cada endereço e salvar a captura da janela.
