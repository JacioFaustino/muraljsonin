const express = require("express");
const { Aviso } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    // Os três destaques da página inicial vêm do banco de dados.
    // raw: true devolve objetos simples, permitidos pelo Handlebars.
    const destaques = await Aviso.findAll({
      order: [["data", "DESC"]],
      limit: 3,
      raw: true
    });

    res.render("index", {
      titulo: "Avisos Acadêmicos",
      subtitulo: "Informações organizadas para a comunidade escolar",
      destaques
    });
  } catch (erro) {
    next(erro);
  }
});

router.get("/saude", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
