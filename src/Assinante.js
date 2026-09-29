/**
 * ============================================================================
 * Assinante.js — Contrato (classe base) de todo SUBSCRIBER
 * ============================================================================
 * Define o que um objeto precisa ter para ser inscrito no Broker:
 *   - um "id" (nome usado nos logs);
 *   - um método "receber(topico, mensagem)", chamado a cada nova mensagem.
 *
 * O Broker não sabe se o assinante é um painel, um alarme ou um log —
 * ele só chama "receber()". Isso é polimorfismo: qualquer classe que
 * estenda Assinante pode ser inscrita em tópicos, sem alterar o Broker.
 *
 * Publishers e Subscribers NUNCA importam uns aos outros; ambos só
 * conhecem o Broker. É isso que garante o DESACOPLAMENTO do Pub/Sub.
 *
 * ----------------------------------------------------------------------------
 * Formato da MENSAGEM (leitura de sensor) que trafega pelo Broker:
 *   {
 *     sensorId:  "TEMP-A01",        // identificador do sensor
 *     local:     "fabrica-a",       // fábrica ou região da cidade
 *     tipo:      "temperatura",     // temperatura | umidade | pressao | poluicao
 *     valor:     42.5,              // valor medido
 *     unidade:   "°C",              // °C, %, bar ou AQI
 *     timestamp: Date               // momento da leitura
 *   }
 * ============================================================================
 */

class Assinante {
  /** @param {string} id nome/identificador do assinante */
  constructor(id) {
    this.id = id;
  }

  /**
   * Chamado pelo Broker quando chega uma mensagem em um tópico no qual
   * este assinante está inscrito. As classes filhas DEVEM sobrescrever.
   *
   * @param {string} topico   tópico em que a mensagem foi publicada
   * @param {object} mensagem leitura do sensor (formato descrito acima)
   */
  receber(topico, mensagem) {
    throw new Error(`${this.constructor.name} precisa implementar receber()`);
  }
}

// Exporta a classe para ser usada pelos outros arquivos (CommonJS)
module.exports = { Assinante };
