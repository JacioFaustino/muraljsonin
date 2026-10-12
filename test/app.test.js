const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../app");
const { prepararBanco } = require("../server");
const { sequelize } = require("../models");

let app;

test.before(async () => {
  await prepararBanco();
  app = createApp();
});

test.after(async () => {
  await sequelize.close();
});

test("a página inicial responde 200 e apresenta o nome do projeto", async () => {
  const resposta = await request(app).get("/");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Avisos Acadêmicos/);
  assert.match(resposta.text, /Explore os avisos acadêmicos/);
});

test("a página inicial apresenta três destaques vindos do banco", async () => {
  const resposta = await request(app).get("/");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Destaques do portal/);
  assert.match(resposta.text, /Matrícula 2027/);
});

test("o endpoint de saúde responde 200 com JSON de status ok", async () => {
  const resposta = await request(app).get("/saude");

  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.status, "ok");
});

test("a listagem de avisos responde 200 e contém um registro inicial", async () => {
  const resposta = await request(app).get("/avisos");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Avisos cadastrados/);
  assert.match(resposta.text, /Matrícula 2027/);
  assert.match(resposta.text, /Reunião de pais/);
});

test("a listagem apresenta setor, data e indicador de prioridade", async () => {
  const resposta = await request(app).get("/avisos");

  assert.match(resposta.text, /Setor:/);
  assert.match(resposta.text, /Publicado em/);
  assert.match(resposta.text, /Prioridade/);
});

test("a listagem é ordenada pela data em ordem decrescente", async () => {
  const resposta = await request(app).get("/avisos");
  const html = resposta.text;

  const primeira = html.indexOf("Matrícula 2027");
  const ultima = html.indexOf("Atendimento da secretaria");

  assert.notEqual(primeira, -1);
  assert.notEqual(ultima, -1);
  assert.ok(
    primeira < ultima,
    "o aviso mais recente deveria aparecer antes do mais antigo"
  );
});

test("o detalhamento abre um registro existente", async () => {
  const resposta = await request(app).get("/avisos/1");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Matrícula 2027/);
  assert.match(resposta.text, /Registro|Setor|Mensagem/);
});

test("o detalhamento exibe todos os campos obrigatórios", async () => {
  const resposta = await request(app).get("/avisos/1");

  for (const rotulo of ["Título", "Setor", "Prioridade", "Data", "Mensagem"]) {
    assert.match(resposta.text, new RegExp(rotulo), `campo ausente: ${rotulo}`);
  }
});

test("um registro inexistente responde 404", async () => {
  const resposta = await request(app).get("/avisos/99999");

  assert.equal(resposta.status, 404);
  assert.match(resposta.text, /Aviso indisponível/);
});

test("um identificador inválido responde 404", async () => {
  const resposta = await request(app).get("/avisos/abc");

  assert.equal(resposta.status, 404);
  assert.match(resposta.text, /Aviso indisponível/);
});

test("identificadores suspeitos respondem 404 sem provocar erro 500", async () => {
  const caminhos = [
    "/avisos/0",
    "/avisos/-1",
    "/avisos/1.5",
    "/avisos/99999999999999999999999999",
    "/avisos/1%00"
  ];

  for (const caminho of caminhos) {
    const resposta = await request(app).get(caminho);
    assert.equal(resposta.status, 404, `esperado 404 para ${caminho}`);
  }
});

test("uma rota desconhecida responde 404 contextualizada", async () => {
  const resposta = await request(app).get("/rota-inexistente");

  assert.equal(resposta.status, 404);
  assert.match(resposta.text, /Aviso indisponível/);
  assert.match(resposta.text, /Retornar com segurança/);
});

test("o CSS e a imagem da área visual são servidos como arquivos estáticos", async () => {
  const css = await request(app).get("/stylesheets/style.css");
  const imagem = await request(app).get("/images/aviso-academico.svg");

  assert.equal(css.status, 200);
  assert.equal(imagem.status, 200);
});
