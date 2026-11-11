# Configuração do aplicativo na Meta

**Projeto:** Fluxo para Instagram  
**Atualizado em:** 11 de novembro de 2026

## Primeiro passo: localizar ou criar o aplicativo

1. Acesse [Meus aplicativos](https://developers.facebook.com/apps/) com sua conta de desenvolvedor.
2. Se já houver um aplicativo que queira usar para este projeto, abra-o e confira as opções disponíveis. Não altere a configuração de aplicativos de outras integrações sem revisar seus usos.
3. Se ainda não houver um aplicativo para o Fluxo, selecione **Criar aplicativo**. Quando solicitado, use, por exemplo, o nome `Fluxo Instagram` e seu e-mail de contato.
4. Na etapa de casos de uso ou produtos, procure a opção relacionada à **API do Instagram**, ao gerenciamento de mensagens ou comentários. Os nomes e a ordem das telas podem variar. Anote as opções exibidas antes de escolher se houver dúvida.
5. Concluída a criação, mantenha o aplicativo em desenvolvimento enquanto preparamos a integração e os testes.

## Para as próximas etapas

O perfil que será conectado precisa ser profissional. A Meta oferece caminhos diferentes, incluindo Instagram Login e Facebook Login, com requisitos e permissões próprios. No caminho com Instagram Login, a [documentação oficial da Meta](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) lista, entre outras, as permissões `instagram_business_basic`, `instagram_business_manage_messages` e `instagram_business_manage_comments`. A disponibilidade de cada recurso deve ser verificada no aplicativo concreto.

Quando chegarmos à configuração de webhooks, precisaremos primeiro implementar um endpoint HTTPS acessível à Meta. O endereço local do painel não é um webhook público e o servidor atual ainda não implementa essa integração. Não preencha valores inventados.

A conta de desenvolvedor, o aplicativo, as permissões, a assinatura dos eventos e o backend precisam estar configurados e testados antes que haja automação real. A disponibilidade para pessoas fora dos papéis de teste pode exigir liberações adicionais da Meta.

Não enviar por mensagens senhas, tokens, chaves, códigos de autenticação ou segredo do aplicativo. Se precisar mostrar a tela, oculte esses dados.

## Progresso confirmado na conversa

- O usuário adicionou o caso de uso do Instagram ao aplicativo existente `suzano express atendimento`.
- A conta profissional `@suzanoexpress` aceitou o convite de testador e gerou um token de acesso.
- A tela de autorização incluiu mensagens, comentários, publicação e insights. A concessão real e o acesso por API ainda precisam ser verificados.
- O painel local permite guardar manualmente o token no Chaves do macOS. Armazená-lo não valida a credencial, não implementa a API e não habilita os webhooks. Não registrar o valor do token neste documento.
- O endpoint público de webhook e o envio e recebimento de eventos ainda precisam ser implementados e testados.


## Verificação realizada em 11 de novembro de 2026

A consulta de leitura à API do Instagram respondeu com sucesso para `@suzanoexpress`, utilizando o token armazenado no Chaves. Essa verificação confirma acesso básico à conta, mas não comprova que mensagens, comentários ou webhooks estejam funcionando. O token não foi exibido ou registrado na documentação.

O projeto também possui um receptor local experimental em `webhook.cjs`, separado do painel. Ele valida o desafio e a assinatura, registra entregas válidas em um banco local e ignora entregas com o mesmo conteúdo exato. Ele ainda não processa as entregas nem envia respostas. Foi testado apenas com dados fictícios; não foi ligado à Meta nem publicado. A configuração e a origem exata do segredo de assinatura devem ser confirmadas para o aplicativo e o método de login antes de qualquer publicação.

**Próxima etapa:** definir onde hospedar o receptor com HTTPS e preparar o processamento seguro dos eventos. O endpoint público deve expor somente o receptor de webhook, nunca o painel ou o banco de dados. Em modo de desenvolvimento, a Meta pode limitar os eventos aos usuários que tenham funções de teste.
