const express = require("express");
const { Aviso } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const registros = await Aviso.findAll({
      order: [["data", "DESC"]],
      raw: true
    });

    res.render("avisos/listar", {
      titulo: "Avisos cadastrados",
      descricao:
        "Avisos recuperados do banco de dados e organizados por prioridade.",
      registros,
      quantidade: registros.length,
      rotuloQuantidade: registros.length === 1 ? "registro" : "registros"
    });
  } catch (erro) {
    next(erro);
  }
});

router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).render("404", {
      titulo: "Aviso indisponível",
      caminho: req.originalUrl
    });
  }

  try {
    const aviso = await Aviso.findByPk(id, { raw: true });

    if (!aviso) {
      return res.status(404).render("404", {
        titulo: "Aviso indisponível",
        caminho: req.originalUrl
      });
    }

    return res.render("avisos/detalhar", {
      titulo: aviso.titulo,
      aviso
    });
  } catch (erro) {
    return next(erro);
  }
});

module.exports = router;
