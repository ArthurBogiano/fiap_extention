## Download da versão mais recente

Versão atual: **1.5.4**

- [Baixar `fiap_extention.zip`](./fiap_extention.zip)

## Tutorial para Instalação de Extensão no Google Chrome usando Modo Desenvolvedor

Este tutorial irá guiá-lo passo a passo na instalação de uma extensão do Google Chrome utilizando o modo desenvolvedor e baixando os arquivos de um repositório Git dentro da pasta `fiap_extension`.

**Pré-requisitos:**

- Navegador Google Chrome instalado e atualizado.
- Conta do GitHub com acesso ao repositório da extensão.

**Etapas:**

1. **Clone o Repositório Git:**

   ```bash
   git clone https://github.com/ArthurBogiano/fiap_extention.git fiap_extention
   ```

   Isso clonará o repositório Git para a pasta `fiap_extention`.

2. **Abra o Google Chrome:**

   Inicie o navegador Google Chrome.

3. **Acesse a página de extensões:**

   Na barra de endereços do Chrome, digite `chrome://extensions/` e pressione Enter.

4. **Ative o modo desenvolvedor:**

No canto superior direito da página de extensões, clique no botão `Mais ferramentas` (três pontos) e selecione `Modo desenvolvedor`. ou
No canto superior direito da página de extensões, clique no toggle `Modo desenvolvedor`.
Para ativar o modo desenvolvedor no Chrome.

5. **Carregue a extensão descompactada:**

   Clique no botão `Carregar sem compactação` na parte superior esquerda da página.

6. **Selecione a pasta da extensão:**

Na caixa de diálogo que se abrir, navegue até a pasta `fiap_extention` que você clonou no passo 1, onde está localizado o arquivo `manifest.json` referente á extensão e á selecione.

7. **Clique em "Abrir":**

A extensão será carregada no seu navegador.

8. **Verifique se a extensão está instalada:**

Na lista de extensões instaladas, procure pela extensão que você instalou. Ela deve estar listada com o status "Ativado".

**Observações:**

- Ao carregar a extensão descompactada, você está instalando a extensão apenas para o seu navegador e perfil específicos. Para instalar a extensão para todos os usuários do seu computador, você precisaria empacotar a extensão e publicá-la na Chrome Web Store.
- Se você fizer alterações nos arquivos da extensão, precisará recarregar a extensão para que as alterações sejam aplicadas.

**Conclusão:**

Com este tutorial, você aprendeu como instalar uma extensão do Google Chrome utilizando o modo desenvolvedor e baixando os arquivos de um repositório Git.

**Funcionalidades da extensão**

1. Visualizar todos os videos de uma playlist, dentro das fases escolha um capítulo e clique no "play", para ir para a playlist de videos,
   nesta tela basta na extensão clicar em `Visualizar todos os videos`

2. Desbloquear copie e cola no fast-test, dentro do fast-test ao clicar neste botão e depois clicar no título de alguma pergunta, a pergunta em questão é copiada para sua área de transferência

3. Exibir resposta das perguntas do fast-test, Ao abrir um fast-test as respostas são exibidas com uma borda verde-claro

4. Indicadores de carregamento, ao remover ou habilitar essa opção é possível exibir o status das ações acima.
