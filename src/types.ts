/**
 * Tipos compartilhados entre Broker, Publishers e Subscribers.
 * Publishers e Subscribers conhecem APENAS estes contratos e o Broker —
 * nunca uns aos outros (desacoplamento).
 */

export type TipoSensor = "temperatura" | "umidade" | "pressao" | "poluicao";

/** Mensagem (evento) publicada em um tópico. */
export interface LeituraSensor {
  sensorId: string;
  local: string;          // região da cidade ou fábrica
  tipo: TipoSensor;
  valor: number;
  unidade: string;
  timestamp: Date;
}

/** Contrato que todo assinante deve cumprir para receber mensagens. */
export interface Assinante {
  readonly id: string;
  receber(topico: string, mensagem: LeituraSensor): void | Promise<void>;
}
