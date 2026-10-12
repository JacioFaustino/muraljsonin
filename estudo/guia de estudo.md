# Guia de estudo — Avisos Acadêmicos (Grupo 01)

> Material de preparação para explicar o código do trabalho de **Programação para
> Internet**. Todas as referências de linha correspondem ao código que está no
> repositório hoje (arquivos `server.js`, `app.js`, `models/`, `routes/`, `views/`,
> `public/`, `test/`).
>
> O PDF de instruções é explícito: *"A qualidade do trabalho será observada tanto no
> funcionamento quanto na capacidade do grupo de justificar as decisões adotadas"* e o
> projeto só é considerado concluído quando *"todos os integrantes conseguirem explicar
> o fluxo da aplicação"*. É exatamente isso que este guia treina.

---

## Como usar este guia

Não leia de uma vez. Faça em **três sessões**, na ordem:

| Sessão | O que ler | Objetivo | Tempo |
|---|---|---|---|
| 1 | Partes **1** e **2** (percurso da requisição + mapa dos arquivos) | Saber contar a história da requisição de ponta a ponta | ~40 min |
| 2 | Parte **3** a **7** (arquivo por arquivo, Express, Handlebars, Sequelize) | Entender o que cada linha faz | ~60 min |
| 3 | Partes **8** a **12** (perguntas, auto-teste, checklist, roteiro, decisões) | Treinar as respostas em voz alta | ~40 min |

**Regra de ouro:** se você não consegue explicar um trecho de código em voz alta, com as
palavras suas, você ainda não sabe. Leia o trecho, feche o arquivo e conte para o nada.

---

## 1. O percurso de uma requisição (o que mais cai na avaliação)

O PDF diz, na página 9, que o grupo deve ser capaz de explicar o percurso completo. É
literalmente esta sequência — decore a **ordem**, não as palavras.

### Exemplo real: alguém digita `http://localhost:3000/avisos/3`

```
 1. NAVEGADOR          GET /avisos/3
        │
        ▼
 2. SERVIDOR (server.js:75)      o processo Node está escutando a porta 3000
        │                          app.listen(PORT, ...) — linha 75
        ▼
 3. EXPRESS (app.js)   a requisição entra no "cano" de middlewares, na ordem registrada
        │
        ├─ 3a. express.urlencoded  (app.js:46)  interpreta dados de formulário
        ├─ 3b. express.json        (app.js:47)  interpreta JSON
        ├─ 3c. express.static      (app.js:48)  tenta servir um arquivo de public/
        │                                       (não é arquivo → segue adiante)
        ├─ 3d. middleware próprio   (app.js:51)  escreve "[GET] /avisos/3" no terminal
        │                                       e chama next()
        │
        ▼
 4. ROTA  (routes/avisos.js:26)   router.get("/:id", ...)
        │
        ├─ 4a. valida o parâmetro (linha 29)
        │      const id = Number(req.params.id)
        │      if (!Number.isInteger(id) || id <= 0) → 404, SEM consultar o banco
        │
        ├─ 4b. consulta o Model (linha 37)
        │      const aviso = await Aviso.findByPk(id, { raw: true })
        │
        ├─ 4c. registro não existe? (linha 39) → 404
        │
        ▼
 5. MODEL  (models/aviso.js)      o Sequelize traduz a consulta para SQL
        │                          SELECT * FROM avisos WHERE id = 3 LIMIT 1
        ▼
 6. BANCO  (database/avisos.sqlite)   devolve os dados do registro
        │
        ▼
 7. ROTA  (routes/avisos.js:46)   res.render("avisos/detalhar", { titulo, aviso })
        │
        ▼
 8. HANDLEBARS                    monta o HTML combinando três coisas:
        │                          layouts/main.hbs  (estrutura da página)
        │                          + avisos/detalhar.hbs (conteúdo da página)
        │                          + helpers (formatarData, classePrioridade)
        ▼
 9. EXPRESS                       devolve o HTML pronto ao navegador (status 200)
```

### Se a rota não existir (`/rota-inexistente`)

Os passos 1 a 3 são iguais. Só que nenhum `router` casa com o endereço, então o Express
chega ao **middleware de 404** (`app.js:59`), que renderiza `views/404.hbs` com status 404.

### Se algo quebrar (ex.: banco fora do ar)

A rota chama `next(erro)` (`routes/avisos.js:51`). Isso pula todos os middlewares
normais e cai no **middleware de erro** (`app.js:66`), que tem **quatro parâmetros**
(`erro, req, res, next` — é a assinatura que o Express usa para reconhecer um tratador de
erros). Ele registra os detalhes no terminal e devolve a página `erro.hbs` com status 500,
sem expor stack trace.

