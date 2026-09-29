/**
 * ============================================================================
 * PainelOperador.js — SUBSCRIBER
 * ============================================================================
 * Simula o painel de controle (dashboard) de um operador: apenas exibe
 * na tela as leituras que chegam dos tópicos em que está inscrito.
 *
 * Exemplos de uso na simulação:
 *   - Painel da Fábrica A inscrito em "fabrica-a/*" (tudo da fábrica)
 *   - Painel da Prefeitura inscrito em "*\/poluicao" (poluição da cidade)
 * ============================================================================
 */

const { Assinante } = require("../Assinante");

// "extends Assinante" faz o painel seguir o contrato de assinante
// (ter "id" e "receber()"), podendo assim ser inscrito no Broker.
class PainelOperador extends Assinante {
  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Aqui o painel só mostra a leitura formatada.
   *
   * @param {string} topico tópico da mensagem
   * @param {object} m      leitura do sensor
   */
  receber(topico, m) {
    console.log(`   🖥️  [${this.id}] ${topico}: ${m.valor}${m.unidade} (sensor ${m.sensorId})`);
  }
}

module.exports = { PainelOperador };
