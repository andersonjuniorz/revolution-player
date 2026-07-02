# Sistema de Plugins (SDK & Arquitetura)

Bem-vindo à documentação do Sistema de Plugins do Revolution Player.

A arquitetura do nosso sistema foi desenhada sob um princípio fundamental: **Desacoplamento e Segurança**. O player deve ser capaz de tocar música com estabilidade absoluta, independentemente de extensões de terceiros.

A arquitetura foi projetada para permitir SDKs para diversas linguagens. O suporte oficial será expandido gradualmente. Linguagens capazes de interoperar com a API nativa ou com o protocolo IPC poderão ser suportadas diretamente ou pela comunidade.

---

## 1. Modelos de Execução

Nós não categorizamos plugins pela sua função (ex: "Plugin de Áudio" ou "Plugin de Utilidade"). Nós classificamos plugins **pelo seu modelo técnico de execução**, garantindo que a infraestrutura correta seja usada para o problema correto.

Existem três categorias suportadas:

### A. Extensions

Módulos nativos, escritos em Rust, que são compilados e distribuídos como crates carregadas pelo próprio projeto.

- **Uso comum:** Equalizador oficial, recursos core complexos (ex: scanner de biblioteca em alta performance).
- **Vantagem:** Total acesso interno de forma segura, pois o código é mantido e auditado pelo próprio projeto.

### B. Runtime Plugins (In-Process / Native Plugins)

Bibliotecas dinâmicas (`.dll`, `.so`, `.dylib`) injetadas no mesmo espaço de memória do motor de áudio. Eles expõem uma **Interface C-ABI** padronizada.

- **Uso comum:** Decoders (FLAC, DSD), Mixer, Analisadores de Espectro/FFT, Algoritmos de Crossfade, DSP, Pitch Shifters e Efeitos de Áudio de baixíssima latência.
- **Contenção de Falhas (Crash Isolation):** Sendo carregados nativamente, plugins In-Process mal comportados podem derrubar a aplicação. O Player implementará sandboxing onde possível para desabilitar o plugin em caso de _crash_, mas esta camada exige alto nível de confiança.

### C. IPC Plugins (Out-of-Process Plugins)

Processos completamente separados que se comunicam com o player através de um **Protocol Layer** (mensagens estruturadas, como JSON-RPC) sobre um **Transport Layer** (como Standard I/O, Sockets locais ou Named Pipes).

- **Uso comum:** Integração com Discord/Twitch, Controladores de UI remotos, Sincronizadores de metadados.
- **Contenção de Falhas:** Absoluta. Se um plugin IPC sofre um crash, apenas o processo dele morre. O Player continua rodando perfeitamente e notifica o usuário via log.

---

## 2. API vs. SDK

É vital compreender a diferença estrutural do sistema:

