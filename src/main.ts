/**
 * ============================================================================
 * main.ts — SCRIPT PRINCIPAL DA SIMULAÇÃO
 * ============================================================================
 * Monta o cenário de Monitoramento IoT (Cidade Inteligente / Indústria 4.0)
 * e demonstra, passo a passo, o funcionamento do padrão Pub/Sub:
 *
 *   ETAPA 1 - assinantes se inscrevem nos tópicos (subscribe)
 *   ETAPA 2 - sensores publicam leituras normais (publish)
 *   ETAPA 3 - leituras críticas disparam alarmes
 *   ETAPA 4 - assinantes se desinscrevem (unsubscribe)
 *   ETAPA 5 - nova publicação: quem saiu NÃO recebe mais
 *   ETAPA 6 - publicação em tópico sem assinantes
 *
 * Este é o ÚNICO arquivo que conhece todos os componentes, pois é ele que
 * "liga" as peças. Os componentes em si continuam sem se conhecer.
 * ============================================================================
 */

import { PubSub } from "./broker/PubSub";
import { Sensor } from "./publishers/Sensor";
import { PainelOperador } from "./subscribers/PainelOperador";
import { SistemaAlarme } from "./subscribers/SistemaAlarme";
import { ServicoLog } from "./subscribers/ServicoLog";

/**
 * Tempo de pausa entre as etapas (em milissegundos), para dar tempo de
 * explicar durante a apresentação. Pode ser alterado pela variável de
 * ambiente PAUSA_MS (ex.: PAUSA_MS=2000 npm start). Padrão: 800 ms.
 */
const PAUSA_MS = Number(process.env.PAUSA_MS ?? 800);

/** Função auxiliar: espera "ms" milissegundos (usada com await). */
const esperar = (ms = PAUSA_MS) => new Promise((r) => setTimeout(r, ms));

/** Função auxiliar: imprime um cabeçalho destacado para cada etapa. */
const etapa = (titulo: string) =>
  console.log(`\n${"=".repeat(64)}\n${titulo}\n${"=".repeat(64)}`);

// A função é "async" para podermos usar "await esperar()" entre as etapas
async function main() {
  etapa("🏭 MONITORAMENTO IoT — Cidade Inteligente / Indústria 4.0 (Pub/Sub)");

  // ---------------------------------------------------------------------------
  // 1) BROKER — a central que liga publishers e subscribers
  // ---------------------------------------------------------------------------
  const broker = new PubSub();

  // ---------------------------------------------------------------------------
  // 2) PUBLISHERS — sensores espalhados pelas fábricas e pela cidade.
  //    Cada sensor publica no tópico "local/tipo".
  // ---------------------------------------------------------------------------
  const tempFabA = new Sensor(broker, "TEMP-A01", "fabrica-a", "temperatura"); // fabrica-a/temperatura
  const umidFabA = new Sensor(broker, "UMID-A01", "fabrica-a", "umidade");     // fabrica-a/umidade
  const pressFabB = new Sensor(broker, "PRES-B01", "fabrica-b", "pressao");    // fabrica-b/pressao
  const polCentro = new Sensor(broker, "POL-C01", "centro", "poluicao");       // centro/poluicao
  const polZonaSul = new Sensor(broker, "POL-S01", "zona-sul", "poluicao");    // zona-sul/poluicao

  // ---------------------------------------------------------------------------
  // 3) SUBSCRIBERS — sistemas que consomem as leituras
  // ---------------------------------------------------------------------------
  const painelFabA = new PainelOperador("Painel-Operador-FabricaA");
  const painelCidade = new PainelOperador("Painel-Prefeitura");
  const alarme = new SistemaAlarme("Central-Alarmes");
  const log = new ServicoLog("Servico-Logs");

  // ===========================================================================
  etapa("ETAPA 1 — Inscrições (subscribe)");
  // Cada assinante escolhe os tópicos que lhe interessam.
  // ===========================================================================
  broker.subscribe("fabrica-a/*", painelFabA);          // tudo da Fábrica A
  broker.subscribe("*/poluicao", painelCidade);         // poluição de todas as regiões
  broker.subscribe("fabrica-a/temperatura", alarme);    // alarme vigia a temperatura da Fábrica A
  broker.subscribe("fabrica-b/pressao", alarme);        // ...a pressão da Fábrica B
  broker.subscribe("*/poluicao", alarme);               // ...e a poluição da cidade
  broker.subscribe("*/*", log);                         // o log recebe tudo
  console.log("\nTópicos ativos:", broker.listarTopicos());
  await esperar();

  // ===========================================================================
  etapa("ETAPA 2 — Leituras normais (publish)");
  // Valores dentro da faixa segura: os assinantes recebem e o alarme
  // apenas confirma "dentro do limite".
  // ===========================================================================
  tempFabA.publicarLeitura(42.5);  // -> Painel Fábrica A, Alarme, Log
  await esperar();
  umidFabA.publicarLeitura(55);    // -> Painel Fábrica A, Log (alarme não vigia umidade)
  await esperar();
  polCentro.publicarLeitura(68);   // -> Painel Prefeitura, Alarme, Log
  await esperar();

  // ===========================================================================
  etapa("ETAPA 3 — Leituras críticas disparam alarme");
  // Valores fora da faixa: a Central de Alarmes dispara 🚨.
  // ===========================================================================
  tempFabA.publicarLeitura(93.1);  // temperatura acima de 80 °C
  await esperar();
  pressFabB.publicarLeitura(9.4);  // pressão acima de 8 bar
  await esperar();
  polZonaSul.publicarLeitura(187); // poluição acima de 150 AQI
  await esperar();

  // ===========================================================================
  etapa("ETAPA 4 — Desinscrição (unsubscribe)");
  // O operador encerra o turno e o alarme para de vigiar a temperatura
  // da Fábrica A. Repare que a lista de tópicos ativos diminui.
  // ===========================================================================
  console.log("Operador da Fábrica A encerra o turno; alarme deixa de vigiar a temperatura da Fábrica A.");
  broker.unsubscribe("fabrica-a/*", painelFabA);
  broker.unsubscribe("fabrica-a/temperatura", alarme);
  console.log("\nTópicos ativos:", broker.listarTopicos());
  await esperar();

  // ===========================================================================
  etapa("ETAPA 5 — Nova publicação após unsubscribe");
  // Prova de que o unsubscribe funcionou: mesmo com valor crítico,
  // painel e alarme não recebem mais. Só o log (inscrito em "*/*") recebe.
  // ===========================================================================
  console.log("Painel-Operador-FabricaA e Central-Alarmes NÃO devem receber; só o Servico-Logs.");
  tempFabA.publicarLeitura(95.0);
  await esperar();

  // ===========================================================================
  etapa("ETAPA 6 — Tópico sem assinantes");
  // Um sensor novo publica em um tópico sem ninguém inscrito (e o log também
  // sai). O publisher não quebra: o Broker apenas não entrega para ninguém.
  // ===========================================================================
  const sensorNovo = new Sensor(broker, "UMID-N01", "zona-norte", "umidade");
  broker.unsubscribe("*/*", log);
  sensorNovo.publicarLeitura(40);
  console.log("   (nenhum assinante — o publisher segue funcionando normalmente)");
  await esperar();

  etapa("✅ Fim da simulação — veja o histórico em logs/leituras.log");
}

// Ponto de entrada do programa
main();
