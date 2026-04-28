# 📱 Como rodar o FindUrTutor

## ✅ Forma recomendada (MAIS SIMPLES):

```bash
npm run android
```

Este comando:
1. ✅ Verifica se o servidor Express está rodando
2. ✅ Inicia o servidor automaticamente (se não estiver)
3. ✅ Aguarda o servidor ficar pronto
4. ✅ Inicia o React Native no Android

**É literalmente um comando!** Só isso.

---

## ❌ Alternativa (Se preferir mais controle):

Se realmente quer usar `npx react-native run-android`, execute isto:

### Passo 1 - Terminal 1:
```bash
npm run start:server
```

Aguarde até ver:
```
Express server listening on port 3000
```

### Passo 2 - Terminal 2 (novo terminal):
```bash
npx react-native run-android
```

---

## 🛑 Resolução de problemas:

### Erro: "Network request failed"
- Certifique-se que o servidor está a rodar
- Verifique se está a usar `npm run android` ou dois terminais conforme instruções acima

### Servidor não inicia
- Tente manualmente: `npm run start:server`
- Verifique os logs de erro

### Android emulator não consegue aceder ao servidor
- Android emulator acede ao host via `http://10.0.2.2:3000`
- Certifique-se que o emulator está ligado antes de executar o comando

---

## 🎯 Comandos disponíveis:

| Comando | O que faz |
|---------|-----------|
| `npm run android` | Inicia servidor + React Native (RECOMENDADO) |
| `npm run start:server` | Apenas inicia o servidor Express |
| `npm run rn-android` | Apenas inicia React Native (sem servidor) |
| `npm run start` | Inicia Metro bundler manualmente |
| `npm run ensure-server` | Apenas verifica e inicia o servidor |

---

**Use: `npm run android`** 🚀
