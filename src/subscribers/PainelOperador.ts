import { Assinante, LeituraSensor } from "../types";

/** Subscriber: painel de controle de um operador (exibe as leituras). */
export class PainelOperador implements Assinante {
  constructor(readonly id: string) {}

  receber(topico: string, m: LeituraSensor): void {
    console.log(`   🖥️  [${this.id}] ${topico}: ${m.valor}${m.unidade} (sensor ${m.sensorId})`);
  }
}
