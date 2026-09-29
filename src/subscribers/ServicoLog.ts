/**
 * ============================================================================
 * ServicoLog.ts — SUBSCRIBER
 * ============================================================================
 * Serviço de logs: grava cada leitura recebida em um arquivo texto
 * (logs/leituras.log), formando um histórico.
 *
 * Diferente dos outros assinantes, este é ASSÍNCRONO (async/await),
 * pois escrever em disco é uma operação de I/O mais lenta. Como o
 * Broker entrega as mensagens de forma independente, essa lentidão
 * não atrasa o sensor nem os outros assinantes.
 * ============================================================================
 */

// Versões com Promise das funções de arquivo do Node.js
import { appendFile, mkdir } from "node:fs/promises";
import { Assinante, LeituraSensor } from "../types";

export class ServicoLog implements Assinante {
  /** Caminho do arquivo onde as leituras são gravadas. */
  private readonly arquivo = "logs/leituras.log";

  /** @param id nome do serviço de logs */
  constructor(readonly id: string) {}

  /**
   * Chamado pelo Broker a cada nova mensagem.
   * Grava uma linha no arquivo, no formato CSV (separado por ";"):
   *   data/hora ; tópico ; sensor ; valor ; unidade
   */
  async receber(topico: string, m: LeituraSensor): Promise<void> {
    // Garante que a pasta "logs" exista (recursive: não dá erro se já existir)
    await mkdir("logs", { recursive: true });

    // Monta a linha e acrescenta ao final do arquivo
    const linha = `${m.timestamp.toISOString()};${topico};${m.sensorId};${m.valor};${m.unidade}\n`;
    await appendFile(this.arquivo, linha);

    console.log(`   📝 [${this.id}] gravou leitura de ${topico}`);
  }
}
