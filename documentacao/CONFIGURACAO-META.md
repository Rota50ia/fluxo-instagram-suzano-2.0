# Configuração da Meta — Fluxo para Instagram

**Atualizado em:** 11 de novembro de 2026. Esta página registra a configuração observada; confirme a interface e as regras da Meta antes de uma mudança futura.

## Configuração realizada

- Aplicativo existente: `suzano express atendimento`.
- Caso de uso: **Gerenciar mensagens e conteúdo no Instagram**; a conexão escolhida foi **API com login do Instagram**.
- Conta profissional: `@suzanoexpress`; o convite de testador foi aceito.
- O usuário autorizou permissões de perfil, comentários, mensagens, publicação e insights na tela da Meta. O acesso à API deve ser verificado novamente antes de depender de cada recurso.
- A Meta mostrou que a análise poderia ser pulada para uso apenas nas próprias empresas. Depois, o usuário informou que publicou o aplicativo.
- A URL HTTPS de callback foi verificada na Meta. O campo `comments` aparecia assinado e o usuário ativou a assinatura do webhook para a conta. Outros campos também apareciam assinados; não desative outros eventos sem avaliar o impacto.
- Um teste fictício e um comentário real chegaram ao receptor. Um direct de teste e, depois, um teste automático completo foram confirmados pelo usuário.

## Callback e segurança

Callback atual: `https://suzanoblog-fluxo-instagram.7lvlou.easypanel.host/webhook`. O EasyPanel encaminha o tráfego HTTPS para HTTP na porta interna `8766`. O endereço do painel local não é acessível pela Meta.

Há três credenciais com papéis diferentes: token de verificação do callback, chave do app para validar assinatura e token de acesso da conta para a API. Elas ficam no ambiente protegido do EasyPanel; uma cópia do token de acesso foi guardada no Chaves do Mac. **Não coloque valores, capturas, senhas ou tokens nesta documentação ou no chat.**

A chave do aplicativo e o token de verificação foram expostos numa captura e, segundo o usuário, substituídos. Após a substituição, uma nova entrega de teste foi registrada. Uma consulta separada confirmou acesso básico com o token de conta; não conclua que todas as permissões ou o prazo de validade estão monitorados.

## Alterações futuras

A documentação da Meta e a interface mudam. Antes de adicionar perfis, permissões, autenticação ou publicar alterações, confira a [documentação oficial da API do Instagram](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) e o estado do app. O uso para clientes ou terceiros não foi solicitado e pode exigir requisitos diferentes.

Se precisar trocar alguma credencial, coordene a atualização entre a Meta e o serviço, preserve a possibilidade de rollback e verifique o recebimento depois. Uma chave ou token antigo podem deixar de funcionar; consulte a Meta para o comportamento específico. Não mostre a seção Ambiente do EasyPanel em capturas.
