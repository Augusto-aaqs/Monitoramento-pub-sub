import { Assinante, LeituraSensor } from "../types";

/**
 * Broker (Gerenciador de Tópicos) do padrão Publish-Subscribe.
 *
 * - Mantém um mapa  tópico -> conjunto de assinantes.
 * - Publishers chamam publish() sem saber quem vai receber.
 * - Subscribers chamam subscribe() sem saber quem publica.
 * - A entrega é ASSÍNCRONA: publish() retorna imediatamente e cada
 *   assinante é notificado de forma independente (uma falha em um
 *   assinante não afeta os demais nem o publisher).
 *
 * Tópicos seguem o formato "local/tipo" (ex.: "fabrica-a/temperatura").
 * Suporta o curinga "*" em um segmento na inscrição
 * (ex.: "fabrica-a/*" recebe todos os sensores da Fábrica A;
 *       "*\/poluicao" recebe poluição de todas as regiões).
 */
export class PubSub {
  private topicos = new Map<string, Set<Assinante>>();

  subscribe(topico: string, assinante: Assinante): void {
    if (!this.topicos.has(topico)) {
      this.topicos.set(topico, new Set());
    }
    this.topicos.get(topico)!.add(assinante);
    console.log(`  [BROKER] ${assinante.id} INSCRITO em "${topico}"`);
  }

  unsubscribe(topico: string, assinante: Assinante): void {
    const assinantes = this.topicos.get(topico);
    if (!assinantes || !assinantes.delete(assinante)) {
      console.log(`  [BROKER] ${assinante.id} não estava inscrito em "${topico}"`);
      return;
    }
    if (assinantes.size === 0) this.topicos.delete(topico);
    console.log(`  [BROKER] ${assinante.id} DESINSCRITO de "${topico}"`);
  }

  /**
   * Publica a mensagem para todos os assinantes ativos do tópico
   * (incluindo inscrições com curinga). Retorna quantos foram notificados.
   */
  publish(topico: string, mensagem: LeituraSensor): number {
    const destinatarios = new Set<Assinante>();
    for (const [padrao, assinantes] of this.topicos) {
      if (PubSub.casa(padrao, topico)) {
        assinantes.forEach((a) => destinatarios.add(a));
      }
    }

    for (const assinante of destinatarios) {
      // Entrega assíncrona e isolada por assinante
      setImmediate(async () => {
        try {
          await assinante.receber(topico, mensagem);
        } catch (erro) {
          console.error(`  [BROKER] Falha ao entregar para ${assinante.id}:`, erro);
        }
      });
    }
    return destinatarios.size;
  }

  /** Lista os tópicos ativos e seus assinantes (útil na demonstração). */
  listarTopicos(): Record<string, string[]> {
    const saida: Record<string, string[]> = {};
    for (const [topico, assinantes] of this.topicos) {
      saida[topico] = [...assinantes].map((a) => a.id);
    }
    return saida;
  }

  /** Verifica se um padrão de inscrição (com "*") casa com o tópico publicado. */
  private static casa(padrao: string, topico: string): boolean {
    if (padrao === topico) return true;
    const p = padrao.split("/");
    const t = topico.split("/");
    return p.length === t.length && p.every((seg, i) => seg === "*" || seg === t[i]);
  }
}
