# Roteiro da apresentação (máx. 15 min)

## 1. Cenário e arquitetura — 3 a 5 min

- **Problema:** sensores de temperatura, umidade, pressão e poluição em fábricas e regiões da cidade; vários sistemas (painéis, alarmes, logs) querem partes diferentes dessas leituras.
- **Sem Pub/Sub:** cada sensor chamaria cada sistema → alto acoplamento; um painel novo exige mudar todos os sensores.
- **Com Pub/Sub:** sensor publica em um tópico `local/tipo`; sistemas se inscrevem no que interessa; o **Broker** faz a ponte.
- Mostrar o diagrama do README e os três métodos do Broker (`subscribe`, `unsubscribe`, `publish`) em `src/broker/PubSub.js`.
- Destaques: curinga `*` (ex.: `*/poluicao`), entrega assíncrona com `setImmediate`, falha de um assinante não derruba os outros.

## 2. Demonstração ao vivo — 5 a 7 min

Rodar: `PAUSA_MS=2000 npm start` (Windows: `$env:PAUSA_MS=2000; npm start`) e comentar cada etapa:

1. Inscrições → mostrar a tabela "Tópicos ativos".
2. Leituras normais → quem recebeu e por quê (qual inscrição casou).
3. Leituras críticas → 🚨 alarmes.
4. Unsubscribe → tabela de tópicos encolhe.
5. Nova publicação → painel e alarme **não** recebem mais (prova da cessação).
6. Tópico sem assinantes → publisher não quebra.
7. Abrir `logs/leituras.log` para mostrar o histórico gravado.

## 3. Perguntas prováveis — 3 min

- **Qual a diferença para chamar o método direto?** O sensor não conhece quem consome; dá para adicionar/remover consumidores sem alterar o sensor.
- **Por que é assíncrono?** `publish()` não espera os assinantes; um assinante lento (ex.: log em disco) não atrasa o sensor nem os outros.
- **E se um assinante der erro?** O Broker captura a exceção (try/catch por assinante) e segue entregando aos demais.
- **Como levar para produção?** Trocar o Broker em memória por um broker real: **MQTT** (Mosquitto, padrão em IoT), Redis Pub/Sub, RabbitMQ, Kafka ou Google Cloud Pub/Sub/AWS SNS — o conceito é o mesmo.
- **Limitação desta versão?** Broker em memória, único processo: não há persistência de mensagens nem garantia de entrega se o assinante estiver offline (em MQTT isso se resolve com QoS e mensagens retidas).

## Divisão sugerida entre os integrantes

| Integrante | Parte |
|---|---|
| 1 | Cenário e problema do acoplamento |
| 2 | Arquitetura e código do Broker |
| 3 | Demonstração ao vivo |
| 4 | Perguntas / limitações e evolução para MQTT |
