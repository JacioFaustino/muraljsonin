const { createApp } = require("./app");
const { sequelize, Aviso } = require("./models");

const PORT = Number(process.env.PORT) || 3000;

/**
 * Sincroniza o banco e prepara os dados iniciais.
 * A inserção só acontece quando a tabela está vazia, evitando
 * registros duplicados a cada reinicialização do servidor.
 */
async function prepararBanco() {
  await sequelize.authenticate();
  await sequelize.sync();

  const quantidade = await Aviso.count();
  if (quantidade === 0) {
    await Aviso.bulkCreate([
      {
        titulo: "Matrícula 2027",
        setor: "Secretaria",
        prioridade: "Alta",
        data: "2026-10-10",
        mensagem:
          "As matrículas para o ano letivo de 2027 estarão abertas de 20 de outubro a 12 de novembro. O atendimento é presencial na Secretaria, de segunda a sexta, das 8h às 17h, ou pelo portal do estudante. Para a renovação é necessário apresentar documento com foto, comprovante de residência atualizado e o histórico escolar do ano em curso."
      },
      {
        titulo: "Reunião de pais",
        setor: "Coordenação",
        prioridade: "Média",
        data: "2026-10-07",
        mensagem:
          "A reunião de pais e responsáveis acontecerá no dia 24 de outubro, às 18h30, no auditório da escola. Serão apresentados o calendário do último bimestre, os resultados parciais das turmas e as orientações para a recuperação final. A presença de pelo menos um responsável por estudante é importante para o acompanhamento pedagógico."
      },
      {
        titulo: "Prazo de estágio",
        setor: "Coordenação de Estágios",
        prioridade: "Alta",
        data: "2026-10-02",
        mensagem:
          "Os estudantes que estão realizando estágio supervisionado devem enviar o relatório parcial até 30 de outubro pelo formulário eletrônico da coordenação. Trabalhos entregues fora do prazo precisarão de justificativa assinada pelo orientador. Dúvidas sobre o preenchimento podem ser esclarecidas no atendimento da coordenação, às terças e quintas."
      },
      {
        titulo: "Alteração de calendário",
        setor: "Direção",
        prioridade: "Média",
        data: "2026-09-25",
        mensagem:
          "Devido ao feriado municipal, as aulas do dia 5 de novembro foram transferidas para o dia 9 de novembro. As avaliações previstas para essa semana permanecem nas datas originais. O calendário atualizado está disponível no quadro de avisos da entrada e na área do estudante, com as datas de reposição de cada turma."
      },
      {
        titulo: "Renovação da biblioteca",
        setor: "Biblioteca",
        prioridade: "Baixa",
        data: "2026-09-18",
        mensagem:
          "A biblioteca passou a oferecer renovação de empréstimos pelo catálogo on-line. O estudante pode renovar até duas vezes o mesmo título, desde que a obra não esteja reservada. O prazo continua sendo de quinze dias. Livros em atraso devem ser devolvidos antes de nova retirada."
      },
      {
        titulo: "Atendimento da secretaria",
        setor: "Secretaria",
        prioridade: "Baixa",
        data: "2026-09-10",
        mensagem:
          "O atendimento da Secretaria passa a funcionar em horário estendido nas quartas-feiras, até as 19h, para emissão de declarações, histórico escolar e comprovantes de matrícula. Nos demais dias o atendimento segue das 8h às 17h. Solicitações de documentos também podem ser abertas pelo portal do estudante."
      }
    ]);
  }
}

async function iniciarServidor() {
  try {
    await prepararBanco();

    const app = createApp();
    const servidor = app.listen(PORT, () => {
      console.log(`Avisos Acadêmicos disponível em http://localhost:${PORT}`);
      console.log("Pressione Ctrl+C para encerrar.");
    });

    return servidor;
  } catch (erro) {
    console.error("Não foi possível iniciar o servidor.");
    console.error(erro);
    process.exitCode = 1;
    return null;
  }
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = { iniciarServidor, prepararBanco };
