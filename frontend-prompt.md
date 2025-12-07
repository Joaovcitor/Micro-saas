# Prompt para Desenvolvimento Frontend - E-commerce Micro‑SaaS (Cliente Final)

Este prompt descreve como construir um front‑end moderno, responsivo e multi‑tenant voltado ao consumidor final das lojas (sem funcionalidades de admin), consumindo a API existente do projeto.

## Objetivo

- Entregar uma experiência de e‑commerce completa para o cliente final: navegar catálogo, buscar, ver detalhes, personalizar produtos, carrinho, checkout com Stripe, autenticação, conta e pedidos.
- Suportar multi‑tenant via subdomínio (`{loja}.dominio.com`), resolvendo `storeId` e aplicando em todas as requisições relevantes.

## Stack Sugerida

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS para estilo
- TanStack Query (React Query) para dados e cache
- Zustand ou Context para estado local (carrinho, UI)
- Stripe.js/Elements para pagamento
- Zod para validação de formulários

## Escopo de Funcionalidades (Cliente Final)

- Home da loja (`/`): dados da loja, vitrines, categorias em destaque e banners.
- Catálogo por categoria (`/c/:slug`): listagem paginada com filtros (preço, categoria, tipo) e ordenação.
- Busca (`/search?q=`): resultados paginados com query persistida na URL.
- Produto (`/p/:slug`): detalhes, galeria de fotos, preço, variações/tipos, estoque, avaliações simples, adicionar ao carrinho.
- Personalização (`/custom/:productId`): wizard de customização (etapas/opções), preview, validações e preço dinâmico.
- Carrinho (`/cart`): itens, quantidades, remoção, subtotal/total, aplicar cupom.
- Checkout (`/checkout`): endereço de entrega, método de pagamento (Stripe Elements), resumo e confirmação.
- Autenticação (`/login`, `/register`, `/recover`): login, cadastro e recuperação de senha.
- Conta (`/account`): dados do usuário, endereços salvos, preferências básicas.
- Pedidos (`/orders` e `/orders/:id`): histórico e detalhes de pedidos com status.
- Páginas auxiliares: `404`, `terms`, `privacy`, `support`.

## Integração com Módulos da API

- `auth`: login, cadastro, manutenção de sessão (cookies/tokens), proteção de rotas.
- `tenant`: resolver `store` pelo subdomínio; obter `storeId`, nome/tema e configurações visuais.
- `products`: listar produtos (paginação), buscar por `slug` para página de produto; fotos/metadados.
- `category`: listar categorias e `slug`; filtrar catálogo por categoria.
- `discount`: aplicar cupom no carrinho/checkout; atualizar totais e feedback.
- `customProduct`: etapas/opções de customização; validar combinações; enviar item customizado.
- `checkout`: criar intenção/sessão de pagamento com Stripe; finalizar pedido.
- `orders`: listar e detalhar pedidos do usuário; exibir status/timeline.
- `users`: obter e atualizar perfil; gerenciar endereços de entrega.
- `stripeConnect`/`subscription`: não incluir funcionalidades de admin/merchant; foco no pagamento do pedido do consumidor.
- `webhooks`: backend; front‑end reflete estados de pagamento e pedidos.

## Arquitetura de Páginas e Rotas

- `/(home)`: resolve `store` pelo subdomínio; renderiza vitrines e categorias.
- `/c/[slug]`: catálogo por categoria; filtros/ordenação com estado na URL.
- `/search`: busca global na navbar; resultados paginados.
- `/p/[slug]`: produto com fotos, variações e CTA de carrinho.
- `/custom/[productId]`: wizard de customização com validações.
- `/cart`: itens, quantidades, cupom, resumo de valores.
- `/checkout`: formulário de endereço, Stripe Elements, confirmação.
- `/login`, `/register`, `/recover`: formulários com validação Zod e feedback.
- `/account`: perfil e endereços do usuário.
- `/orders`, `/orders/[id]`: histórico e detalhes de pedidos.

## Padrões de Implementação

- Dados: TanStack Query para fetch/cache, estados de carregamento e revalidação.
- Estado: Zustand/Context para carrinho e UI (toasts/modals).
- Multi‑tenant: Hook `useStore()` para resolver e expor `storeId`, `subdomain` e tema.
- Segurança: proteger rotas autenticadas; esconder dados sensíveis; sanitizar inputs.
- Carrinho: persistência em `localStorage` com hidratação pós‑login; recalcular totais ao aplicar/remover cupom.
- Checkout: Stripe Elements; nunca manipular dados de cartão fora do Stripe; tratar falhas e permitir retry.
- UX: skeletons, toasts e mensagens claras em PT‑BR; empty states para listas vazias.

