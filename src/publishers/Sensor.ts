import { PubSub } from "../broker/PubSub";
import { LeituraSensor, TipoSensor } from "../types";

const UNIDADES: Record<TipoSensor, string> = {
  temperatura: "°C",
  umidade: "%",
  pressao: "bar",
  poluicao: "AQI",
};

/**
 * Publisher: um sensor IoT instalado em uma região/fábrica.
 * Ele só conhece o Broker e o nome do tópico — não sabe quem está ouvindo.
 */
export class Sensor {
  readonly topico: string;

  constructor(
    private broker: PubSub,
    readonly id: string,
    readonly local: string,
    readonly tipo: TipoSensor,
  ) {
    this.topico = `${local}/${tipo}`;
  }

  /** Envia uma leitura para o Broker. */
  publicarLeitura(valor: number): void {
    const leitura: LeituraSensor = {
      sensorId: this.id,
      local: this.local,
      tipo: this.tipo,
      valor,
      unidade: UNIDADES[this.tipo],
      timestamp: new Date(),
    };
    const qtd = this.broker.publish(this.topico, leitura);
    console.log(
      `\n📡 [${this.id}] publicou ${valor}${leitura.unidade} em "${this.topico}" -> ${qtd} assinante(s)`,
    );
  }
}
