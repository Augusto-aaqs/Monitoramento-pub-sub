/**
 * ============================================================================
 * PubSub.ts — BROKER (Gerenciador de Tópicos)
 * ============================================================================
 * É o "intermediário" do padrão Publish-Subscribe. Funciona como uma
 * central de correios:
 *   - Subscribers dizem ao Broker: "quero receber mensagens do tópico X"
 *     -> subscribe()
 *   - Subscribers podem desistir: "não quero mais receber do tópico X"
 *     -> unsubscribe()
 *   - Publishers entregam uma mensagem ao Broker: "chegou algo no tópico X"
 *     -> publish()  => o Broker repassa para todos os inscritos em X.
 *
 * Publishers e Subscribers NÃO se conhecem: ambos só falam com o Broker.
 *
 * Formato dos tópicos: "local/tipo"  (ex.: "fabrica-a/temperatura")
 * Curinga "*": na inscrição, "*" vale para qualquer valor naquele segmento.
 *   "fabrica-a/*"  -> todos os sensores da Fábrica A
 *   "*\/poluicao"  -> poluição de todas as regiões
 *   "*\/*"         -> absolutamente tudo
 * ============================================================================
 */

import { Assinante, LeituraSensor } from "../types";

export class PubSub {
  /**
   * Estrutura central do Broker: um mapa  tópico -> conjunto de assinantes.
   *
   * Exemplo de conteúdo:
   *   "fabrica-a/*"  -> { Painel-Operador-FabricaA }
   *   "*\/poluicao"  -> { Painel-Prefeitura, Central-Alarmes }
   *
   * Usamos Set (conjunto) em vez de array para que o mesmo assinante
   * não seja inscrito duas vezes no mesmo tópico.
   */
  private topicos = new Map<string, Set<Assinante>>();

  /**
   * SUBSCRIBE — inscreve um assinante em um tópico.
   * Se o tópico ainda não existe no mapa, ele é criado na hora.
   *
   * @param topico    tópico (pode conter "*")
   * @param assinante objeto que implementa a interface Assinante
   */
  subscribe(topico: string, assinante: Assinante): void {
    // Cria o conjunto de assinantes do tópico, caso ainda não exista
    if (!this.topicos.has(topico)) {
      this.topicos.set(topico, new Set());
    }
    // Adiciona o assinante ao conjunto ("!" diz ao TS que o valor existe)
    this.topicos.get(topico)!.add(assinante);
    console.log(`  [BROKER] ${assinante.id} INSCRITO em "${topico}"`);
  }

  /**
   * UNSUBSCRIBE — remove um assinante de um tópico.
   * Depois disso ele deixa de receber as mensagens daquele tópico.
   *
   * @param topico    tópico exatamente como foi usado no subscribe
   * @param assinante assinante a ser removido
   */
  unsubscribe(topico: string, assinante: Assinante): void {
    const assinantes = this.topicos.get(topico);

    // Set.delete() retorna false se o assinante não estava no conjunto.
    // Se o tópico nem existe ou o assinante não estava inscrito, só avisamos.
    if (!assinantes || !assinantes.delete(assinante)) {
      console.log(`  [BROKER] ${assinante.id} não estava inscrito em "${topico}"`);
      return;
    }

    // Limpeza: se o tópico ficou sem ninguém, removemos ele do mapa
    if (assinantes.size === 0) this.topicos.delete(topico);
    console.log(`  [BROKER] ${assinante.id} DESINSCRITO de "${topico}"`);
  }

  /**
   * PUBLISH — publica uma mensagem em um tópico e notifica todos os
   * assinantes ativos (inclusive os inscritos por curinga).
   *
   * A entrega é ASSÍNCRONA: o método retorna imediatamente para o
   * publisher, e cada assinante é notificado de forma independente.
   *
   * @param topico   tópico concreto (sem "*"), ex.: "fabrica-a/temperatura"
   * @param mensagem leitura do sensor
   * @returns quantidade de assinantes que serão notificados
   */
  publish(topico: string, mensagem: LeituraSensor): number {
    // 1) Descobrir QUEM deve receber.
    //    Percorremos todas as inscrições e verificamos se o padrão casa
    //    com o tópico publicado. Usamos um Set para não entregar duas vezes
    //    ao mesmo assinante (ex.: inscrito em "*\/poluicao" e em "*\/*").
    const destinatarios = new Set<Assinante>();
    for (const [padrao, assinantes] of this.topicos) {
      if (PubSub.casa(padrao, topico)) {
        assinantes.forEach((a) => destinatarios.add(a));
      }
    }

    // 2) Entregar a mensagem para cada destinatário.
    for (const assinante of destinatarios) {
      // setImmediate agenda a entrega para a próxima volta do event loop:
      // o publish() não fica esperando os assinantes processarem.
      // Assim, um assinante lento (ex.: gravação em disco) não atrasa
      // o sensor nem os outros assinantes -> comunicação assíncrona.
      setImmediate(async () => {
        try {
          await assinante.receber(topico, mensagem);
        } catch (erro) {
          // Isolamento de falhas: se UM assinante der erro, o Broker
          // registra e continua; os demais recebem normalmente.
          console.error(`  [BROKER] Falha ao entregar para ${assinante.id}:`, erro);
        }
      });
    }

    // Retorna na hora, antes mesmo das entregas acontecerem
    return destinatarios.size;
  }

  /**
   * Retorna um "retrato" dos tópicos ativos e seus assinantes.
   * Não faz parte do padrão em si — serve para exibir o estado do Broker
   * durante a demonstração.
   */
  listarTopicos(): Record<string, string[]> {
    const saida: Record<string, string[]> = {};
    for (const [topico, assinantes] of this.topicos) {
      // Converte o Set de objetos em uma lista com os ids
      saida[topico] = [...assinantes].map((a) => a.id);
    }
    return saida;
  }

  /**
   * Verifica se um padrão de inscrição casa com o tópico publicado.
   *
   * Exemplos:
   *   casa("fabrica-a/temperatura", "fabrica-a/temperatura") -> true  (igual)
   *   casa("fabrica-a/*",           "fabrica-a/umidade")     -> true  (curinga)
   *   casa("*\/poluicao",            "centro/poluicao")       -> true  (curinga)
   *   casa("fabrica-a/*",           "fabrica-b/pressao")     -> false
   */
  private static casa(padrao: string, topico: string): boolean {
    // Caso mais simples: texto idêntico
    if (padrao === topico) return true;

    // Divide em segmentos: "fabrica-a/*" -> ["fabrica-a", "*"]
    const p = padrao.split("/");
    const t = topico.split("/");

    // Precisa ter o mesmo número de segmentos e cada segmento do padrão
    // deve ser "*" (qualquer coisa) ou igual ao segmento do tópico
    return p.length === t.length && p.every((seg, i) => seg === "*" || seg === t[i]);
  }
}
