# 🔄 Sistema de Logout e Troca de Role/Wallet

## 📋 Resumo

Sistema completo de logout e reset de sessão implementado, permitindo trocar facilmente entre roles (Worker ↔ Requester) e wallets diferentes para facilitar testes.

---

## ✅ Mudanças Implementadas

### 1. **AppContext.tsx** - Função de Logout
**Arquivo:** `src/contexts/AppContext.tsx`

#### O que mudou:
- ✅ Renomeado `disconnect()` → `logout()` (mais semântico)
- ✅ `logout()` reseta `currentUser` para `null`
- ✅ Interface `AppContextType` atualizada

#### Antes:
```typescript
disconnect: () => void;
```

#### Depois:
```typescript
logout: () => void;
```

#### Implementação:
```typescript
const logout = () => {
  setState(prev => ({
    ...prev,
    currentUser: null
  }));
};
```

**Nota:** O localStorage é automaticamente sincronizado via `useEffect` existente.

---

### 2. **Navbar.tsx** - Botão de Logout Completo
**Arquivo:** `src/components/Navbar.tsx`

#### O que mudou:
- ✅ Importado `useAppWallet` para acesso à função `disconnect()` da wallet
- ✅ Importado `logout` do contexto (renomeado de `disconnect`)
- ✅ Botão de logout agora executa **dois** passos:
  1. `disconnect()` - limpa estado da wallet (Lemon/MetaMask)
  2. `logout()` - limpa user do contexto + localStorage
- ✅ Adicionado `title="Logout / Switch Account"` para tooltip

#### Código:
```typescript
const { user, logout, balance } = useApp();
const { disconnect } = useAppWallet();

// ...

<Button
  variant="outline"
  size="sm"
  onClick={() => {
    disconnect();  // Limpa wallet (Lemon/MetaMask)
    logout();      // Limpa user + localStorage
  }}
  className="text-muted-foreground hover:text-destructive hover:border-destructive"
  title="Logout / Switch Account"
>
  <LogOut className="w-4 h-4" />
</Button>
```

#### Resultado:
- Ao clicar no ícone de logout:
  - Endereço da wallet some
  - Balance USDC some (se requester)
  - User volta a `null`
  - Modal de conexão reaparece automaticamente

---

### 3. **Index.tsx** - Modal Sempre Aberto Quando Deslogado
**Arquivo:** `src/pages/Index.tsx`

#### O que mudou:
- ✅ Removido controle manual de `showConnectModal` state
- ✅ Modal agora está **sempre aberto** quando `user === null`
- ✅ Código simplificado, removendo lógica desnecessária

#### Antes:
```typescript
const [showConnectModal, setShowConnectModal] = useState(false);

const handleConnect = () => {
  setShowConnectModal(true);
};

<ConnectWalletModal
  open={showConnectModal}
  onConnect={handleWalletConnected}
/>
```

#### Depois:
```typescript
// Sem state de modal

<ConnectWalletModal
  open={true}  // Sempre aberto quando !user
  onConnect={handleWalletConnected}
/>
```

#### Lógica:
- Quando `user === null`:
  - Landing page é renderizada
  - Modal de conexão aparece automaticamente
- Quando `user !== null`:
  - Dashboard/JobBoard aparece conforme role

---

## 🎯 Fluxo de Uso Completo

### Cenário 1: Primeira Conexão
```
1. Usuário abre app
2. user === null
3. Landing page + modal de conexão aparecem
4. Usuário escolhe role e conecta wallet
5. Dashboard/JobBoard aparecem
```

### Cenário 2: Logout e Reconexão
```
1. Usuário está logado como Worker
2. Clica no botão de logout (ícone LogOut)
3. disconnect() limpa wallet
4. logout() limpa user
5. Volta para Landing + modal
6. Pode escolher outro role (ex: Requester)
7. Conecta novamente (mesma ou outra wallet)
8. Novo dashboard aparece
```

