const path = require("node:path");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "database", "avisos.sqlite"),
  logging: false
});

const Aviso = require("./aviso")(sequelize, DataTypes);

module.exports = { sequelize, Aviso };
