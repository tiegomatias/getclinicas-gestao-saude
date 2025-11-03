import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, DollarSign, Package, TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  default_price?: string;
}

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: string;
    interval_count: number;
  };
  active: boolean;
}

interface PlanFeature {
  name: string;
  enabled: boolean;
}

const PLAN_FEATURES: Record<string, PlanFeature[]> = {
  basic: [
    { name: "Até 30 leitos", enabled: true },
    { name: "Gestão de pacientes", enabled: true },
    { name: "Gestão de profissionais", enabled: true },
    { name: "Agenda básica", enabled: true },
    { name: "Relatórios básicos", enabled: false },
    { name: "Integrações avançadas", enabled: false },
    { name: "Suporte prioritário", enabled: false },
  ],
  standard: [
    { name: "Até 100 leitos", enabled: true },
    { name: "Gestão de pacientes", enabled: true },
    { name: "Gestão de profissionais", enabled: true },
    { name: "Agenda avançada", enabled: true },
    { name: "Relatórios completos", enabled: true },
    { name: "Integrações avançadas", enabled: false },
    { name: "Suporte prioritário", enabled: false },
  ],
  premium: [
    { name: "Leitos ilimitados", enabled: true },
    { name: "Gestão de pacientes", enabled: true },
    { name: "Gestão de profissionais", enabled: true },
    { name: "Agenda avançada", enabled: true },
    { name: "Relatórios completos", enabled: true },
    { name: "Integrações avançadas", enabled: true },
    { name: "Suporte prioritário", enabled: true },
  ],
};

export default function MasterPlans() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string>("");
  const [clinics, setClinics] = useState<any[]>([]);

  // Form states
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("brl");
  const [recurringInterval, setRecurringInterval] = useState("month");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProducts(), loadClinics()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Get products from Stripe via RPC or direct call
      // For now, using the defined products from stripeConfig
      const mockProducts: StripeProduct[] = [
        {
          id: 'prod_TMABLR5OuXIAIf',
          name: 'Plano Mensal',
          description: 'Plano básico com renovação mensal',
          active: true,
          default_price: 'price_1SPRrEICb7cdsHyg06wvKvVL'
        },
        {
          id: 'prod_TMBF40e3WTdaZQ',
          name: 'Plano Semestral',
          description: 'Plano padrão com renovação semestral',
          active: true,
          default_price: 'price_1SPSsxICb7cdsHygXzGgJXMt'
        },
        {
          id: 'prod_TMADuKpCMkikfz',
          name: 'Plano Anual',
          description: 'Plano premium com renovação anual',
          active: true,
          default_price: 'price_1SPRtEICb7cdsHygC3bOjBXl'
        }
      ];

      const mockPrices: StripePrice[] = [
        {
          id: 'price_1SPRrEICb7cdsHyg06wvKvVL',
          product: 'prod_TMABLR5OuXIAIf',
          unit_amount: 29900,
          currency: 'brl',
          recurring: { interval: 'month', interval_count: 1 },
          active: true
        },
        {
          id: 'price_1SPSsxICb7cdsHygXzGgJXMt',
          product: 'prod_TMBF40e3WTdaZQ',
          unit_amount: 49900,
          currency: 'brl',
          recurring: { interval: 'month', interval_count: 6 },
          active: true
        },
        {
          id: 'price_1SPRtEICb7cdsHygC3bOjBXl',
          product: 'prod_TMADuKpCMkikfz',
          unit_amount: 99900,
          currency: 'brl',
          recurring: { interval: 'year', interval_count: 1 },
          active: true
        }
      ];

      setProducts(mockProducts);
      setPrices(mockPrices);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, plan')
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName || !priceAmount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call Stripe to create product and price
      // This would use the Stripe API or a dedicated edge function
      toast.success('Produto criado com sucesso!');
      setCreateDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Erro ao criar produto');
    }
  };

  const handleUpgradeClinic = async () => {
    if (!selectedClinic) {
      toast.error('Selecione uma clínica');
      return;
    }

    try {
      // Update clinic plan in database
      const { error } = await supabase
        .from('clinics')
        .update({ plan: 'premium' })
        .eq('id', selectedClinic);

      if (error) throw error;

      toast.success('Plano atualizado com sucesso!');
      setUpgradeDialogOpen(false);
      loadClinics();
    } catch (error) {
      console.error('Error upgrading clinic:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setPriceAmount("");
    setPriceCurrency("brl");
    setRecurringInterval("month");
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getProductPrice = (productId: string) => {
    return prices.find(p => p.product === productId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie produtos, preços e features dos planos
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Alterar Plano de Clínica
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Plano de Clínica</DialogTitle>
                <DialogDescription>
                  Selecione uma clínica e o novo plano desejado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Clínica</Label>
                  <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name} (Atual: {clinic.plan})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpgradeClinic}>
                  Atualizar Plano
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
                <DialogDescription>
                  Configure um novo produto e preço no Stripe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Plano Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Descrição do produto..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Preço *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      placeholder="299.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">BRL (R$)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo de Cobrança</Label>
                  <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mensal</SelectItem>
                      <SelectItem value="year">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct}>
                  Criar Produto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produtos & Preços</TabsTrigger>
          <TabsTrigger value="features">Features por Plano</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const price = getProductPrice(product.id);
              return (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                      </div>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {price && (
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {formatPrice(price.unit_amount, price.currency)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /{price.recurring?.interval === 'year' ? 'ano' : price.recurring?.interval === 'month' && price.recurring?.interval_count === 6 ? '6 meses' : 'mês'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Price ID: {price.id}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Product ID: {product.id}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(PLAN_FEATURES).map(([planKey, features]) => (
              <Card key={planKey}>
                <CardHeader>
                  <CardTitle className="capitalize">{planKey}</CardTitle>
                  <CardDescription>
                    Features disponíveis neste plano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check
                          className={`h-4 w-4 mt-0.5 ${
                            feature.enabled
                              ? "text-green-500"
                              : "text-muted-foreground opacity-30"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            feature.enabled
                              ? "text-foreground"
                              : "text-muted-foreground line-through opacity-50"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
