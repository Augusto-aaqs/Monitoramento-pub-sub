/**
 * ============================================================================
 * PainelOperador.ts — SUBSCRIBER
 * ============================================================================
 * Simula o painel de controle (dashboard) de um operador: apenas exibe
 * na tela as leituras que chegam dos tópicos em que está inscrito.
 *
 * Exemplos de uso na simulação:
 *   - Painel da Fábrica A inscrito em "fabrica-a/*" (tudo da fábrica)
 *   - Painel da Prefeitura inscrito em "*\/poluicao" (poluição da cidade)
 * ============================================================================
 */

import { Assinante, LeituraSensor } from "../types";

// "implements Assinante" garante que a classe tenha "id" e "receber()",
// ou seja, que ela possa ser inscrita no Broker.
export class PainelOperador implements Assinante {
  /** @param id nome do painel, exibido nos logs */
  constructor(readonly id: string) {}

  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Aqui o painel só mostra a leitura formatada.
   */
  receber(topico: string, m: LeituraSensor): void {
    console.log(`   🖥️  [${this.id}] ${topico}: ${m.valor}${m.unidade} (sensor ${m.sensorId})`);
  }
}
