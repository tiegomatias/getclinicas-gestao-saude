# 📚 Exemplos de Uso - Sistema de Assinaturas

Este documento mostra como usar os componentes de proteção de recursos em diferentes cenários.

---

## 🔒 Protegendo Páginas Inteiras

### Usando `SubscriptionGuard`

```tsx
import { SubscriptionGuard } from '@/components/shared/SubscriptionGuard';

export default function RelatoriosAvancados() {
  return (
    <SubscriptionGuard requirePlan={['semestral', 'anual']}>
      <div>
        {/* Conteúdo disponível apenas para planos semestral e anual */}
        <h1>Relatórios Avançados</h1>
        {/* ... */}
      </div>
    </SubscriptionGuard>
  );
}
```

---

## 🎨 Bloqueando Seções Específicas

### Usando `PremiumFeature`

```tsx
import { PremiumFeature } from '@/components/shared/PremiumFeature';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Seção gratuita - sempre visível */}
      <div className="grid gap-4">
        <Card>
          <CardContent>Estatísticas básicas</CardContent>
        </Card>
      </div>

      {/* Seção premium - borrada para não assinantes */}
      <PremiumFeature>
        <div className="grid gap-4">
          <Card>
            <CardContent>Analytics avançados com gráficos</CardContent>
          </Card>
        </div>
      </PremiumFeature>
    </div>
  );
}
```

---

## 🔘 Botões com Verificação de Acesso

### Usando `FeatureButton`

```tsx
import { FeatureButton } from '@/components/shared/FeatureButton';

export default function ExportData() {
  const handleExport = () => {
    // Esta função só executa se o usuário tiver acesso
    console.log('Exportando dados...');
  };

  return (
    <FeatureButton
      featureName="Exportação de Dados"
      requiredTier="mensal"
      onAccessGranted={handleExport}
    >
      Exportar para Excel
    </FeatureButton>
  );
}
```

---

## 🎯 Verificação Programática

### Usando `useFeatureAccess`

```tsx
import { useFeatureAccess, FEATURES } from '@/hooks/useFeatureAccess';

export default function Configuracoes() {
  const { hasAccess, checkAccess } = useFeatureAccess();

  const handleCustomBranding = () => {
    // Verifica acesso e mostra toast se não tiver
    if (!checkAccess(FEATURES.CUSTOM_BRANDING)) {
      return; // Usuário será notificado automaticamente
    }

    // Código para aplicar marca personalizada
    console.log('Aplicando marca personalizada...');
  };

  return (
    <div>
      <h2>Configurações Avançadas</h2>
      
      {/* Renderização condicional */}
      {hasAccess('anual') && (
        <Button onClick={handleCustomBranding}>
          Personalizar Marca
        </Button>
      )}

      {/* Mostrar badge se não tiver acesso */}
      {!hasAccess('semestral') && (
        <Badge variant="outline">
          Disponível no plano Semestral
        </Badge>
      )}
    </div>
  );
}
```

---

## 📊 Prompt de Upgrade

### Usando `SubscriptionPrompt`

```tsx
import { SubscriptionPrompt } from '@/components/shared/SubscriptionPrompt';
import { useSubscription } from '@/hooks/useSubscription';

export default function Integrações() {
  const subscription = useSubscription();

  if (!subscription.isSubscribed()) {
    return (
      <SubscriptionPrompt
        feature="Integrações Avançadas"
        benefits={[
          "Conecte com mais de 50 aplicativos",
          "Sincronização automática de dados",
          "API completa para integrações customizadas",
          "Webhooks em tempo real"
        ]}
      />
    );
  }

  return (
    <div>
      {/* Conteúdo da página de integrações */}
    </div>
  );
}
```

---

## 🎨 Badge de Status no Header

### Já implementado automaticamente em `AppHeader`

O badge aparece automaticamente quando o usuário está logado e tem uma assinatura ativa:

```tsx
{subscription.isSubscribed() && (
  <Badge className="hidden lg:flex items-center gap-1">
    <Crown className="h-3 w-3" />
    {subscription.getPlanName()}
  </Badge>
)}
```

---

## ⚠️ Banner de Expiração

### Já implementado em `AppLayout`

O banner de expiração aparece automaticamente:
- 7 dias antes da renovação
- Quando a assinatura expira
- Quando o usuário não tem assinatura ativa

```tsx
<SubscriptionBanner />
```

---

## 🔍 Hook useSubscription - Todas as Funções

```tsx
import { useSubscription } from '@/hooks/useSubscription';

const subscription = useSubscription();

// Verificar se tem assinatura ativa
subscription.isSubscribed() // boolean

// Obter informações do plano atual
subscription.getCurrentPlan() // SubscriptionPlan | null
subscription.getPlanName() // string

// Datas e renovação
subscription.getSubscriptionEnd() // Date | null
subscription.daysUntilRenewal() // number | null

// Status de expiração
subscription.isExpiringSoon(7) // boolean (7 dias por padrão)
subscription.isExpired() // boolean

// Atualizar status manualmente
await subscription.refresh()

// Acesso ao status raw
subscription.subscriptionStatus // { subscribed, product_id, subscription_end }
```

---

## 📝 Hierarquia de Planos

O sistema entende automaticamente a hierarquia:

```
Anual > Semestral > Mensal > Free
```

Exemplos:
- Usuário com plano **Anual** tem acesso a recursos **Mensais**
- Usuário com plano **Semestral** tem acesso a recursos **Mensais**
- Usuário com plano **Mensal** NÃO tem acesso a recursos **Semestrais**

---

## 🎁 Recursos Pré-definidos

Use os recursos já configurados em `FEATURES`:

```tsx
import { FEATURES } from '@/hooks/useFeatureAccess';

FEATURES.BASIC_REPORTS        // Free
FEATURES.ADVANCED_REPORTS     // Mensal
FEATURES.EXPORT_DATA          // Mensal
FEATURES.CUSTOM_INTEGRATIONS  // Semestral
FEATURES.PRIORITY_SUPPORT     // Semestral
FEATURES.CUSTOM_BRANDING      // Anual
FEATURES.DEDICATED_MANAGER    // Anual
```

---

## 🎨 Customização de Fallbacks

### Fallback personalizado com `SubscriptionGuard`

```tsx
<SubscriptionGuard
  fallback={
    <div className="text-center py-12">
      <h2>Ops! Recurso Bloqueado</h2>
      <p>Você precisa de um plano premium</p>
      <Button onClick={() => navigate('/checkout')}>
        Fazer Upgrade
      </Button>
    </div>
  }
>
  <PremiumContent />
</SubscriptionGuard>
```

---

## 💡 Dicas de Boas Práticas

1. **Use `PremiumFeature` para seções visuais**
   - Borra o conteúdo automaticamente
   - Mostra overlay com call-to-action

2. **Use `SubscriptionGuard` para páginas inteiras**
   - Bloqueia acesso completo
   - Redireciona se necessário

3. **Use `FeatureButton` para ações específicas**
   - Verifica acesso ao clicar
   - Mostra toast se não tiver acesso

4. **Use `useFeatureAccess` para lógica complexa**
   - Controle programático total
   - Verificações customizadas

5. **Use `SubscriptionPrompt` como landing**
   - Substitui página inteira
   - Marketing de upgrade

---

**Última atualização**: Janeiro 2025
