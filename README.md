# Treino Full Body (PWA Mobile-First)

Aplicativo pessoal de musculação e periodização Full Body (3x/semana), desenvolvido em **React 19 + TypeScript + Vite + Tailwind CSS**, concebido especialmente para uso no celular dentro da academia, funcionando **100% offline via PWA e IndexedDB**.

---

## 🏋️ Recursos Principais

* **PWA Instalável e Offline**: Funciona sem sinal de internet na academia. Cache de assets estáticos com Service Worker e manifesto PWA.
* **Periodização de 12 Semanas**:
  * **Semanas 1–2**: 2 séries por exercício, RIR 3 (reserva).
  * **Semanas 3–12**: 3 séries por exercício, RIR 1–2.
  * **Semana 7**: Deload (metade das séries).
* **Treinos A, B e C**:
  * Aquecimento obrigatório de 7 min (5 min de bike + 2 min de mobilidade torácica).
  * Agrupamento e destaque visual para **Bi-sets** (ex: `(1)` e `(2)`).
  * **Alerta permanente de Condromalácia Patelar** em exercícios de perna (Leg Press, Stiff, Mesa Flexora, Banco Alto).
  * Escala visual de dor no joelho (0 a 10) no encerramento de treinos de perna.
* **Ergonomia para Mão Suada**:
  * Botões de toque extragrandes (48–56px).
  * Botões rápidos de ajuste (+1kg, +2kg, -1kg, -2kg, +1 rep, -1 rep).
  * Sugestão automática de aumento de carga quando o teto de reps é atingido em todas as séries.
* **Timer de Descanso**:
  * Acionamento automático ao marcar série concluída.
  * Presets rápidos de 60s, 75s e 90s, botões de +15s/-15s.
  * Sinal sonoro suave (Web Audio API) e vibração no celular (`navigator.vibrate`).
* **Vídeos no YouTube**:
  * Links de busca direta com execução correta (`youtube.com/results?search_query=...`).
  * Player embutido sem cookies (`youtube-nocookie.com`) ao colar o link de um vídeo específico.
* **Indicadores Corporais & Metas**:
  * Avaliações trimestrais completas com circunferências corporais e anexação local de fotos.
  * Registro rápido quinzenal (apenas peso e cintura).
  * Metas: **75 kg** e **15% de gordura** com cálculo de distância e barras de progresso.
  * Alerta visual na tela inicial quando completados 90 dias sem avaliação.
* **Privacidade & Backup Local**:
  * Dados salvos apenas no seu aparelho (IndexedDB).
  * Botões de **Exportar Backup (.json)** e **Restaurar Backup (.json)**.

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
* Node.js v18 ou superior instalado.

### 1. Clonar e Instalar
```bash
git clone <url-do-seu-repositorio>
cd <pasta-do-projeto>
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O app estará acessível em `http://localhost:3000` (ou porta indicada no terminal).

### 3. Acessar no Celular na Mesma Rede Wi-Fi
Para testar direto no celular enquanto desenvolve:
```bash
npm run dev -- --host
```
O terminal exibirá o endereço de IP da sua rede local (ex: `http://192.168.1.15:3000`). Basta abrir essa URL no navegador do celular (Chrome ou Safari).

---

## 🌐 Como Publicar (Railway ou Vercel/Netlify)

### Opção A: Publicar no Railway (com GitHub)
1. **Subir o código para o seu GitHub**:
   * Crie um novo repositório no seu GitHub (ex.: `treino-fullbody`).
   * No seu computador, faça o commit e push do projeto:
     ```bash
     git add .
     git commit -m "App Treino Full Body PWA"
     git branch -M main
     git remote add origin https://github.com/SEU_USUARIO/treino-fullbody.git
     git push -u origin main
     ```
2. **Conectar e publicar no Railway**:
   * Acesse [railway.com](https://railway.com) e faça login com seu GitHub.
   * Clique em **"New Project"** > **"Deploy from GitHub repo"**.
   * Escolha o repositório `treino-fullbody`.
   * O Railway detectará o Node.js automaticamente e executará:
     * Build: `npm run build`
     * Start: `npm start` (`node server.js`)
   * Em **Settings** do serviço no Railway, clique em **"Generate Domain"** (na seção *Networking*).
   * Pronto! O Railway fornecerá uma URL pública permanente HTTPS (ex.: `treino-fullbody.up.railway.app`).

### Opção B: Publicar na Vercel (Hospedagem Estática Grátis)
1. Acesse [vercel.com](https://vercel.com) e conecte com seu GitHub.
2. Selecione o repositório `treino-fullbody`.
3. Framework: **Vite**, Build: `npm run build`, Output: `dist`.
4. Clique em **Deploy**.

---

## 📱 Como Instalar no Celular como PWA

Com o app publicado (em HTTPS):

### No Android (Google Chrome):
1. Abra o link do app no Chrome.
2. Toque no botão verde **"Instalar App"** no topo da tela (ou nos 3 pontinhos do Chrome > **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**).
3. O ícone aparecerá como um app nativo na sua gaveta de aplicativos.

### No iPhone / iPad (Safari):
1. Abra o link do app no Safari.
2. Toque no botão **Compartilhar** (ícone quadrado com uma seta para cima).
3. Role o menu para baixo e toque em **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"**. O app passará a abrir em tela cheia sem barras do navegador.

---

## 💾 Dica de Backup
Como os dados ficam armazenados no IndexedDB do navegador do seu celular:
* Periodicamente (ex: a cada 2 semanas ou após uma nova avaliação), vá na aba **Ajustes** e toque em **"EXPORTAR BACKUP (.JSON)"**.
* Guarde o arquivo no Google Drive, iCloud ou envie para si mesmo no WhatsApp/Telegram.
* Caso troque de celular ou limpe o histórico do navegador, basta tocar em **"RESTAURAR BACKUP (.JSON)"** para recuperar todos os seus registros instantaneamente!