### A frase de 30 segundos (decore esta)

> "O navegador pede um endereço; o Express recebe e passa pelos middlewares; a rota valida
> os dados recebidos; o Model usa o Sequelize para consultar o SQLite; a rota envia o
> resultado para a view; o Handlebars gera o HTML com o layout e os helpers; e o Express
> devolve esse HTML para o navegador."

---

## 2. Mapa dos arquivos (o que cada um faz)

O PDF (página 2) define a responsabilidade de cada parte. É esta a divisão que o
professor vai cobrar:

| Pasta / arquivo | Responsabilidade | Pergunta que ele responde |
|---|---|---|
| `server.js` | Sincroniza o banco, prepara os dados iniciais e **inicia** o servidor | "Como o banco é criado e populado?" |
| `app.js` | Configura Express, Handlebars, estáticos, middlewares, rotas e erros | "O que acontece antes de chegar na rota?" |
| `models/aviso.js` | Define a entidade `Aviso`: campos, tipos e validações | "Quais são os campos e as regras?" |
| `models/index.js` | Abre a conexão com o SQLite e carrega o Model | "Onde o banco é conectado?" |
| `routes/index.js` | Página inicial (`/`) e diagnóstico (`/saude`) | "De onde vêm os 3 destaques?" |
| `routes/avisos.js` | Listagem e detalhamento (recebe, valida, consulta e escolhe a view) | "Como o `:id` é tratado?" |
| `views/layouts/main.hbs` | Estrutura comum: HTML, cabeçalho, menu, `main`, rodapé | "Por que o cabeçalho aparece em todas as páginas?" |
| `views/*.hbs` | Conteúdo de cada página | "Onde está o HTML da listagem?" |
| `views/partials/…hbs` | Componente repetido (um aviso da listagem) | "O que é um partial?" |
| `public/stylesheets/style.css` | CSS carregado pelo navegador | "Como o visual é aplicado?" |
| `public/images/aviso-academico.svg` | Imagem local da área visual | "De onde vem a ilustração?" |
| `test/app.test.js` | Testes automatizados | "O que os testes verificam?" |
| `database/avisos.sqlite` | Arquivo do banco (criado automaticamente) | "Onde os dados ficam guardados?" |

> **Nota importante (não trave se ele perguntar):** é um MVC *inspirado*. O Model está em
> `models/`, as rotas fazem o papel de **controle** da requisição, e as views apresentam.
> O PDF usa exatamente a expressão "organização inspirada no padrão MVC".

---

## 3. `server.js` — banco e inicialização (93 linhas)

### 3.1 Os dados iniciais e o `count()`

Linhas 11 a 18:

```js
async function prepararBanco() {
  await sequelize.authenticate();   // 1) testa a conexão
  await sequelize.sync();           // 2) cria a tabela se ainda não existir

  const quantidade = await Aviso.count();   // 3) quantos registros já existem?

  if (quantidade === 0) {                   // 4) só insere se a tabela estiver VAZIA
    await Aviso.bulkCreate([ /* seis avisos */ ]);
  }
}
```

