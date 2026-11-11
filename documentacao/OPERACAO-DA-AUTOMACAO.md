# Operação da automação do Instagram

Este guia descreve o serviço `fluxo-instagram` no EasyPanel. O usuário confirmou o recebimento do teste e escolheu responder apenas aos novos comentários; a automação geral ainda precisa ser ativada.

## O que está configurado

- Conta: `@suzanoexpress`.
- Publicação: `https://www.instagram.com/p/DfnKnp0hNOM/`.
- Gatilho: palavra `QUERO` em comentário, inclusive em frases e variações de caixa, acentuação e pontuação.
- O receptor ignora comentários próprios e mensagens de outras contas ou publicações.
- O painel no Mac é uma prévia local e **não controla nem pausa o serviço remoto**.

## Verificar o serviço

No EasyPanel, abra `suzanoblog` → `fluxo-instagram` → terminal bash e execute:

```bash
node /app/status-acoes.cjs
```

O resultado mostra apenas contagens. `enviada` significa que a API da Meta retornou sucesso com um identificador de mensagem; confirme o recebimento na conta quando estiver testando. `falhou` representa uma resposta sem confirmação de sucesso. `enviando` ou `incerta` requer conferência antes de tentar novamente, pois a mensagem pode ter sido entregue mesmo sem confirmação. O sistema não repete essas situações automaticamente.

## Pausar

Na seção Ambiente do serviço, altere `FLUXO_REGRA_ATIVA` e `FLUXO_ENVIO_ATIVO` para `nao`, salve e implante novamente para aplicar. O sistema continua recebendo e guardando eventos, mas não planeja nem envia novas respostas. Não compartilhe capturas dessa tela: ela contém credenciais.

No modo preparado `FLUXO_ATIVACAO_APOS=auto`, o marco de ativação é persistido automaticamente; entregas recebidas antes dele serão marcadas como processadas sem envio. Isso usa a hora de chegada do webhook, portanto não garante excluir comentários antigos cuja entrega esteja atrasada. Defina a política desejada com o usuário antes de alterar esse valor. Verifique o funcionamento do webhook, a contagem de erros e o backup do volume `/data` durante a operação.

## Limitações atuais

O serviço não possui painel remoto de administração nem alerta automático de falhas. O token da Meta pode expirar ou perder permissões; o status deve ser acompanhado. A imagem e o banco persistente requerem manutenção, atualização e backup. Dados de eventos ficam armazenados na VPS e ainda precisam de política de retenção definida.
