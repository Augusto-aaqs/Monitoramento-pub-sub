/**
 * ============================================================================
 * Sensor.js — PUBLISHER
 * ============================================================================
 * Representa um sensor IoT instalado em uma fábrica ou região da cidade.
 * Seu único trabalho é gerar leituras e PUBLICÁ-LAS no Broker.
 *
 * Ponto-chave do padrão: o sensor NÃO sabe quem vai receber a leitura.
 * Ele não conhece painéis, alarmes ou logs — conhece apenas o Broker e
 * o nome do seu tópico. Por isso podemos adicionar ou remover
 * consumidores sem mexer em nenhuma linha desta classe.
 * ============================================================================
 */

/**
 * Tabela de unidades de medida por tipo de sensor.
 * Object.freeze impede que a tabela seja alterada por engano.
 */
const UNIDADES = Object.freeze({
  temperatura: "°C",
  umidade: "%",
  pressao: "bar",
  poluicao: "AQI", // Air Quality Index (índice de qualidade do ar)
});

class Sensor {
  /**
   * @param {PubSub} broker referência ao Broker (único componente que o sensor conhece)
   * @param {string} id     identificador do sensor (ex.: "TEMP-A01")
   * @param {string} local  fábrica ou região onde está instalado (ex.: "fabrica-a")
   * @param {string} tipo   grandeza medida: temperatura | umidade | pressao | poluicao
   */
  constructor(broker, id, local, tipo) {
    // Validação simples: só aceita tipos que existem na tabela de unidades
    if (!(tipo in UNIDADES)) {
      throw new Error(`Tipo de sensor inválido: "${tipo}"`);
    }

    this.broker = broker;
    this.id = id;
    this.local = local;
    this.tipo = tipo;

    // Monta o tópico a partir do local e do tipo: "fabrica-a/temperatura"
    this.topico = `${local}/${tipo}`;
  }

  /**
   * Cria uma mensagem de leitura e a publica no Broker.
   * @param {number} valor valor medido pelo sensor
   */
  publicarLeitura(valor) {
    // 1) Monta a mensagem (formato descrito em Assinante.js)
    const leitura = {
      sensorId: this.id,
      local: this.local,
      tipo: this.tipo,
      valor,
      unidade: UNIDADES[this.tipo],
      timestamp: new Date(),
    };

    // 2) Entrega ao Broker. O publish() retorna na hora (entrega assíncrona),
    //    informando apenas quantos assinantes serão notificados.
    const qtd = this.broker.publish(this.topico, leitura);

    // 3) Log para acompanhar a demonstração
    console.log(
      `\n📡 [${this.id}] publicou ${valor}${leitura.unidade} em "${this.topico}" -> ${qtd} assinante(s)`,
    );
  }
}

module.exports = { Sensor };