### Cenário 3: Trocar de Wallet (MetaMask)
```
1. Usuário está logado com conta A
2. Troca de conta no MetaMask (para conta B)
3. Clica em logout
4. Modal aparece novamente
5. Conecta com a nova conta B
6. App funciona com nova wallet
```

---

## 💡 Comportamentos Importantes

### Balance Correto por Role
```typescript
// No connectWallet (AppContext.tsx):
[wallet]: prev.balances[wallet] || (role === 'requester' ? 10000 : 0)
```

- **Requester**: Sempre inicia com 10.000 USDC (mock)
- **Worker**: Sempre inicia com 0 USDC
- **Navbar**: Só mostra badge de USDC se `user.role === 'requester'`

### Sincronização Automática
- ✅ Toda mudança em `state` é salva no `localStorage` via `useEffect`
- ✅ Mudanças em outras abas são sincronizadas via `storage` event
- ✅ Ao fazer logout, `currentUser: null` é persistido

### Modal Não Pode Ser Fechado
- Modal **não tem** botão de fechar quando `!user`
- Única forma de sair: conectar uma wallet
- Isso garante que usuário sempre tem uma wallet conectada para usar o app

---

## 🧪 Testes Manuais

### Teste 1: Logout Básico
1. ✅ Conecte como Worker
2. ✅ Veja endereço da wallet na navbar (sem USDC)
3. ✅ Clique no ícone de logout
4. ✅ Confirme que volta para landing + modal

### Teste 2: Trocar de Role
1. ✅ Conecte como Worker
2. ✅ Navegue pelo JobBoard
3. ✅ Faça logout
4. ✅ Conecte como Requester
5. ✅ Veja badge de 10.000 USDC aparecer
6. ✅ Acesse "Post New Job"

### Teste 3: Trocar de Wallet (MetaMask)
1. ✅ Conecte com conta X do MetaMask
2. ✅ Veja endereço de X na navbar
3. ✅ Troque para conta Y no MetaMask
4. ✅ Faça logout no app
5. ✅ Conecte novamente
6. ✅ Veja endereço de Y na navbar

### Teste 4: Persistência após Refresh
1. ✅ Conecte como Requester
2. ✅ Dê F5 na página
3. ✅ Confirme que continua logado
4. ✅ Faça logout
5. ✅ Dê F5 na página
6. ✅ Confirme que modal aparece (deslogado)

---

## 🔧 Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/contexts/AppContext.tsx` | Renomeado `disconnect` → `logout` |
| `src/components/Navbar.tsx` | Botão de logout com `disconnect() + logout()` |
| `src/pages/Index.tsx` | Modal sempre aberto quando `!user` |

---

## 🚫 O Que NÃO Foi Alterado

- ❌ Balance de USDC continua mock (10k para requesters)
- ❌ Jobs e pagamentos continuam no localStorage
- ❌ Nenhuma integração on-chain ainda
- ❌ Lógica do `useAppWallet` intacta (Lemon SDK)
- ❌ `deposit()` e `callSmartContract()` não implementados

---

## 📝 Notas Técnicas

### Por que dois `disconnect`?
```typescript
disconnect();  // useAppWallet - limpa address/source da wallet
logout();      // AppContext - limpa user/balance do app
```

São responsabilidades diferentes:
- **Wallet** (useAppWallet): Gerencia conexão Lemon/MetaMask
- **App** (AppContext): Gerencia estado da aplicação (user, jobs, balance)

### Por que modal sempre aberto?
Garante que:
- Usuário sempre tem wallet antes de usar o app
- Não precisa controlar state manualmente
- Mais simples e direto

---

## 🎉 Resultado Final

Sistema de logout totalmente funcional que permite:
- ✅ Trocar entre Worker e Requester livremente
- ✅ Testar com diferentes wallets (MetaMask/Lemon)
- ✅ Balance correto aparece conforme role
- ✅ UX limpa e intuitiva

**Status:** ✅ Etapa 2 Completa  
**Próxima etapa:** Integração real de `deposit()` e smart contracts (quando necessário)

