# 🏭 Pub/Sub para Monitoramento IoT — Cidades Inteligentes / Indústria 4.0

Atividade processual sobre o padrão **Publish-Subscribe (Pub/Sub)** em Sistemas Distribuídos.

| | |
|---|---|
| **Disciplina** | Sistemas Computacionais Distribuídos e Computação em Nuvem |
| **Professor(a)** | Ana Paula Rezende |
| **Tema** | 1 — Sistemas de Monitoramento IoT (Cidades Inteligentes / Indústria 4.0) |
| **Integrantes** | Augusto Antônio Queirós Silva · Luís Felipe Da Silva Abreu|

---

## 📌 Cenário

Uma cidade inteligente e seu parque industrial possuem **sensores IoT** espalhados por fábricas e regiões, medindo **temperatura, umidade, pressão e nível de poluição**. Vários sistemas diferentes precisam dessas leituras — mas cada um se interessa por uma parte delas:

- o **operador da Fábrica A** quer ver tudo que acontece na sua fábrica;
- a **prefeitura** acompanha a poluição de todas as regiões;
- a **central de alarmes** vigia só os sensores críticos e dispara alertas quando uma leitura sai da faixa segura;
- o **serviço de logs** grava todo o histórico em arquivo.

Se cada sensor tivesse que conhecer e chamar cada sistema diretamente, adicionar um novo painel exigiria reprogramar todos os sensores. Com **Pub/Sub**, os sensores apenas **publicam** no **Broker** em um tópico, e cada sistema se **inscreve** nos tópicos que lhe interessam. Sensores e sistemas **não se conhecem** (desacoplamento).

## 🧩 Arquitetura

```
  PUBLISHERS (sensores)            BROKER (PubSub)                 SUBSCRIBERS
 ┌───────────────────┐        ┌───────────────────────┐        ┌──────────────────────────┐
 │ TEMP-A01          │─publish│ fabrica-a/*           │───────▶│ Painel-Operador-FabricaA │
 │ UMID-A01          │───────▶│ fabrica-a/temperatura │───────▶│ Central-Alarmes          │
 │ PRES-B01          │        │ fabrica-b/pressao     │        │ Painel-Prefeitura        │
 │ POL-C01 / POL-S01 │        │ */poluicao            │───────▶│ Servico-Logs             │
 └───────────────────┘        │ */*                   │        └──────────────────────────┘
                              └───────────────────────┘
```

**Tópicos** seguem o formato `local/tipo` — ex.: `fabrica-a/temperatura`, `centro/poluicao`.
Na inscrição é possível usar o curinga `*` em um segmento:

| Inscrição | Recebe |
|---|---|
| `fabrica-a/temperatura` | só a temperatura da Fábrica A |
| `fabrica-a/*` | todos os sensores da Fábrica A |
| `*/poluicao` | poluição de todas as regiões |
| `*/*` | tudo |

### Componentes

| Papel | Arquivo | Responsabilidade |
|---|---|---|
| **Broker** | `src/broker/PubSub.js` | `subscribe`, `unsubscribe`, `publish`; guarda o mapa tópico → assinantes e entrega as mensagens |
| **Publisher** | `src/publishers/Sensor.js` | Sensor IoT que publica leituras no seu tópico |
| **Subscriber** | `src/subscribers/PainelOperador.js` | Exibe as leituras recebidas |
| **Subscriber** | `src/subscribers/SistemaAlarme.js` | Compara com limites e dispara alarme |
| **Subscriber** | `src/subscribers/ServicoLog.js` | Grava cada leitura em `logs/leituras.log` (I/O assíncrono) |
| **Contrato** | `src/Assinante.js` | Classe base de todo assinante (`id` + `receber()`) e formato da mensagem |
| **Simulação** | `src/main.js` | Cria tudo, inscreve, publica e demonstra o unsubscribe |

### Decisões de projeto

- **Desacoplamento:** publishers e subscribers dependem apenas do Broker e da classe base `Assinante`.
- **Entrega assíncrona:** `publish()` retorna na hora; cada assinante é notificado em `setImmediate`, de forma independente.
- **Isolamento de falhas:** um erro em um assinante é capturado pelo Broker e não afeta os demais nem o sensor.
- **Sem duplicidade:** se um assinante casa com o tópico por mais de uma inscrição, recebe a mensagem uma só vez.

## ▶️ Como executar

Feito em **JavaScript puro**, sem nenhuma dependência externa. Pré-requisito: **Node.js 16+** ([nodejs.org](https://nodejs.org)).

```bash
git clone https://github.com/SEU-USUARIO/pubsub-iot-monitoramento.git
cd pubsub-iot-monitoramento
npm start          # ou: node src/main.js
```

Não é preciso rodar `npm install`. Para uma pausa maior entre as etapas:

```bash
PAUSA_MS=2000 npm start     # pausa maior entre as etapas (bom para a apresentação)
```

No Windows (PowerShell): `$env:PAUSA_MS=2000; npm start`

## 🖥️ O que a simulação mostra

1. **Inscrições** — cada sistema se inscreve nos seus tópicos.
2. **Leituras normais** — assinantes recebem; o alarme confirma "dentro do limite".
3. **Leituras críticas** — temperatura 93 °C, pressão 9,4 bar e poluição 187 AQI disparam 🚨.
4. **Unsubscribe** — o operador da Fábrica A encerra o turno e o alarme deixa de vigiar essa temperatura.
5. **Publicação após unsubscribe** — os desinscritos **não** recebem mais; só o serviço de logs.
6. **Tópico sem assinantes** — o sensor publica normalmente e ninguém é notificado.

Trecho da saída:

```
📡 [TEMP-A01] publicou 93.1°C em "fabrica-a/temperatura" -> 3 assinante(s)
   🖥️  [Painel-Operador-FabricaA] fabrica-a/temperatura: 93.1°C (sensor TEMP-A01)
   🚨 [Central-Alarmes] ALARME em fabrica-a/temperatura: 93.1°C fora da faixa (5–80)
   📝 [Servico-Logs] gravou leitura de fabrica-a/temperatura
```

## 📚 Referência

- Código Fonte TV — [Descomplicamos o Pub/Sub pra você entender de uma vez](https://www.youtube.com/watch?v=yF6HVACM7ow)
