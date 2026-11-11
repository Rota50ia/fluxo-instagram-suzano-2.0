# Hospedagem do Fluxo na VPS Hostinger

**Atualizado em:** 11 de novembro de 2026

O usuário informou que tem uma VPS na Hostinger e uma hospedagem com cPanel na HostGator. A VPS é a candidata inicial para hospedar o receptor de eventos do Instagram; O usuário informou que administra a VPS pelo EasyPanel e hospeda nela o blog `suzanoblog.suzanoexpress.com.br`. Os demais serviços, recursos disponíveis e domínio do Fluxo ainda precisam ser conhecidos.

## Próximas verificações

1. Identificar como a VPS é administrada (SSH, Docker, EasyPanel ou outro painel), quais serviços já estão em execução e se há recursos disponíveis.
2. Escolher um domínio ou subdomínio para o webhook e verificar onde sua zona DNS é administrada. Um registro específico para o subdomínio pode apontar para a VPS sem modificar o domínio principal; a [Hostinger documenta esse apontamento](https://support.hostinger.com/pt/articles/8907694-como-criar-um-subdominio-sem-ter-um-plano-de-hospedagem).
3. Planejar HTTPS, isolamento, backup, monitoramento e armazenamento seguro dos segredos. O Chaves do macOS é local; o token não estará automaticamente na VPS.
4. Finalizar processamento de eventos e envio de respostas, verificar a assinatura adequada ao aplicativo, preparar e testar uma implantação antes de publicá-la. O receptor atual é experimental e ainda não responde a mensagens reais.

Não reinstalar o sistema operacional, nem substituir aplicações ou modificar DNS sem revisar a infraestrutura existente. Nunca enviar senhas, tokens ou chaves pelo chat.

## Preparação local para o EasyPanel

Foi preparado `Dockerfile.webhook`, que copia somente o receptor `webhook.cjs`, e `.dockerignore`, que impede o envio acidental do banco local, código do painel e credenciais no contexto de construção. O receptor aceita configurar a interface de escuta para funcionar atrás do proxy do contêiner. O teste local de assinatura e registro passou após essa alteração; a imagem Docker ainda não foi construída nem testada, pois o Docker não está disponível neste Mac.

O serviço continua sendo um protótipo: não executar deploy para receber eventos reais até concluir o processamento, validar os segredos e testar a implantação. Será necessário um volume persistente com permissões para o usuário do contêiner, HTTPS e proteção adequada. Não expor o painel local pelo serviço de webhook.

## Serviço e pacote preparados

O usuário criou o serviço `fluxo-instagram` no projeto `suzanoblog` do EasyPanel. Foi criado o arquivo `fluxo-webhook-teste.zip` com apenas `Dockerfile`, `webhook.cjs` e `LEIA-ME.txt`, sem tokens ou dados locais. Este pacote é um protótipo de recepção e não processa eventos nem envia respostas. O upload do código, se realizado, não deve ser confundido com publicação ou integração operacional; o deploy, as variáveis, o volume persistente e a configuração do domínio ainda precisam ser preparados e testados.

## Repositório

O projeto usa o repositório privado `Rota50ia/fluxo-instagram-suzano-2.0`. O `Dockerfile` na raiz representa somente o receptor experimental, não uma automação completa. O EasyPanel deve usar a fonte GitHub e esse Dockerfile quando a implantação estiver pronta para revisão. Dados locais, arquivos `.env` e pacotes gerados não devem ser enviados ao Git.
