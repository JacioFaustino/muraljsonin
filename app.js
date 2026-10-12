const path = require("node:path");
const express = require("express");
const { engine } = require("express-handlebars");
const indexRouter = require("./routes/index");
const avisosRouter = require("./routes/avisos");

function createApp() {
  const app = express();

  app.engine(
    "hbs",
    engine({
      extname: ".hbs",
      defaultLayout: "main",
      layoutsDir: path.join(__dirname, "views", "layouts"),
      partialsDir: path.join(__dirname, "views", "partials"),
      helpers: {
        // Apresenta a data no formato brasileiro sem depender do fuso horário
        // do servidor: o valor do campo DATEONLY já chega como "AAAA-MM-DD".
        formatarData(valor) {
          if (!valor) {
            return "";
          }

          const [ano, mes, dia] = String(valor).slice(0, 10).split("-");
          if (!ano || !mes || !dia) {
            return String(valor);
          }

          return `${dia}/${mes}/${ano}`;
        },
        // Gera a classe CSS do selo de prioridade (ex.: "Média" -> "media").
        classePrioridade(valor) {
          return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        }
      }
    })
  );

  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  // Middleware próprio: registra método e endereço de cada requisição.
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });

  app.use("/", indexRouter);
  app.use("/avisos", avisosRouter);

  app.use((req, res) => {
    res.status(404).render("404", {
      titulo: "Aviso indisponível",
      caminho: req.originalUrl
    });
  });

  app.use((erro, req, res, next) => {
    // Os detalhes técnicos permanecem no terminal do servidor.
    console.error("Erro tratado pela aplicação:", erro);

    if (res.headersSent) {
      return next(erro);
    }

    return res.status(500).render("erro", {
      titulo: "Falha inesperada",
      mensagem:
        "Não foi possível concluir a solicitação. Ocorreu uma falha inesperada e a equipe responsável já pode verificar o ocorrido."
    });
  });

  return app;
}

module.exports = { createApp };
