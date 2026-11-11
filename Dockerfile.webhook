# Protótipo para revisão no EasyPanel: ainda não processa eventos nem envia respostas.
FROM node:24-slim
ENV NODE_ENV=production FLUXO_WEBHOOK_PORT=8766 FLUXO_WEBHOOK_HOST=0.0.0.0 FLUXO_WEBHOOK_DB=/data/eventos.sqlite
WORKDIR /app
COPY --chown=node:node webhook.cjs motor-regras.cjs processador.cjs status-acoes.cjs controle-ativacao.cjs /app/
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8766
CMD ["node", "webhook.cjs"]