**O que explicar:** `sync()` cria a tabela `avisos` na primeira execução. O `count()` com
`if (quantidade === 0)` é o que impede os seis registros de serem **duplicados** toda vez
que o servidor reinicia — é um item explícito do checklist do PDF ("os dados não são
duplicados quando o servidor reinicia").

`bulkCreate()` insere vários registros de uma vez. Os seis avisos (`Matrícula 2027`,
`Reunião de pais`, `Prazo de estágio`, `Alteração de calendário`, `Renovação da
biblioteca`, `Atendimento da secretaria`) são os sugeridos pelo PDF na página 12.

### 3.2 O detalhe que separa quem entendeu de quem decorou

Linhas 89 a 93:

```js
if (require.main === module) {
  iniciarServidor();
}

module.exports = { iniciarServidor, prepararBanco };
```

Duas coisas aqui, e as duas caem em prova:

1. **`require.main === module`** é verdadeiro quando o arquivo é executado direto
   (`npm start` → `node server.js`). Se o arquivo for apenas **importado** (`require`),
   isso é falso e o servidor **não** sobe sozinho.
2. Essa é exatamente a separação que o PDF pede: **"separação entre aplicação e
   inicialização do servidor"**. O `app.js` só *monta* o app (`module.exports = { createApp }`),
   quem *liga* é o `server.js`.

**Por que isso importa nos testes?** Em `test/app.test.js:10` os testes chamam
`createApp()` direto e usam o Supertest — o servidor **não escuta porta nenhuma**, a
requisição é injetada direto no app. Por isso existe `prepararBanco` exportado também.

### 3.3 O `catch` da inicialização

```js
} catch (erro) {
  console.error("Não foi possível iniciar o servidor.");
  console.error(erro);
  process.exitCode = 1;   // sinaliza falha para quem executou
  return null;
}
```

Se o banco não abrir, o processo avisa no terminal e marca código de saída 1, em vez de
ficar "morto" sem explicação.

### 3.4 Porta configurável

```js
const PORT = Number(process.env.PORT) || 3000;
```

O PDF pede "a porta poderá vir de `process.env.PORT` e possuir um valor padrão". Para
rodar em outra porta: `PORT=3001 npm start`.

---

## 4. `app.js` — configuração do Express (84 linhas)

### 4.1 Os helpers (linhas 17 a 39)

**`formatarData`** transforma `"2026-10-10"` em `"10/10/2026"`:

```js
const [ano, mes, dia] = String(valor).slice(0, 10).split("-");
return `${dia}/${mes}/${ano}`;
```

É um **helper do Handlebars** justamente porque o PDF exige "pelo menos um helper" e
recomenda o `formatarData` (página 18). Ele funciona por **texto**, sem usar `new Date()` —
e isso é uma decisão consciente: o campo é `DATEONLY` (só data, sem hora), então converter
para `Date` poderia deslocar o dia por causa do fuso horário do servidor. Explicar isso
mostra maturidade.

**`classePrioridade`** transforma `"Média"` em `"media"`:

```js
return String(valor || "")
  .normalize("NFD")                 // separa a letra do acento: "é" vira "e" + acento
  .replace(/[\u0300-\u036f]/g, "")  // remove os acentos
  .toLowerCase();                   // "MÉDIA" -> "media"
```

Serve para montar a classe CSS `selo--media` no template, sem precisar de `if` no HTML.

### 4.2 A ordem dos middlewares (linhas 46 a 57)

```js
app.use(express.urlencoded({ extended: false }));  // 1º
app.use(express.json());                           // 2º
app.use(express.static(path.join(__dirname, "public"))); // 3º
app.use((req, res, next) => { console.log(...); next(); }); // 4º (nosso)
app.use("/", indexRouter);                         // 5º
app.use("/avisos", avisosRouter);                  // 6º
app.use((req, res) => { /* 404 */ });              // 7º
app.use((erro, req, res, next) => { /* 500 */ });  // 8º (por último)
```

**A ordem é a resposta de oito perguntas possíveis.** Guarde estas frases:

- *"O middleware próprio precisa chamar `next()`"* — sem isso, o Express para ali e o
  navegador fica esperando para sempre. É o aviso que está no PDF, página 5.
- *"O 404 vem **depois** de todas as rotas válidas"* — se viesse antes, capturaria tudo.
- *"O middleware de erro vem por último e tem **quatro** parâmetros"* — é o jeito que o
  Express tem de reconhecê-lo.
- *"O CSS e a imagem não aparecem no log do terminal"* — porque `express.static` está
  registrado **antes** do middleware próprio e já responde sozinho, sem chamar `next()`.

### 4.3 O middleware de erro (linhas 66 a 78)

```js
app.use((erro, req, res, next) => {
  console.error("Erro tratado pela aplicação:", erro);   // detalhe fica no servidor

  if (res.headersSent) {          // se a resposta já começou a ser enviada,
    return next(erro);            // devolve o erro para o Express fechar
  }

  return res.status(500).render("erro", {
    titulo: "Falha inesperada",
    mensagem: "Não foi possível concluir a solicitação. ..."
  });
});
```

Os dois pontos que o PDF cobra: **a interface não mostra stack trace nem SQL**, e a
mensagem é genérica; o detalhe técnico fica só no terminal.

---

## 5. `models/` — a entidade `Aviso`

### 5.1 `models/index.js` (12 linhas)

```js
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "database", "avisos.sqlite"),
  logging: false
});
```

Abre a conexão com o arquivo SQLite. `logging: false` desliga o `console.log` de cada
consulta SQL (o terminal fica legível). `path.join(__dirname, "..")` é o que faz funcionar
em qualquer sistema operacional — nunca se escreve caminho absoluto do computador de quem
programou.

### 5.2 `models/aviso.js` — campos e validações

O arquivo exporta uma **função** que recebe `(sequelize, DataTypes)` e devolve o Model.
Esse formato permite que o `models/index.js` entregue a conexão já pronta.

| Campo | Tipo | Obrigatório | Validação | Por quê |
|---|---|---|---|---|
| `id` | INTEGER, autoIncrement, primaryKey | sim | — | identificador do registro |
| `titulo` | STRING(120) | sim | `notEmpty` + tamanho 3–120 | identificar o aviso |
| `setor` | STRING(80) | sim | `notEmpty` | setor responsável |
| `prioridade` | STRING(10) | sim | `isIn(["Alta","Média","Baixa"])` | só aceita os três valores |
| `data` | DATEONLY | sim | `isDate` | data de publicação, sem hora |
| `mensagem` | TEXT | sim | `notEmpty` | comunicado completo |

Exemplo real (linhas 22 a 32):

```js
prioridade: {
  type: DataTypes.STRING(10),
  allowNull: false,
  validate: {
    isIn: {
      args: [["Alta", "Média", "Baixa"]],
      msg: "A prioridade deve ser Alta, Média ou Baixa."
    }
  }
}
```

**Por que `DATEONLY` e não `DATE`?** Porque o sistema trabalha com datas de publicação,
sem horário. `DATE` guardaria hora e fuso, e uma data perto da meia-noite poderia aparecer
como o dia anterior. `DATEONLY` evita isso.

**Onde estão as opções do Model?** No fim do arquivo:

```js
{ tableName: "avisos", timestamps: true }
```

`tableName: "avisos"` define o nome real da tabela no banco (minúsculo, plural).
`timestamps: true` faz o Sequelize criar e atualizar sozinho as colunas `createdAt` e
`updatedAt` — por isso elas existem na tabela sem estarem declaradas nos campos.

> **Cuidado com a armadilha:** o Model se chama `Aviso` (singular) e a tabela `avisos`
> (plural). Se ele pedir "onde está a tabela?", a resposta é `tableName: "avisos"`.

---

## 6. `routes/` — o controle da requisição

### 6.1 A página inicial (`routes/index.js`)

```js
router.get("/", async (req, res, next) => {
  try {
    const destaques = await Aviso.findAll({
      order: [["data", "DESC"]],   // mais recente primeiro
      limit: 3,                    // só três
      raw: true                    // objetos simples
    });

    res.render("index", { titulo: "...", subtitulo: "...", destaques });
  } catch (erro) {
    next(erro);                    // manda para o middleware de erro (500)
  }
});
```

Três decisões que você precisa saber explicar:

- **`limit: 3`** → os três destaques do wireframe vêm do banco, como o PDF exige. Não é
  array fixo na view.
- **`order: [["data", "DESC"]]`** → ordenação obrigatória do Grupo 01 (data decrescente).
- **`raw: true`** → o Handlebars lê apenas propriedades simples. As instâncias do
  Sequelize guardam os campos no protótipo, e o Handlebars **não acessa o protótipo** —
  sem `raw: true`, `{{titulo}}` sairia vazio. Esta é a explicação mais importante do
  projeto inteiro: se ele perguntar "por que `raw: true`?", responda exatamente isso.

### 6.2 O detalhamento (`routes/avisos.js`) — a rota mais importante

```js
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);          // 1) converte

  if (!Number.isInteger(id) || id <= 0) {    // 2) valida ANTES de consultar
    return res.status(404).render("404", { titulo: "Aviso indisponível", caminho: req.originalUrl });
  }

  try {
    const aviso = await Aviso.findByPk(id, { raw: true });  // 3) consulta

    if (!aviso) {                                            // 4) não existe
      return res.status(404).render("404", { ... });
    }

    return res.render("avisos/detalhar", { titulo: aviso.titulo, aviso });
  } catch (erro) {
    return next(erro);                          // 5) exceção inesperada → 500
  }
});
```

As cinco etapas são exatamente as que o PDF lista na seção 6.1 (páginas 3 e 4). Vale
saber explicar **cada uma**:

1. **`req.params.id`** é sempre **texto** ("3"), nunca número. Por isso o `Number()`.
2. **A validação vem antes da consulta.** É isso que faz `/avisos/abc`, `/avisos/0`,
   `/avisos/-1`, `/avisos/1.5` responderem 404 em vez de erro interno. Se você pulasse
   essa linha, `NaN` iria para o banco.
3. **`findByPk`** = "find by primary key" — busca pelo `id`.
4. **`if (!aviso)`** → o id era válido, mas o registro não existe (`/avisos/99999`).
   Mesma resposta 404, motivo diferente.
5. **`next(erro)`** só para falhas inesperadas (banco caiu, por exemplo).

### 6.3 A listagem

```js
const registros = await Aviso.findAll({ order: [["data", "DESC"]], raw: true });

res.render("avisos/listar", {
  titulo: "Avisos cadastrados",
  registros,
  quantidade: registros.length,
  rotuloQuantidade: registros.length === 1 ? "registro" : "registros"
});
```

A rota passa dados **calculados** (quantidade e o rótulo certo: "1 registro" / "6
registros") e a view só exibe. Isso é o controle fazendo o trabalho dele — a view não
faz contas.

> **Detalhe que pode ser perguntado:** a prioridade **não** define a ordem da listagem;
> a ordem é pela data. A prioridade é o *indicador visual*. Essa decisão está registrada
> no README.

---

## 7. `views/` — Handlebars

### 7.1 O mínimo que você precisa saber

| Sintaxe | O que faz | Onde está no projeto |
|---|---|---|
| `{{campo}}` | escreve o valor **escapando** HTML | `{{titulo}}` |
| `{{{campo}}}` | escreve **sem** escapar | `{{{body}}}` no layout |
| `{{#each lista}}` | repete o bloco para cada item | destaques e listagem |
| `{{#if condição}}` | mostra ou esconde o bloco | lista vazia |
| `{{> partial}}` | inclui um pedaço de template | `componente-avisos-academicos` |
| `{{helper valor}}` | chama uma função registrada no app | `{{formatarData data}}` |

### 7.2 O layout (`views/layouts/main.hbs`, 37 linhas)

É a moldura que **todas** as páginas usam: `<!DOCTYPE html>`, `<html lang="pt-BR">`,
`<head>` com o `<title>`, `<link>` para o CSS, o `<header>` com a marca e o menu, o
`<main>` e o `<footer>`.

```hbs
<title>{{titulo}} | Avisos Acadêmicos</title>
...
<main class="limite conteudo-principal">
  {{{body}}}          <!-- AQUI entra o conteúdo de cada página -->
</main>
```

**As perguntas clássicas:**

- *"Como o título `<title>` muda em cada página?"* → cada rota passa `titulo` no
  `res.render`; o layout usa `{{titulo}}`.
- *"Por que `{{{body}}}` tem três chaves?"* → porque o conteúdo já é HTML pronto; com duas
  chaves o Handlebars escaparia as tags e a página mostraria o código em vez do layout.
- *"Por que o cabeçalho aparece em todas as páginas?"* → porque está no **layout**, e o
  `defaultLayout: "main"` (app.js:14) faz o Handlebars usá-lo automaticamente.

### 7.3 A listagem e o partial (a parte obrigatória)

`views/avisos/listar.hbs`:

```hbs
{{#if registros.length}}
  <section class="lista-avisos">
    {{#each registros}}
      {{> componente-avisos-academicos}}
    {{/each}}
  </section>
{{else}}
  <section class="estado-vazio">
    <h2>Nenhum registro foi encontrado.</h2>
  </section>
{{/if}}
```

`views/partials/componente-avisos-academicos.hbs` — o **partial**, um aviso por vez:

```hbs
<article class="aviso-linha">
  <h2>{{titulo}}</h2>
  <p>Setor: {{setor}} · Publicado em <time datetime="{{data}}">{{formatarData data}}</time></p>
  <span class="selo selo--{{classePrioridade prioridade}}">...{{prioridade}}</span>
  <a class="botao" href="/avisos/{{id}}">Abrir</a>
</article>
```

**Por que partial?** O PDF exige: "unidade visual repetida, como cartão, linha, perfil ou
item cronológico". Sem o partial, esse mesmo HTML seria copiado seis vezes na view — e
qualquer ajuste teria de ser feito em seis lugares. O partial recebe **um** aviso por vez
e não contém nenhum dado fixo: os valores vêm todos do banco.

**O `href="/avisos/{{id}}"`** é o que liga a listagem ao detalhamento. É o percurso de
navegação que o PDF pede.

### 7.4 Os helpers em uso

```hbs
<time datetime="{{data}}">{{formatarData data}}</time>       → 10/10/2026
<span class="selo selo--{{classePrioridade prioridade}}">     → selo--alta / selo--media / selo--baixa
```

Repare no `datetime="{{data}}"`: o atributo guarda a data em formato de máquina
(`2026-10-10`) e o texto visível mostra o formato brasileiro. Isso é acessibilidade e
semântica.

### 7.5 A página 404 e a de erro

`views/404.hbs` mostra o código, a mensagem **Aviso indisponível**, a explicação e o
botão **Retornar com segurança** apontando para `/avisos` — exatamente o que o PDF
determina na página 13. `views/erro.hbs` faz o mesmo para o 500, sem detalhes técnicos.

---

## 8. `public/` — arquivos estáticos e identidade visual

- `public/stylesheets/style.css` (≈660 linhas) — todo o visual. No topo, as variáveis:

```css
:root {
  --laranja-700: #b45309;  /* cor principal da identidade (laranja/âmbar) */
  --escuro: #243447;       /* títulos e contornos */
  --muted: #667788;        /* textos secundários */
  --fundo: #f7f9fb;        /* fundo das páginas */
  --painel: #eef3f7;       /* área visual e painel lateral */
  --borda: #d9e1e8;
  --branco: #ffffff;
}
```

Essas cores foram **medidas a partir dos wireframes** em `instrucoes/` — se ele
perguntar "de onde saiu esse laranja?", a resposta é `#b45309`, extraído das imagens de
referência.

- `public/images/aviso-academico.svg` — a ilustração da área visual, referenciada por
  caminho **público** (`/images/aviso-academico.svg`), nunca por caminho absoluto do
  computador. É o que o PDF exige na seção 13.

**Como o navegador recebe o CSS?** Pelo `express.static` (app.js:48): o `public/` é
publicado na raiz do site, então `public/stylesheets/style.css` vira `/stylesheets/style.css`.

---

## 9. Ordem recomendada: estude também a lista de implementação do PDF

O PDF (página 14) dá uma sequência de 15 passos de implementação. Ela é, na prática, o
roteiro da sua explicação. Os 15 passos, com onde cada um aparece hoje:

1. Copiar e executar o projeto-base → feito no início do trabalho
2. Renomear o Model e definir os campos → `models/aviso.js`
3. Substituir os dados iniciais → `server.js:17`
4. Criar `routes/avisos.js` e registrar no `app.js` → `app.js:57`
5. Consulta dos destaques → `routes/index.js:10` a `:14`
6. Listagem com `findAll()` e ordenação → `routes/avisos.js:8`
7. Criar o partial → `views/partials/componente-avisos-academicos.hbs`
8. Detalhamento com `findByPk()` → `routes/avisos.js:37`
9. Validar ids inválidos e inexistentes → `routes/avisos.js:29` e `:39`
10. Adaptar `index.hbs`, listagem, detalhamento e 404 → `views/`
11. CSS e responsividade → `public/stylesheets/style.css`
12. Helper, condicional e mensagem de ausência de dados → `app.js:17`, `listar.hbs:10`
13. Adaptar e ampliar os testes → `test/app.test.js`
14. Revisar acessibilidade, README e referências residuais → `README.md`
15. `npm test`, reiniciar e conferir que não duplica → `server.js:15`

---

## 10. As 14 perguntas mais prováveis (com resposta curta)

Leia a pergunta, responda em voz alta, **depois** confira.

**1. O que acontece quando alguém abre `/avisos/3`?**
Navegador → Express → middlewares (urlencoded, json, static, nosso log) → rota
`/avisos/:id` → valida o id → `findByPk` → Sequelize traduz para SQL → SQLite devolve →
`res.render` → Handlebars monta o HTML com o layout → Express responde 200.

**2. Por que `raw: true` nas consultas?**
Porque o Handlebars só lê propriedades próprias do objeto. As instâncias do Sequelize
guardam os campos no protótipo, então sem `raw: true` os valores sairiam vazios no HTML.

**3. Por que o `id` é validado antes de consultar o banco?**
Para que `abc`, `0`, `-1` ou `1.5` retornem 404 em vez de provocar erro interno. Sem isso,
um valor inválido iria para o banco e viraria erro 500.

**4. Por que os dados não duplicam quando o servidor reinicia?**
Porque `prepararBanco()` conta os registros com `Aviso.count()` e só chama `bulkCreate()`
quando a tabela está vazia (`server.js:15`).

**5. Qual é o papel do `express.static`?**
Publicar a pasta `public/` como arquivos acessíveis pelo navegador. É por ele que
`/stylesheets/style.css` e `/images/aviso-academico.svg` funcionam.

**6. O que é um partial e por que ele existe?**
Um pedaço de template reutilizável. Aqui é o componente de um aviso da listagem: como as
linhas são iguais, o HTML fica em um só arquivo e o `{{#each}}` repete.

**7. Onde está o helper? O que ele faz?**
Em `app.js:17`. São dois: `formatarData` (data em `dd/mm/aaaa`) e `classePrioridade`
("Média" → `media`, para a classe CSS do selo).

**8. Para que serve o `{{#if}}` no projeto?**
Para tratar os estados: na listagem, mostra a mensagem de lista vazia quando não há
registros (`listar.hbs:10`).

**9. Como o menu aparece em todas as páginas?**
Ele está no layout `main.hbs`, que envolve o conteúdo de todas as views
(`defaultLayout: "main"`, `app.js:14`).

**10. O que acontece se a rota não existir?**
Nenhum router casa, o Express chega ao middleware de 404 (`app.js:59`) e renderiza
`404.hbs` com status 404.

**11. E se o banco falhar no meio de uma consulta?**
A rota chama `next(erro)`; o middleware de erro (`app.js:66`) registra o detalhe no
terminal e devolve a página `erro.hbs` com status 500, sem stack trace para o usuário.

**12. Por que o middleware de erro tem quatro parâmetros?**
É a assinatura `(erro, req, res, next)` que o Express usa para reconhecer um tratador de
erros e não um middleware comum.

**13. Por que o campo `data` é `DATEONLY`?**
Porque guarda só a data, sem horário nem fuso. Com `DATE`, um registro perto da
meia-noite poderia ser exibido com o dia anterior.

**14. Por que a prioridade não é a ordem da listagem?**
O PDF define ordenação por **data decrescente**; a prioridade é o *indicador visual*
(selo). As duas informações são independentes, e isso está justificado no README.

---

## 11. Auto-teste (responda antes de abrir)

Clique em cada item só depois de tentar responder. Se errar, volte na seção indicada.

<details><summary><b>1.</b> Em qual arquivo e linha o servidor começa a escutar a porta?</summary>
<code>server.js:75</code>, dentro de <code>iniciarServidor()</code>, com
<code>app.listen(PORT, ...)</code>. Quem "liga" é o <code>server.js</code>; quem "monta" o
app é o <code>app.js</code>.</details>

<details><summary><b>2.</b> Qual a diferença entre <code>models/index.js</code> e <code>models/aviso.js</code>?</summary>
<code>index.js</code> abre a conexão com o SQLite e entrega essa conexão para o Model;
<code>aviso.js</code> define a entidade <code>Aviso</code> (campos, tipos, validações e o
nome da tabela).</details>

<details><summary><b>3.</b> Onde está definido que o menu tem os links "Início" e "Lista"?</summary>
No layout <code>views/layouts/main.hbs</code>, linhas 17 a 22.</details>

<details><summary><b>4.</b> Quantos testes existem e o que os dois testes de id inválido verificam?</summary>
São 13 testes. Um verifica que <code>/avisos/abc</code> responde 404 (identificador
inválido) e outro que <code>/avisos/99999</code> responde 404 (registro inexistente);
existe ainda um terceiro que testa vários ids suspeitos de uma vez, garantindo que nenhum
deles vire erro 500.</details>

<details><summary><b>5.</b> Como os testes rodam sem abrir a porta 3000?</summary>
O teste importa <code>createApp()</code> e usa o <strong>Supertest</strong>, que injeta a
requisição direto no app. O <code>require.main === module</code> impede que importar o
<code>server.js</code> suba um servidor de verdade.</details>

<details><summary><b>6.</b> Se eu apagar <code>database/avisos.sqlite</code> e reiniciar, o que acontece?</summary>
O <code>sequelize.sync()</code> recria a tabela e o <code>count() === 0</code> dispara o
<code>bulkCreate()</code>: os seis avisos iniciais são inseridos de novo. É uma ótima
demonstração ao vivo de que os dados vêm do banco.</details>

<details><summary><b>7.</b> Por que o CSS não aparece no log do terminal?</summary>
Porque <code>express.static</code> (<code>app.js:48</code>) está registrado antes do
middleware próprio (<code>app.js:51</code>) e responde sozinho, sem chamar
<code>next()</code>. O log mostra só as requisições de página.</details>

<details><summary><b>8.</b> Qual a diferença entre <code>res.render()</code> e <code>res.json()</code>?</summary>
<code>res.render()</code> monta HTML com o Handlebars e envia (usado nas páginas);
<code>res.json()</code> envia um objeto JSON — usado apenas em <code>/saude</code>
(<code>routes/index.js:27</code>).</details>

<details><summary><b>9.</b> Onde está a decisão de não ter o item "Sobre" no menu?</summary>
Está registrada no README, em "Decisões e adaptações": o wireframe mostra três itens, mas
como não existiria uma página de destino, o menu ficou com <strong>Início</strong> e
<strong>Lista</strong> — o PDF proíbe links com destino inexistente.</details>

<details><summary><b>10.</b> Cite três coisas que o middleware próprio poderia registrar além de método e endereço.</summary>
Horário da requisição, o <code>User-Agent</code> (navegador), o tempo de resposta
(<code>Date.now()</code> no início e no fim) — o PDF diz "opcionalmente, horário".</details>

---

## 12. Checklist do PDF mapeado ao código

Os itens do PDF que mais provavelmente serão cobrados, com **onde provar**:

| Requisito do PDF | Onde provar |
|---|---|
| Entidade `Aviso` com os cinco campos | `models/aviso.js` |
| Seis ou mais registros iniciais | `server.js:17` (seis avisos) |
| Dados não duplicam no reinício | `server.js:15` (`count()` + `if`) |
| Página inicial com 3 destaques do banco | `routes/index.js:10` a `:12` (`limit: 3`) |
| Listagem com `findAll()` e ordenação | `routes/avisos.js:8` (`order: data DESC`) |
| Detalhamento com `findByPk()` e `req.params.id` | `routes/avisos.js:37` e `:27` |
| Id validado antes da consulta | `routes/avisos.js:29` |
| Listagem com `{{#each}}` e partial | `views/avisos/listar.hbs:12` e o partial |
| Pelo menos uma condicional `{{#if}}` | `views/avisos/listar.hbs:10` |
| Pelo menos um helper | `app.js:17` (`formatarData`) |
| Middlewares na ordem correta | `app.js:46` a `:78` |
| Middleware próprio chamando `next()` | `app.js:51` a `:54` |
| Erro 500 sem detalhes técnicos | `app.js:66` |
| 404 contextualizada com retorno seguro | `views/404.hbs` |
| CSS em `public/stylesheets` e imagens em `public/images` | `public/` |
| Sem links vazios ou `#` | menu com 2 destinos reais |
| Testes com rotas e textos do domínio | `test/app.test.js` (13 testes) |

---

## 13. Roteiro de 3 minutos para a apresentação

Decore a estrutura, não o texto:

1. **Abertura (15 s).** "É o portal **Avisos Acadêmicos**, do Grupo 01: centraliza
   comunicados da escola com setor, data e prioridade. Foi feito com Node, Express,
   Handlebars, Sequelize e SQLite."
2. **O percurso (60 s).** Conte a história de `/avisos/3` (seção 1): middlewares → rota →
   validação do id → `findByPk` → SQLite → `res.render` → Handlebars → HTML.
3. **As decisões (60 s).** Escolha três: `raw: true` (por causa do protótipo do
   Sequelize), `DATEONLY` (evita fuso), `count()` antes de `bulkCreate` (não duplica),
   validação antes da consulta (404 em vez de 500).
4. **A demonstração (30 s).** Abra `/`, `/avisos`, `/avisos/1` e
   `/rota-inexistente`. Opcional e muito forte: apague `database/avisos.sqlite`, reinicie
   e mostre os seis avisos sendo recriados — provando que os dados vêm do banco.
5. **O fechamento (15 s).** "Os 13 testes passam com `npm test`, o README explica
   instalação, rotas e decisões, e as quatro telas seguem os wireframes de `instrucoes/`."

---

## 14. Se ele pedir uma alteração ao vivo

Este é o teste mais comum para verificar se você entende mesmo. Tenha estes quatro na
ponta da língua:

**a) "Adicione um aviso novo."**
Edite o `bulkCreate` em `server.js` (mais um objeto com os cinco campos), pare o servidor,
apague `database/avisos.sqlite` e rode de novo. *(Se o banco tiver dados, o `count()` não
deixa inserir — por isso a demonstração exige apagar o arquivo.)*

**b) "Troque a ordenação para alfabética."**
Em `routes/avisos.js:9` troque `order: [["data", "DESC"]]` por `order: [["titulo", "ASC"]]`.
Não mexa em mais nada: a ordenação é responsabilidade da **rota**, não da view.

