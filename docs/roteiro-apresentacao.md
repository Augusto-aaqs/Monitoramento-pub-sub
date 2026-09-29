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

