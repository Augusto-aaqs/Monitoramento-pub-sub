/**
 * ============================================================================
 * ServicoLog.js — SUBSCRIBER
 * ============================================================================
 * Serviço de logs: grava cada leitura recebida em um arquivo texto
 * (logs/leituras.log), formando um histórico.
 *
 * Diferente dos outros assinantes, este é ASSÍNCRONO (async/await),
 * pois escrever em disco é uma operação de I/O mais lenta. Como o
 * Broker entrega as mensagens de forma independente, essa lentidão
 * não atrasa o sensor nem os outros assinantes.
 * ============================================================================
 */

// Versões com Promise das funções de arquivo do Node.js (módulo nativo)
const { appendFile, mkdir } = require("node:fs/promises");
const { Assinante } = require("../Assinante");

class ServicoLog extends Assinante {
  /** @param {string} id nome do serviço de logs */
  constructor(id) {
    super(id); // chama o construtor da classe Assinante (define this.id)

    /** Caminho do arquivo onde as leituras são gravadas. */
    this.arquivo = "logs/leituras.log";
  }

  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Grava uma linha no arquivo, no formato CSV (separado por ";"):
   *   data/hora ; tópico ; sensor ; valor ; unidade
   *
   * @param {string} topico tópico da mensagem
   * @param {object} m      leitura do sensor
   */
  async receber(topico, m) {
    // Garante que a pasta "logs" exista (recursive: não dá erro se já existir)
    await mkdir("logs", { recursive: true });

    // Monta a linha e acrescenta ao final do arquivo
    const linha = `${m.timestamp.toISOString()};${topico};${m.sensorId};${m.valor};${m.unidade}\n`;
    await appendFile(this.arquivo, linha);

    console.log(`   📝 [${this.id}] gravou leitura de ${topico}`);
  }
}

module.exports = { ServicoLog };
