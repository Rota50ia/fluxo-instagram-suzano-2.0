# Integração de comentários: estado e preparação

## Implementado localmente

O receptor verifica o token de inscrição e a assinatura HMAC, grava as entregas em SQLite e pode planejar uma resposta por comentário para uma única conta e publicação. Uma tarefa registrada como `enviando` ou `incerta` não é repetida automaticamente: caso a confirmação da Meta se perca, é necessário verificar o resultado antes de qualquer nova tentativa. O envio usa a API de mensagens com o ID do comentário como destinatário.

As opções de processar regras e de enviar são independentes e **desativadas por padrão**. O envio depende de configuração explícita; não deve ser habilitado antes de verificar os eventos reais, a identidade da conta recebida pela Meta, as permissões, o controle de acesso e o armazenamento.

A regra inicial é o rascunho local da publicação `https://www.instagram.com/p/DfnKnp0hNOM/`, identificada na consulta à API como `18093869495691947`. O painel local ainda não sincroniza suas regras com a VPS: a primeira regra no servidor depende de configuração separada. Não apresentar a interface como controle das automações remotas.

## Variáveis previstas no serviço

As duas variáveis de verificação do webhook já estão configuradas no EasyPanel. As variáveis abaixo são documentadas para revisão; não há necessidade de adicioná-las ou habilitá-las antes dos testes reais:

- `FLUXO_REGRA_ATIVA`: somente `sim` permite planejar respostas; ausente mantém a regra desligada.
- `FLUXO_ENVIO_ATIVO`: somente `sim` permite enviar; ausente mantém o envio desligado.
- `FLUXO_INSTAGRAM_ID`: identificador da conta no evento, a confirmar com a Meta.
- `FLUXO_PUBLICACAO_ID`: identificador do post escolhido.
- `FLUXO_MENSAGEM`: texto da resposta.
- `FLUXO_ATIVACAO_APOS`: data UTC ISO 8601 com milissegundos; entregas anteriores a ela não geram ações.
- `FLUXO_INSTAGRAM_TOKEN`: token de acesso da conta, que só deve ser configurado em armazenamento seguro no servidor.

`node status-acoes.cjs`, executado dentro do contêiner, fornece somente contagens por estado. Dados das entregas e mensagens ficam em `/data/eventos.sqlite`; configure backup e política de retenção antes do uso real. A deduplicação da resposta usa a conta e o ID do comentário. O receptor ainda deduplica entregas com corpo idêntico.

## Verificação e limites

Foram executados testes locais com dados fictícios: correspondência de palavras e publicação, checagem da assinatura do webhook, registro de entregas, deduplicação e planejamento; o envio foi testado com um transporte simulado, incluindo erro de rede. Nenhuma mensagem real foi enviada. A imagem do contêiner e o processamento integrado ainda não foram implantados nem testados na VPS.

Antes da ativação, testar com usuários autorizados, conferir se o webhook recebe o evento correto e se a assinatura é verificada, confirmar o ID da conta no evento, validar o endpoint de resposta privada com a API da Meta e conferir o fluxo de acompanhamento dos erros. A disponibilidade para contas fora das funções do aplicativo depende da configuração e das permissões aprovadas na Meta.

## Teste do webhook na VPS

Em 11 de novembro de 2026, o usuário configurou o domínio público do EasyPanel para encaminhar HTTP ao serviço na porta 8766, cadastrou a URL de callback na Meta e verificou o token. O campo `comments` aparecia como assinado. A Meta enviou seu evento fictício de teste e o usuário confirmou no banco persistente da VPS uma entrega contendo o identificador do exemplo. O receptor exige assinatura válida antes de registrar a entrega, portanto esse resultado confirma o caminho e a validação para esse teste específico.

O processamento de regras e o envio permaneciam desativados por padrão. Esse teste não confirma o recebimento de comentários reais, o status de publicação do aplicativo, a assinatura do webhook no nível da conta, as permissões para público externo ou o envio de direct.

Em seguida, o usuário informou que ativou a assinatura de webhook da conta `@suzanoexpress`. A Meta informou na interface que o app precisa estar publicado para receber webhooks; o funcionamento com comentários reais ainda não foi confirmado.

Em seguida, o usuário informou que publicou o aplicativo na Meta e repetiu o teste comentando `QUERO` no post escolhido. A consulta ao banco do serviço confirmou uma entrega real correspondente ao post `18093869495691947`, com `entry.id` da conta `17841407777954952`. O ID da conta no evento é diferente do ID retornado anteriormente pela consulta `/me`; para a configuração do filtro de eventos, usar o ID efetivamente observado no webhook e validar também o identificador exigido pela API de envio. A regra e o envio continuavam desativados durante esse teste.

## Modo de teste direcionado

Foi preparado localmente um modo de teste desligado por padrão. Quando explicitamente habilitado, ele seleciona somente uma ação pendente pelo ID do comentário e pelo ID da conta, mesmo com a regra e o envio normais desligados. Após uma tentativa, o estado é salvo e não há repetição automática para o mesmo comentário. O envio real só deve ser ativado após confirmação do usuário e após a atualização controlada na VPS.

Variáveis de teste: `FLUXO_TESTE_ENVIO=sim` e `FLUXO_TESTE_COMENTARIO_ID` com o identificador exato. Quando não estiver em teste, manter `FLUXO_TESTE_ENVIO=nao` ou ausente. Não habilitar esse modo simultaneamente ao envio normal. O teste usa o token já armazenado no ambiente da VPS; não o exibir em logs nem compartilhá-lo no chat.

A resposta da API pode ser `enviada`, `falhou` ou `incerta`. Se for incerta, não repetir sem verificar se o destinatário recebeu a mensagem. A API real ainda não foi testada para o envio de respostas privadas.
