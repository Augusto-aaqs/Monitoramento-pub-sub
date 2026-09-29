/**
 * ============================================================================
 * SistemaAlarme.js — SUBSCRIBER
 * ============================================================================
 * Central de alarmes: recebe leituras dos sensores críticos e verifica
 * se o valor está dentro de uma faixa segura. Se estiver fora, dispara
 * um ALARME.
 *
 * Mostra que o mesmo evento (uma leitura) pode ter usos diferentes em
 * cada assinante: o painel só exibe, o log só grava e o alarme analisa.
 * ============================================================================
 */

const { Assinante } = require("../Assinante");

/**
 * Faixa segura (mínimo e máximo) para cada tipo de sensor.
 * Leituras fora destes limites são consideradas críticas.
 */
const LIMITES = Object.freeze({
  temperatura: { min: 5, max: 80 },   // °C
  umidade: { min: 20, max: 85 },      // %
  pressao: { min: 1, max: 8 },        // bar
  poluicao: { min: 0, max: 150 },     // AQI (acima de 150 = ar insalubre)
});

class SistemaAlarme extends Assinante {
  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Compara o valor recebido com os limites do tipo de sensor.
   *
   * @param {string} topico tópico da mensagem
   * @param {object} m      leitura do sensor
   */
  receber(topico, m) {
    // Busca os limites do tipo de sensor que enviou a leitura
    // (desestruturação: pega "min" e "max" do objeto de uma vez)
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

module.exports = { SistemaAlarme };