## Contratos e Convenções

- Requisições: sempre incluir `storeId` quando aplicável (resolvido via `tenant`).
- Autenticação: sessão via cookies HttpOnly ou tokens seguros; refresh se aplicável; guard de rota para `/account` e `/orders`.
- Produtos: `slug` único por produto; fotos via módulo `photo` (quando disponível); preço e variações refletidos na UI.
- Descontos: validar cupom com feedback de estados (válido, inválido, expirado, já utilizado).
- Pedidos: refletir status do backend (ex.: recebido, processando, enviado) e exibir timeline simples.
- Customização: etapas/opções validadas pelo backend; preview e regras de preço dinâmico.

## Configuração e Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL`: base da API.
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`: chave pública do Stripe.
- `NEXT_PUBLIC_TENANT_DOMAIN`: domínio principal para subdomínios.
- Observação: `SALT_ROUNDS` é backend e não deve ser usado no front‑end.

## Critérios de Aceitação

- Compila sem erros; tipagem consistente (TS estrito quando possível).
- Fluxos principais funcionam: navegação, login, carrinho, cupom, checkout, confirmação, pedidos.
- Multi‑tenant: diferentes subdomínios carregam dados específicos e isolam estado da loja.
- Responsividade: mobile, tablet e desktop com UI consistente.
- Acessibilidade: elementos interativos com foco visível, labels e ARIA.
- Pagamento: Stripe Elements; pedido finaliza com feedback claro.
- UX de erros: mensagens amigáveis e ações de retry quando fizer sentido.

## Tarefas Principais

- Criar layout base com tema da loja, navbar com busca e carrinho.
- Implementar `useStore()` para resolver `storeId` por subdomínio e prover contexto.
- Páginas: Home, Catálogo, Busca, Produto, Customização, Carrinho, Checkout, Login/Registro/Recuperação, Conta, Pedidos.
- Hooks de dados: `useProducts`, `useProduct`, `useCategories`, `useCart`, `useCheckout`, `useOrders`, `useUser`.
- Integração Stripe Elements no `Checkout`.
- Guardas de rota e hidratação de sessão.
- Toasts, skeletons e tratamento centralizado de erros da API.

## Multi‑Tenant (Detalhes)

- Resolver subdomínio no servidor (middleware) e no cliente (hook) para obter `storeId`.
- Incluir `storeId` em cabeçalhos ou query params nas chamadas.
- Isolar estado por loja (carrinho, tema e preferências).

## Acessibilidade e Performance

- Acessibilidade: ARIA, navegação por teclado, foco e contraste adequados.
- Performance: imagens otimizadas, lazy loading, lista virtualizada quando necessário, cache com React Query.
- SEO: metadados por página de produto/categoria; friendly URLs com `slug`.

## Estrutura de Pastas Sugerida

```
app/
  (home)/page.tsx
  c/[slug]/page.tsx
  search/page.tsx
  p/[slug]/page.tsx
  custom/[productId]/page.tsx
  cart/page.tsx
  checkout/page.tsx
  login/page.tsx
  register/page.tsx
  recover/page.tsx
  account/page.tsx
  orders/page.tsx
  orders/[id]/page.tsx
components/
  layout/
  product/
  cart/
  forms/
hooks/
  useStore.ts
  useCart.ts
  useProducts.ts
  useCheckout.ts
  useOrders.ts
lib/
  api.ts
  stripe.ts
