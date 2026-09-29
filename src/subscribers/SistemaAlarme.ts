import { Assinante, LeituraSensor, TipoSensor } from "../types";

/** Limites de segurança por tipo de sensor. */
const LIMITES: Record<TipoSensor, { min: number; max: number }> = {
  temperatura: { min: 5, max: 80 },
  umidade: { min: 20, max: 85 },
  pressao: { min: 1, max: 8 },
  poluicao: { min: 0, max: 150 },
};

/** Subscriber: dispara alarme quando a leitura sai da faixa segura. */
export class SistemaAlarme implements Assinante {
  constructor(readonly id: string) {}

  receber(topico: string, m: LeituraSensor): void {
    const { min, max } = LIMITES[m.tipo];
    if (m.valor < min || m.valor > max) {
      console.log(
        `   🚨 [${this.id}] ALARME em ${topico}: ${m.valor}${m.unidade} fora da faixa (${min}–${max})`,
      );
    } else {
      console.log(`   ✅ [${this.id}] ${topico} dentro do limite`);
    }
  }
}
