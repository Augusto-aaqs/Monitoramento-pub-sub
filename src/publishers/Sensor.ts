/**
 * ============================================================================
 * Sensor.ts — PUBLISHER
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

import { PubSub } from "../broker/PubSub";
import { LeituraSensor, TipoSensor } from "../types";

/**
 * Tabela de unidades de medida por tipo de sensor.
 * Record<TipoSensor, string> obriga a existir uma unidade para cada tipo.
 */
const UNIDADES: Record<TipoSensor, string> = {
  temperatura: "°C",
  umidade: "%",
  pressao: "bar",
  poluicao: "AQI", // Air Quality Index (índice de qualidade do ar)
};

export class Sensor {
  /** Tópico onde este sensor publica, no formato "local/tipo". */
  readonly topico: string;

  /**
   * @param broker referência ao Broker (único componente que o sensor conhece)
   * @param id     identificador do sensor (ex.: "TEMP-A01")
   * @param local  fábrica ou região onde está instalado (ex.: "fabrica-a")
   * @param tipo   grandeza medida (temperatura, umidade, pressão, poluição)
   *
   * Obs.: "private"/"readonly" nos parâmetros do construtor já criam
   * e preenchem os atributos da classe automaticamente (recurso do TypeScript).
   */
  constructor(
    private broker: PubSub,
    readonly id: string,
    readonly local: string,
    readonly tipo: TipoSensor,
  ) {
    // Monta o tópico a partir do local e do tipo: "fabrica-a/temperatura"
    this.topico = `${local}/${tipo}`;
  }

  /**
   * Cria uma mensagem de leitura e a publica no Broker.
   * @param valor valor medido pelo sensor
   */
  publicarLeitura(valor: number): void {
    // 1) Monta a mensagem no formato do contrato LeituraSensor
    const leitura: LeituraSensor = {
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