styles/
```

## Stripe (Checkout)

- Usar Stripe Elements (ex.: `CardElement`) para coleta de cartão.
- Nunca trafegar dados de cartão sem Stripe.
- Criar intenção de pagamento via API; enviar `paymentMethodId`; tratar sucesso/erro e redirecionar para confirmação.

---

Este documento serve para guiar a implementação do front‑end do cliente final com base nos módulos disponíveis na API do projeto. O foco é uma experiência de compra consistente, segura, multi‑tenant e de alta qualidade.

## 📋 Contexto do Projeto

Baseado na análise do backend Node.js/Express com Prisma e PostgreSQL, você deve criar um frontend moderno e escalável para um sistema de e-commerce com as seguintes funcionalidades principais:

### 🎯 Funcionalidades Identificadas no Backend

**Autenticação & Usuários:**
- Login/Logout com JWT e cookies seguros
- Registro de usuários com integração Stripe
- Middleware de autenticação obrigatória e opcional
- Roles (USER/ADMIN)
- Refresh token automático

**Produtos:**
- CRUD completo de produtos
- Upload de múltiplas imagens (até 5)
- Categorização
- Controle de estoque e disponibilidade
- Produtos físicos e digitais
- Sistema de personalização de produtos

**Categorias:**
- CRUD de categorias
- Listagem de produtos por categoria

**Pedidos:**
- Criação de pedidos (integrado ao carrinho)
- Histórico de pedidos do usuário
- Painel administrativo de pedidos
- Status de pedidos
- Métodos de pagamento (PIX, Cartão, Dinheiro)
- Endereço de entrega

**Checkout & Pagamentos:**
- Integração com Stripe
- Geração de checkout
- Webhooks para confirmação

## 🏗️ Estrutura de Pastas Recomendada

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Input, Modal, etc.)
│   ├── forms/           # Componentes de formulário
│   ├── layout/          # Header, Footer, Sidebar
│   ├── product/         # ProductCard, ProductGrid, ProductForm
│   ├── order/           # OrderCard, OrderStatus, OrderSummary
│   └── auth/            # LoginForm, RegisterForm, AuthGuard
├── pages/               # Páginas da aplicação
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── products/        # ProductList, ProductDetail, ProductCreate
│   ├── categories/      # CategoryList, CategoryDetail
│   ├── orders/          # OrderHistory, OrderDetail
│   ├── cart/            # Cart, Checkout
│   ├── admin/           # AdminDashboard, AdminOrders, AdminProducts
│   └── profile/         # UserProfile, Settings
├── services/            # Camada de comunicação com API
│   ├── api/             # Configuração base do axios
│   ├── auth.service.ts  # Serviços de autenticação
│   ├── product.service.ts
│   ├── category.service.ts
│   ├── order.service.ts
│   ├── checkout.service.ts
│   └── upload.service.ts
├── hooks/               # Custom hooks
│   ├── useAuth.ts       # Gerenciamento de autenticação
│   ├── useCart.ts       # Gerenciamento do carrinho
│   ├── useProducts.ts   # Operações com produtos
│   ├── useOrders.ts     # Operações com pedidos
│   ├── usePagination.ts # Paginação reutilizável
│   └── useLocalStorage.ts
├── store/               # Gerenciamento de estado global
│   ├── slices/          # Redux slices ou Zustand stores
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── productSlice.ts
│   │   └── orderSlice.ts
│   └── index.ts
├── types/               # Definições de tipos TypeScript
│   ├── auth.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   └── api.types.ts
├── utils/               # Utilitários e helpers
│   ├── formatters.ts    # Formatação de dados
│   ├── validators.ts    # Validações
│   ├── constants.ts     # Constantes da aplicação
│   └── helpers.ts
└── styles/              # Estilos globais e temas
    ├── globals.css
    ├── components.css
    └── themes/
```

## 🔧 Services - Camada de API

### Estrutura Base dos Services

```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Para cookies de autenticação
});

// Interceptors para tratamento de erros e refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentar refresh token
      try {
        await authService.refreshToken();
        return apiClient.request(error.config);
      } catch {
        // Redirecionar para login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Services Específicos

```typescript
// services/auth.service.ts
export const authService = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData: RegisterData) => 
    apiClient.post('/auth/register', userData),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  refreshToken: () => 
    apiClient.post('/auth/refresh'),
};