- **API (O Contrato):** É a interface que define os eventos, os métodos (ex: `process_audio()`) e as restrições. A API nunca muda repentinamente.
- **SDK (A Implementação):** É o pacote que você baixa (ex: Rust SDK, Python SDK, C# SDK). Ele abstrai a comunicação com a API.

### Evolução e Roadmap do SDK

Nós não fornecemos SDKs para todas as linguagens desde o Dia 1. O roadmap oficial seguirá esta ordem:

1. **Rust SDK**
2. **C ABI SDK**
3. **C++ SDK**
4. **C# SDK**
5. **Python SDK**
   ...seguido por Node.js, Java, e expansão da comunidade.

---

## 3. O Arquivo Manifest (`manifest.json`)

Todo plugin deve residir em sua própria pasta e conter um `manifest.json`.

> [!IMPORTANT]  
> A propriedade **`api_version`** é mandatória. O Player usa essa versão para garantir retrocompatibilidade. Plugins escritos para `api_version: 1` funcionarão, mesmo daqui a 5 anos, quando o Player estiver na `api_version: 3`.

**Exemplo de Manifesto:**

```json
{
  "name": "Hello World Plugin",
  "author": "DevCommunity",
  "version": "1.0.0",
  "api_version": 1,
  "type": "ipc",
  "entrypoint": "main.py",
  "signed": false,
  "permissions": ["network", "metadata.read", "ui.overlay"],
  "resources": "assets/"
}
```

### Capability System (Permissões)

Um plugin só pode acessar o que declarar. Se um plugin IPC tentar acessar os arquivos do usuário, mas não possuir `filesystem.read` ou `filesystem.write`, a chamada será rejeitada pelo Plugin Manager do Player com um erro de segurança.

**Algumas permissões previstas:**

- `audio.process`
- `library.read`
- `playlist.read` / `playlist.write`
- `ui.overlay`
- `network`
- `filesystem`

---

## 4. Arquitetura Restrita e Boas Práticas

### A. Isolamento de Estado

Você **nunca deve gravar ou ler arquivos arbitrários no sistema do usuário**, a menos que explicitamente permitido pelas _capabilities_.
Ao carregar o seu plugin, o Player criará um diretório de estado e injetará os caminhos como variáveis ou no contexto de inicialização.
Use sempre os caminhos fornecidos:

- `/state/` (Estado persistente)
- `/cache/` (Arquivos temporários ou baixados)
- `/config/` (Configurações do usuário para o seu plugin)

### B. Uso de Recursos (Resources)

Se o seu plugin tiver imagens, fontes ou temas, você pode declará-los apontando para a pasta local no `manifest.json` (`"resources": "assets/"`). O frontend do player montará e servirá esses recursos, evitando que você precise criar servidores locais desnecessários para fornecer uma imagem de ícone.

### C. Interface do Usuário (Server-Driven UI)

> [!CAUTION]  
> Plugins **não** fornecem código HTML/CSS/React. O Frontend deve sempre manter sua estética pura.

Para exibir opções e formulários, o plugin deve fornecer um arquivo `ui.json` na raiz da sua pasta (ou servir dinamicamente via SDK).
O Frontend atua como um **interpretador de UI Declarativa**. O plugin pede componentes padronizados e o React nativo desenha na tela.

**Exemplo de `ui.json`:**

```json
[
  {
    "id": "username_input",
    "type": "input",
    "props": { "label": "Seu Nome" }
  },
  {
    "id": "btn_greet",
    "type": "button",
    "props": { "label": "Dizer Olá", "action": "greet_user" }
  }
]
```

Quando o usuário clicar em "Dizer Olá", o Player enviará uma mensagem IPC para o seu script contendo:
`{"method": "greet_user", "params": {"username_input": "..."}}`

### D. Acesso a Dados e Injeção de Dependência

> [!CAUTION]  
> O seu plugin **nunca** terá acesso direto ao banco de dados SQLite do projeto. É estritamente proibido abrir conexões paralelas ao banco.

O sistema adota o padrão de **Injeção de Dependências Baseada em Contexto**.
Você não "chama a biblioteca inteira". Você solicita um `LibraryContext` na API.

```python
# (Exemplo Python SDK)
def on_initialize(context):
    library = context.get_library_context()
    tracks = library.search("Artist Name")
```

Todas as requisições passam pela API, que valida as regras de negócio e permissões.

---

## 5. Event Bus Formal

Os plugins interagem de forma reativa através de um **Event Bus**. Nada de chamadas mal definidas. Todo evento do player será disparado formalmente.

**Eventos Principais do Lifecycle do Sistema:**

- `player.started` / `player.paused` / `player.stopped`
- `player.track_changed`
- `volume.changed`
- `library.scan.started` / `library.scan.finished`
- `plugin.loaded` / `plugin.unloaded`

---

## 6. Ciclo de Vida do Plugin (Lifecycle)

Todo plugin é gerenciado pelo Plugin Manager seguindo um fluxo estrito e imutável. Você deve estar preparado para responder (ou ignorar) as fases do ciclo de vida:

1. **`discover`**: O Manager encontra seu manifesto e valida a estrutura.
2. **`validate`**: O Manager verifica permissões, segurança, API version e certificados (`signed`).
3. **`load`**: O processo é spawned (IPC) ou a DLL é mapeada na memória (Runtime).
4. **`initialize`**: Fase principal. O plugin recebe os contextos (`LibraryContext`, pastas isoladas de state/config) e reserva recursos.
5. **`running`**: Estado normal. Ouve eventos no Event Bus.
6. **`pause`** / **`resume`**: O player sinaliza que vai dormir/pausar operações secundárias.
7. **`shutdown`**: Aviso para liberar recursos, salvar buffers.
8. **`unload`**: O processo é encerrado ou a DLL é ejetada.

---

## 7. Logging Centralizado

> [!TIP]  
> Não utilize `print()` (stdout) diretamente em seus IPC Plugins ou Runtime Plugins para debug pessoal. O `stdout` é frequentemente usado pela Transport Layer.

Sempre utilize a API de log do SDK (que repassa para o Player):

- `logger.info("Buscando letra...")`
- `logger.warn("Conexão lenta.")`
- `logger.error("Falha ao salvar configuração.")`

Isso garante que os seus logs aparecerão formatados, no console centralizado do player para desenvolvedores, junto com as mensagens de diagnóstico globais.
