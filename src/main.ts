import { PubSub } from "./broker/PubSub";
import { Sensor } from "./publishers/Sensor";
import { PainelOperador } from "./subscribers/PainelOperador";
import { SistemaAlarme } from "./subscribers/SistemaAlarme";
import { ServicoLog } from "./subscribers/ServicoLog";

/** Pausa entre as etapas para facilitar a demonstração ao vivo. */
const PAUSA_MS = Number(process.env.PAUSA_MS ?? 800);
const esperar = (ms = PAUSA_MS) => new Promise((r) => setTimeout(r, ms));
const etapa = (titulo: string) =>
  console.log(`\n${"=".repeat(64)}\n${titulo}\n${"=".repeat(64)}`);

async function main() {
  etapa("🏭 MONITORAMENTO IoT — Cidade Inteligente / Indústria 4.0 (Pub/Sub)");

  // 1) Broker central
  const broker = new PubSub();

  // 2) Publishers (sensores)
  const tempFabA = new Sensor(broker, "TEMP-A01", "fabrica-a", "temperatura");
  const umidFabA = new Sensor(broker, "UMID-A01", "fabrica-a", "umidade");
  const pressFabB = new Sensor(broker, "PRES-B01", "fabrica-b", "pressao");
  const polCentro = new Sensor(broker, "POL-C01", "centro", "poluicao");
  const polZonaSul = new Sensor(broker, "POL-S01", "zona-sul", "poluicao");

  // 3) Subscribers
  const painelFabA = new PainelOperador("Painel-Operador-FabricaA");
  const painelCidade = new PainelOperador("Painel-Prefeitura");
  const alarme = new SistemaAlarme("Central-Alarmes");
  const log = new ServicoLog("Servico-Logs");

  etapa("ETAPA 1 — Inscrições (subscribe)");
  broker.subscribe("fabrica-a/*", painelFabA);          // tudo da Fábrica A
  broker.subscribe("*/poluicao", painelCidade);         // poluição de todas as regiões
  broker.subscribe("fabrica-a/temperatura", alarme);
  broker.subscribe("fabrica-b/pressao", alarme);
  broker.subscribe("*/poluicao", alarme);
  broker.subscribe("*/*", log);                         // log recebe tudo
  console.log("\nTópicos ativos:", broker.listarTopicos());
  await esperar();

  etapa("ETAPA 2 — Leituras normais (publish)");
  tempFabA.publicarLeitura(42.5);
  await esperar();
  umidFabA.publicarLeitura(55);
  await esperar();
  polCentro.publicarLeitura(68);
  await esperar();

  etapa("ETAPA 3 — Leituras críticas disparam alarme");
  tempFabA.publicarLeitura(93.1);
  await esperar();
  pressFabB.publicarLeitura(9.4);
  await esperar();
  polZonaSul.publicarLeitura(187);
  await esperar();

  etapa("ETAPA 4 — Desinscrição (unsubscribe)");
  console.log("Operador da Fábrica A encerra o turno; alarme deixa de vigiar a temperatura da Fábrica A.");
  broker.unsubscribe("fabrica-a/*", painelFabA);
  broker.unsubscribe("fabrica-a/temperatura", alarme);
  console.log("\nTópicos ativos:", broker.listarTopicos());
  await esperar();

  etapa("ETAPA 5 — Nova publicação após unsubscribe");
  console.log("Painel-Operador-FabricaA e Central-Alarmes NÃO devem receber; só o Servico-Logs.");
  tempFabA.publicarLeitura(95.0);
  await esperar();

  etapa("ETAPA 6 — Tópico sem assinantes");
  const sensorNovo = new Sensor(broker, "UMID-N01", "zona-norte", "umidade");
  broker.unsubscribe("*/*", log);
  sensorNovo.publicarLeitura(40);
  console.log("   (nenhum assinante — o publisher segue funcionando normalmente)");
  await esperar();

  etapa("✅ Fim da simulação — veja o histórico em logs/leituras.log");
}

main();
