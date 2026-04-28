# ❌ Solução: Erro "Network request failed"

Se está a receber o erro **"Erro na busca: TypeError: Network request failed"**, siga estes passos:

## 🔴 Problema
O app não consegue conectar ao servidor Express na porta 3000, que faz proxy das requisições para a API do PubMed.

## ✅ Solução

### 1️⃣ Use o comando correto:
```bash
npm run android
```

**NÃO use:**
```bash
npx react-native run-android
```

### 2️⃣ Certifique-se que:
- [ ] Tem **Node.js** instalado (`node --version`)
- [ ] Tem o **Android emulator** ligado ou dispositivo Android conectado
- [ ] O servidor Express está a correr na porta 3000 (verá a mensagem "🚀 Iniciando servidor Express na porta 3000..." nos logs)

### 3️⃣ Se o servidor não inicia:
Abra um **novo terminal** e execute manualmente:
```bash
npm run start:server
```

Depois, num **outro terminal**, execute:
```bash
npx react-native run-android
```

### 4️⃣ Verificar conectividade:
- No emulator Android, a porta local `3000` é acedida via `http://10.0.2.2:3000`
- Se o emulator não conseguir aceder ao host, pode ser um problema de configuração do emulator

### 5️⃣ Se ainda não funcionar:
Verifique os logs do Android Logcat:
```bash
adb logcat | grep FindUrTutor
```

## 📱 Como usar corretamente:

1. Abra um terminal
2. Vá para a pasta do projeto:
   ```bash
   cd c:\Users\Susy\Documents\ReactNativeProjects\FindUrTutor
   ```
3. Execute:
   ```bash
   npm run android
   ```
4. Aguarde até ver as mensagens:
   - ✅ "Servidor pronto!"
   - ✅ "Iniciando React Native no Android..."
5. O app abrirá no Android

## 🎯 Teste o servidor:
Abra outro terminal e execute:
```bash
curl http://localhost:3000/api/pubmed/search?keyword=cancer
```

Se funcionar, verá uma resposta JSON com artigos do PubMed.

---

**Precisa de ajuda?** Verifique o console do Metro para erros específicos.