**c) "Adicione um campo."**
1) Declare no `models/aviso.js`; 2) coloque um valor no `bulkCreate`; 3) mostre na view
(`detalhar.hbs` e/ou no partial); 4) apague o `.sqlite` para recriar a tabela com a coluna
nova. *(Colunas novas exigem recriar a tabela porque usamos `sync()`, sem migrações.)*

**d) "Crie uma página nova."**
Crie `views/alguma-coisa.hbs`, uma rota que faça `res.render("alguma-coisa", {...})` e
registre o router no `app.js` **antes** do middleware de 404. Se esquecer a ordem, a
página nova responderá 404.

---

## 15. Três hábitos que evitam a maior parte dos problemas

1. **Não decore código — decore a ordem.** Ordem dos middlewares, ordem das cinco etapas
   da rota `/avisos/:id`, ordem das três camadas (rota → Model → view).
2. **Sempre justifique com "por causa de".** "Usei `raw: true` *porque* o Handlebars não
   lê o protótipo do Sequelize." É isso que o PDF chama de "justificar as decisões".
3. **Se não souber, diga onde procuraria.** "Não lembro a linha exata, mas está no
   `app.js`, na parte que configura o Handlebars." Isso é muito melhor do que inventar.

---

*Este guia é um material de estudo pessoal do grupo. Ele fica em `instrucoes/`, a pasta
que reúne os materiais do professor e que **não vai para o arquivo compactado da
entrega** — por isso o guia não interfere na avaliação nem conta como arquivo extra.*