// services/product.service.ts
export const productService = {
  getAll: (params?: ProductFilters) => 
    apiClient.get('/products', { params }),
  
  getById: (id: number) => 
    apiClient.get(`/products/${id}`),
  
  create: (productData: FormData) => 
    apiClient.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: number, productData: FormData) => 
    apiClient.patch(`/products/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
```

## 🎣 Custom Hooks

### Hook de Autenticação

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, isAuthenticated, login, logout, checkAuth };
};
```

### Hook do Carrinho

```typescript
// hooks/useCart.ts
export const useCart = () => {
  const [items, setItems] = useLocalStorage<CartItem[]>('cart', []);

  const addItem = (product: Product, quantity: number = 1, customizations?: Customization[]) => {
    const existingItem = items.find(item => 
      item.productId === product.id && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItem) {
      setItems(items.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        customizations,
        subtotal: product.price * quantity
      };
      setItems([...items, newItem]);
    }
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, quantity, subtotal: item.price * quantity }
        : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((total, item) => total + item.subtotal, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems
  };
};
```

## 📄 Pages - Estrutura das Páginas

### Página de Produtos

```typescript
// pages/products/ProductList.tsx
export const ProductList = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  const { categories } = useCategories();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts({ ...filters, page: currentPage });
  }, [filters, currentPage]);

  return (
    <div className="product-list">
      <ProductFilters 
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductGrid products={products} />
      )}
      
      <Pagination 
        currentPage={currentPage}
        totalPages={products.meta?.totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
```

### Página de Checkout

```typescript
// pages/cart/Checkout.tsx
export const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState<CreateOrderDto>({
    enderecoEntrega: '',
    metodoPagamento: 'PIX',
    items: [],
    customizations: []
  });

  const handleSubmitOrder = async () => {
    try {
      const order = await orderService.create({
        ...orderData,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          customizations: item.customizations
        }))
      });
      
      clearCart();
      router.push(`/orders/${order.data.id}`);
    } catch (error) {
      // Tratamento de erro
    }
  };

  return (
    <div className="checkout">
      <OrderSummary items={items} totalPrice={totalPrice} />
      <CheckoutForm 
        orderData={orderData}
        onDataChange={setOrderData}
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
};
```

## 🎨 Melhores Práticas

### 1. **Gerenciamento de Estado**
- Use Zustand ou Redux Toolkit para estado global
- useState para estado local de componentes
- React Query/TanStack Query para cache de dados da API

### 2. **Tratamento de Erros**
- Error boundaries para capturar erros de componentes
- Try-catch em operações assíncronas
- Feedback visual para usuários (toasts, modais)

### 3. **Performance**
- Lazy loading para páginas e componentes pesados
- Memoização com React.memo, useMemo, useCallback
- Otimização de imagens com Next.js Image
- Paginação e virtualização para listas grandes

### 4. **Segurança**
- Validação de dados no frontend e backend
- Sanitização de inputs
- Proteção de rotas com AuthGuard
- HTTPS em produção

### 5. **UX/UI**
- Loading states e skeletons
- Estados vazios informativos
- Feedback de ações (sucesso/erro)
- Design responsivo
- Acessibilidade (ARIA labels, navegação por teclado)

### 6. **Testes**
- Testes unitários com Jest/Vitest
- Testes de integração com Testing Library
- Testes E2E com Playwright/Cypress

## 🚀 Stack Tecnológica Recomendada

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/ui
- **Estado:** Zustand + TanStack Query
- **Formulários:** React Hook Form + Zod
- **Testes:** Vitest + Testing Library
- **Build:** Vite ou Next.js

## 📋 Checklist de Implementação

### Fase 1 - Fundação
- [ ] Configurar projeto com TypeScript
- [ ] Implementar sistema de autenticação
- [ ] Criar componentes base (UI Kit)
- [ ] Configurar roteamento e proteção de rotas

### Fase 2 - Funcionalidades Core
- [ ] Implementar listagem e detalhes de produtos
- [ ] Criar sistema de carrinho
- [ ] Desenvolver fluxo de checkout
- [ ] Implementar histórico de pedidos

### Fase 3 - Funcionalidades Avançadas
- [ ] Painel administrativo
- [ ] Sistema de categorias
- [ ] Personalização de produtos
- [ ] Integração com Stripe

### Fase 4 - Otimização
- [ ] Implementar cache e otimizações
- [ ] Adicionar testes
- [ ] Melhorar acessibilidade
- [ ] Deploy e monitoramento

Este prompt fornece uma base sólida para desenvolver um frontend moderno, escalável e bem estruturado que se integra perfeitamente com o backend existente.

## 📚 Recursos Adicionais

### Endpoints da API Identificados

```
# Autenticação
POST /auth/login
POST /auth/register  
GET /auth/me
POST /auth/logout
POST /auth/refresh

# Produtos
GET /products
GET /products/:id
POST /products (auth required)
PATCH /products/:id (auth required)

# Categorias
GET /category
GET /category/:id
GET /category/products/:id
POST /category
PATCH /category/:id

# Pedidos
GET /orders (user orders)
GET /orders/all (admin)
GET /orders/:id
POST /orders
PUT /orders/:id

# Checkout
GET /checkout (auth required)

# Produtos Customizados
GET /custom
GET /custom/product/:id
POST /custom (auth required)
POST /custom/option/:id

# Webhooks
POST /data/webhook
```

### Estrutura de Dados (TypeScript Types)

```typescript
// Tipos baseados no backend
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  ownerId: number;
  categoryId: number;
  isAvailable: boolean;
  stock?: number;
  type: 'PHYSICAL' | 'DIGITAL';
  photos: Photo[];
  category: Category;
  productCustomizations?: ProductCustomization[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  totalPrice: number;
  metodoPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO';
  enderecoEntrega?: string;
  orderItems: OrderItem[];
  user?: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  customizations?: Customization[];
  subtotal: number;
}
```

Este documento serve como um guia completo para o desenvolvimento do frontend, garantindo alinhamento total com a arquitetura e funcionalidades do backend existente.