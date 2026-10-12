module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Aviso",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      titulo: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: { msg: "O título é obrigatório." },
          len: {
            args: [3, 120],
            msg: "O título deve ter entre 3 e 120 caracteres."
          }
        }
      },
      setor: {
        type: DataTypes.STRING(80),
        allowNull: false,
        validate: {
          notEmpty: { msg: "O setor responsável é obrigatório." }
        }
      },
      prioridade: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: {
            args: [["Alta", "Média", "Baixa"]],
            msg: "A prioridade deve ser Alta, Média ou Baixa."
          }
        }
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: { msg: "Informe uma data de publicação válida." }
        }
      },
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "A mensagem do aviso é obrigatória." }
        }
      }
    },
    {
      tableName: "avisos",
      timestamps: true
    }
  );
};
