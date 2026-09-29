import { appendFile, mkdir } from "node:fs/promises";
import { Assinante, LeituraSensor } from "../types";

/**
 * Subscriber: serviço de logs que grava todas as leituras recebidas
 * em arquivo (logs/leituras.log). É assíncrono (I/O em disco),
 * mostrando que um assinante lento não bloqueia os outros.
 */
export class ServicoLog implements Assinante {
  private readonly arquivo = "logs/leituras.log";

  constructor(readonly id: string) {}

  async receber(topico: string, m: LeituraSensor): Promise<void> {
    await mkdir("logs", { recursive: true });
    const linha = `${m.timestamp.toISOString()};${topico};${m.sensorId};${m.valor};${m.unidade}\n`;
    await appendFile(this.arquivo, linha);
    console.log(`   📝 [${this.id}] gravou leitura de ${topico}`);
  }
}
