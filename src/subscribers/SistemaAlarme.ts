/**
 * ============================================================================
 * SistemaAlarme.ts — SUBSCRIBER
 * ============================================================================
 * Central de alarmes: recebe leituras dos sensores críticos e verifica
 * se o valor está dentro de uma faixa segura. Se estiver fora, dispara
 * um ALARME.
 *
 * Mostra que o mesmo evento (uma leitura) pode ter usos diferentes em
 * cada assinante: o painel só exibe, o log só grava e o alarme analisa.
 * ============================================================================
 */

import { Assinante, LeituraSensor, TipoSensor } from "../types";

/**
 * Faixa segura (mínimo e máximo) para cada tipo de sensor.
 * Leituras fora destes limites são consideradas críticas.
 */
const LIMITES: Record<TipoSensor, { min: number; max: number }> = {
  temperatura: { min: 5, max: 80 },   // °C
  umidade: { min: 20, max: 85 },      // %
  pressao: { min: 1, max: 8 },        // bar
  poluicao: { min: 0, max: 150 },     // AQI (acima de 150 = ar insalubre)
};

export class SistemaAlarme implements Assinante {
  /** @param id nome da central de alarmes */
  constructor(readonly id: string) {}

  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Compara o valor recebido com os limites do tipo de sensor.
   */
  receber(topico: string, m: LeituraSensor): void {
    // Busca os limites do tipo de sensor que enviou a leitura
    const { min, max } = LIMITES[m.tipo];

    if (m.valor < min || m.valor > max) {
      // Fora da faixa -> dispara alarme
      console.log(
        `   🚨 [${this.id}] ALARME em ${topico}: ${m.valor}${m.unidade} fora da faixa (${min}–${max})`,
      );
    } else {
      // Dentro da faixa -> apenas confirma
      console.log(`   ✅ [${this.id}] ${topico} dentro do limite`);
    }
  }
}
