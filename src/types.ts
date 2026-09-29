/**
 * ============================================================================
 * types.ts — Contratos (tipos e interfaces) compartilhados
 * ============================================================================
 * Este arquivo define "o idioma comum" do sistema:
 *   - o formato da MENSAGEM que trafega pelo Broker (LeituraSensor);
 *   - a INTERFACE que todo assinante precisa implementar (Assinante).
 *
 * Publishers e Subscribers dependem apenas destes contratos e do Broker.
 * Eles NUNCA importam uns aos outros — isso é o que garante o
 * DESACOPLAMENTO do padrão Pub/Sub.
 * ============================================================================
 */

/**
 * Tipos de sensores existentes no cenário IoT.
 * Usamos um "union type" para que o TypeScript não aceite valores inválidos
 * (ex.: "temperatrua" com erro de digitação gera erro de compilação).
 */
export type TipoSensor = "temperatura" | "umidade" | "pressao" | "poluicao";

/**
 * Mensagem (evento) publicada em um tópico.
 * Cada leitura feita por um sensor vira um objeto deste formato,
 * que o Broker repassa para todos os assinantes interessados.
 */
export interface LeituraSensor {
  sensorId: string;   // identificador único do sensor (ex.: "TEMP-A01")
  local: string;      // região da cidade ou fábrica (ex.: "fabrica-a", "centro")
  tipo: TipoSensor;   // o que está sendo medido
  valor: number;      // valor numérico da leitura
  unidade: string;    // unidade de medida (°C, %, bar, AQI)
  timestamp: Date;    // momento em que a leitura foi feita
}

/**
 * Contrato que todo assinante (subscriber) deve cumprir.
 *
 * O Broker não sabe se o assinante é um painel, um alarme ou um log —
 * ele só sabe que o objeto tem um "id" e um método "receber".
 * Isso é polimorfismo: qualquer classe que implemente esta interface
 * pode ser inscrita em tópicos, sem alterar o Broker.
 */
export interface Assinante {
  /** Nome/identificador do assinante, usado nos logs do Broker. */
  readonly id: string;

  /**
   * Chamado pelo Broker sempre que chega uma mensagem em um tópico
   * no qual este assinante está inscrito.
   * Pode ser síncrono (void) ou assíncrono (Promise<void>).
   *
   * @param topico   tópico em que a mensagem foi publicada
   * @param mensagem leitura do sensor
   */
  receber(topico: string, mensagem: LeituraSensor): void | Promise<void>;
}
