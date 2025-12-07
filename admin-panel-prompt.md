# Prompt para Painel Administrativo - E-commerce Micro-SaaS

## 📋 Contexto do Projeto

Desenvolva um painel administrativo moderno e completo usando **React + TypeScript** para gerenciar um sistema de e-commerce. O painel deve permitir que o dono do negócio gerencie produtos, pedidos e tenha acesso a relatórios financeiros detalhados.

### 🎯 Funcionalidades Principais Identificadas no Backend

**Gerenciamento de Produtos:**
- CRUD completo de produtos
- Upload de múltiplas imagens (até 5)
- Controle de estoque e disponibilidade
- Categorização de produtos
- Produtos físicos e digitais
- Sistema de personalização de produtos

**Gerenciamento de Pedidos:**
- Visualização de todos os pedidos
- Atualização de status dos pedidos
- Filtros por status, data, cliente
- Detalhes completos do pedido
- Histórico de alterações

**Relatórios Financeiros:**
- Dashboard com métricas principais
- Vendas por período
- Produtos mais vendidos
- Receita total e líquida
- Análise de performance

**Gerenciamento de Usuários:**
- Visualização de clientes
- Histórico de pedidos por cliente
- Informações de pagamento (Stripe)

## 🏗️ Estrutura de Pastas Organizadas por Services

```
src/
├── components/                    # Componentes reutilizáveis
│   ├── ui/                       # Componentes base do design system
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Dropdown/
│   │   └── index.ts
│   ├── layout/                   # Componentes de layout
│   │   ├── AdminLayout/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   ├── Breadcrumb/
│   │   └── index.ts
│   ├── charts/                   # Componentes de gráficos
│   │   ├── LineChart/
│   │   ├── BarChart/
│   │   ├── PieChart/
│   │   └── index.ts
│   └── forms/                    # Componentes de formulário
│       ├── ProductForm/
│       ├── CategoryForm/
│       ├── OrderStatusForm/
│       └── index.ts
├── pages/                        # Páginas do painel
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── DashboardMetrics.tsx
│   │   └── DashboardCharts.tsx
│   ├── Products/
│   │   ├── ProductList.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductCreate.tsx
│   │   ├── ProductEdit.tsx
│   │   └── ProductCategories.tsx
│   ├── Orders/
│   │   ├── OrderList.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── OrderFilters.tsx
│   │   └── OrderStatusUpdate.tsx
│   ├── Reports/
│   │   ├── SalesReport.tsx
│   │   ├── ProductReport.tsx
│   │   ├── CustomerReport.tsx
│   │   └── FinancialReport.tsx
│   ├── Customers/
│   │   ├── CustomerList.tsx
│   │   ├── CustomerDetail.tsx
│   │   └── CustomerOrders.tsx
│   └── Settings/
│       ├── GeneralSettings.tsx
│       ├── PaymentSettings.tsx
│       └── NotificationSettings.tsx
├── services/                     # Camada de comunicação com API
│   ├── api/
│   │   ├── client.ts            # Configuração base do axios
│   │   ├── interceptors.ts      # Interceptors de request/response
│   │   └── types.ts             # Tipos da API
│   ├── auth/
│   │   ├── auth.service.ts      # Serviços de autenticação
│   │   ├── auth.types.ts        # Tipos de autenticação
│   │   └── index.ts
│   ├── products/
│   │   ├── product.service.ts   # CRUD de produtos
│   │   ├── category.service.ts  # CRUD de categorias
│   │   ├── product.types.ts     # Tipos de produtos
│   │   └── index.ts
│   ├── orders/
│   │   ├── order.service.ts     # Gerenciamento de pedidos
│   │   ├── order.types.ts       # Tipos de pedidos
│   │   └── index.ts
│   ├── reports/
│   │   ├── analytics.service.ts # Serviços de relatórios
│   │   ├── metrics.service.ts   # Métricas e KPIs
│   │   ├── reports.types.ts     # Tipos de relatórios
│   │   └── index.ts
│   ├── customers/
│   │   ├── customer.service.ts  # Gerenciamento de clientes
│   │   ├── customer.types.ts    # Tipos de clientes
│   │   └── index.ts
│   └── upload/
│       ├── upload.service.ts    # Upload de arquivos
│       ├── image.service.ts     # Processamento de imagens
│       └── index.ts
├── hooks/                        # Custom hooks organizados por domínio
│   ├── auth/
│   │   ├── useAuth.ts           # Hook de autenticação
│   │   ├── usePermissions.ts    # Hook de permissões
│   │   └── index.ts
│   ├── products/
│   │   ├── useProducts.ts       # Hook para produtos
│   │   ├── useCategories.ts     # Hook para categorias
│   │   ├── useProductForm.ts    # Hook para formulário de produto
│   │   └── index.ts
│   ├── orders/
│   │   ├── useOrders.ts         # Hook para pedidos
│   │   ├── useOrderFilters.ts   # Hook para filtros de pedidos
│   │   ├── useOrderStatus.ts    # Hook para status de pedidos
│   │   └── index.ts
│   ├── reports/
│   │   ├── useAnalytics.ts      # Hook para analytics
│   │   ├── useSalesData.ts      # Hook para dados de vendas
│   │   ├── useMetrics.ts        # Hook para métricas
│   │   └── index.ts
│   ├── common/
│   │   ├── usePagination.ts     # Hook de paginação
│   │   ├── useDebounce.ts       # Hook de debounce
│   │   ├── useLocalStorage.ts   # Hook de localStorage
│   │   ├── useModal.ts          # Hook para modais
│   │   └── index.ts
│   └── customers/
│       ├── useCustomers.ts      # Hook para clientes
│       ├── useCustomerOrders.ts # Hook para pedidos do cliente
│       └── index.ts
├── store/                        # Gerenciamento de estado global
│   ├── slices/
│   │   ├── authSlice.ts         # Estado de autenticação
│   │   ├── productsSlice.ts     # Estado de produtos
│   │   ├── ordersSlice.ts       # Estado de pedidos
│   │   ├── uiSlice.ts           # Estado da UI (modais, loading)
│   │   └── index.ts
│   ├── providers/
│   │   ├── StoreProvider.tsx    # Provider do store
│   │   └── index.ts
│   └── index.ts
├── types/                        # Definições de tipos TypeScript
│   ├── auth.types.ts            # Tipos de autenticação
│   ├── product.types.ts         # Tipos de produtos
│   ├── order.types.ts           # Tipos de pedidos
│   ├── customer.types.ts        # Tipos de clientes
│   ├── report.types.ts          # Tipos de relatórios
│   ├── api.types.ts             # Tipos da API
│   └── common.types.ts          # Tipos comuns
├── utils/                        # Utilitários organizados por função
│   ├── formatters/
│   │   ├── currency.ts          # Formatação de moeda
│   │   ├── date.ts              # Formatação de data
│   │   ├── number.ts            # Formatação de números
│   │   └── index.ts
│   ├── validators/
│   │   ├── product.validators.ts # Validações de produto
│   │   ├── order.validators.ts   # Validações de pedido
│   │   ├── common.validators.ts  # Validações comuns
│   │   └── index.ts
│   ├── constants/
│   │   ├── api.constants.ts     # Constantes da API
│   │   ├── ui.constants.ts      # Constantes da UI
│   │   ├── business.constants.ts # Constantes de negócio
│   │   └── index.ts
│   ├── helpers/
│   │   ├── array.helpers.ts     # Helpers para arrays
│   │   ├── object.helpers.ts    # Helpers para objetos
│   │   ├── string.helpers.ts    # Helpers para strings
│   │   └── index.ts
│   └── charts/
│       ├── chartConfig.ts       # Configurações de gráficos
│       ├── chartHelpers.ts      # Helpers para gráficos
│       └── index.ts
├── styles/                       # Estilos organizados
│   ├── globals.css              # Estilos globais
│   ├── components.css           # Estilos de componentes
│   ├── variables.css            # Variáveis CSS
│   └── themes/
│       ├── light.css            # Tema claro
│       ├── dark.css             # Tema escuro
│       └── index.ts
└── config/                       # Configurações
    ├── env.ts                   # Variáveis de ambiente
    ├── routes.ts                # Configuração de rotas
    └── permissions.ts           # Configuração de permissões
```

## 🔧 Services - Implementação Detalhada

### Utilitários para Subdomínio

```typescript
// utils/subdomain.ts
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Se for localhost ou IP, não há subdomínio
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Se tiver mais de 2 partes, o primeiro é o subdomínio
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
};

export const getApiBaseUrl = (): string => {
  const subdomain = getSubdomain();
  
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
  
  // Em produção, usar o mesmo subdomínio para a API
  if (subdomain) {
    return `https://${subdomain}.api.seudominio.com`;
  }
  
  return process.env.REACT_APP_API_URL || 'https://api.seudominio.com';
};

export const getTenantFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tenantCookie = cookies.find(cookie => 
    cookie.trim().startsWith('tenant=') || 
    cookie.trim().startsWith('subdomain=')
  );
  
  if (tenantCookie) {
    return tenantCookie.split('=')[1]?.trim();
  }
  
  return null;
};
```

### Configuração Base da API

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthService } from '../auth/auth.service';
import { getApiBaseUrl, getTenantFromCookie, getSubdomain } from '../../utils/subdomain';

class ApiClient {
  private client: AxiosInstance;
  private authService: AuthService;
  private currentTenant: string | null = null;

  constructor() {
    this.initializeTenant();
    
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      withCredentials: true, // Importante para receber cookies do backend
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.authService = new AuthService();
    this.setupInterceptors();
  }

  private initializeTenant() {
    // Tenta obter o tenant do subdomínio primeiro
    this.currentTenant = getSubdomain();
    
    // Se não encontrar no subdomínio, tenta obter do cookie
    if (!this.currentTenant) {
      this.currentTenant = getTenantFromCookie();
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Adiciona o tenant no header se disponível
        if (this.currentTenant) {
          config.headers['X-Tenant'] = this.currentTenant;
        }

        // Adiciona token de autenticação se disponível
        const token = this.authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Verifica se o backend enviou um novo tenant no cookie
        const newTenant = getTenantFromCookie();
        if (newTenant && newTenant !== this.currentTenant) {
          this.currentTenant = newTenant;
        }
        
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.authService.refreshToken();
            return this.client.request(error.config);
          } catch {
            this.authService.logout();
            // Redireciona mantendo o subdomínio se existir
            const subdomain = getSubdomain();
            const loginUrl = subdomain 
              ? `https://${subdomain}.seudominio.com/login`
              : '/login';
            window.location.href = loginUrl;
          }
        }
        
        // Se for erro 403, pode ser problema de tenant
        if (error.response?.status === 403) {
          console.error('Acesso negado - verifique o tenant/subdomínio');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Método para atualizar o tenant dinamicamente
  public updateTenant(tenant: string) {
    this.currentTenant = tenant;
  }

  // Método para obter o tenant atual
  public getCurrentTenant(): string | null {
    return this.currentTenant;
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
```

### Service de Produtos

```typescript
// services/products/product.service.ts
import { apiClient } from '../api/client';
import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters,
  PaginatedResponse 
} from './product.types';

export class ProductService {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: filters
    });
    return response.data;
  }

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  }

  async create(productData: CreateProductDto): Promise<Product> {
    const formData = this.createFormData(productData);
    const response = await apiClient.post<Product>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async update(id: number, productData: UpdateProductDto): Promise<Product> {
    const formData = this.createFormData(productData);
    const response = await apiClient.patch<Product>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  async updateStock(id: number, stock: number): Promise<Product> {
    const response = await apiClient.patch<Product>(`/products/${id}`, { stock });
    return response.data;
  }

  async toggleAvailability(id: number): Promise<Product> {
    const response = await apiClient.patch<Product>(`/products/${id}/toggle-availability`);
    return response.data;
  }

  private createFormData(data: CreateProductDto | UpdateProductDto): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return formData;
  }
}

export const productService = new ProductService();
```

### Serviço de Autenticação

```typescript
// services/auth/auth.service.ts
import { apiClient } from '../api/client';
import { LoginRequest, LoginResponse, User } from '../../types/auth.types';
import { getSubdomain, getTenantFromCookie } from '../../utils/subdomain';

export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Inclui informações do tenant no login se disponível
    const tenant = getSubdomain() || getTenantFromCookie();
    const loginData = tenant ? { ...credentials, tenant } : credentials;
    
    const response = await apiClient.post<LoginResponse>('/auth/login', loginData);
    
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setRefreshToken(response.data.refreshToken);
      this.setUser(response.data.user);
      
      // Atualiza o tenant no cliente API se recebido do backend
      const newTenant = getTenantFromCookie();
      if (newTenant) {
        apiClient.updateTenant(newTenant);
      }
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      this.clearTokens();
      // Redireciona para login mantendo o subdomínio
      const subdomain = getSubdomain();
      const loginUrl = subdomain 
        ? `https://${subdomain}.seudominio.com/login`
        : '/login';
      window.location.href = loginUrl;
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiClient.post<{ token: string }>('/auth/refresh', {
      refreshToken
    });

    this.setToken(response.data.token);
    return response.data.token;
  }

  // Método para verificar se o usuário tem acesso ao tenant atual
  async validateTenantAccess(): Promise<boolean> {
    try {
      const currentTenant = apiClient.getCurrentTenant();
      if (!currentTenant) return true; // Se não há tenant, assume acesso livre
      
      const response = await apiClient.get('/auth/validate-tenant');
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao validar acesso ao tenant:', error);
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentTenant(): string | null {
    return apiClient.getCurrentTenant();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

export const authService = new AuthService();
```

### Service de Pedidos

```typescript
// services/orders/order.service.ts
import { apiClient } from '../api/client';
import type { 
  Order, 
  OrderFilters, 
  UpdateOrderStatusDto,
  OrderStats,
  PaginatedResponse 
} from './order.types';

export class OrderService {
  async getAll(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders/all', {
      params: filters
    });
    return response.data;
  }

  async getById(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async updateStatus(id: number, statusData: UpdateOrderStatusDto): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${id}`, statusData);
    return response.data;
  }

  async getStats(period?: string): Promise<OrderStats> {
    const response = await apiClient.get<OrderStats>('/orders/stats', {
      params: { period }
    });
    return response.data;
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders/recent', {
      params: { limit }
    });
    return response.data;
  }

  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const response = await apiClient.get('/orders/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
}

export const orderService = new OrderService();
```

### Service de Relatórios

```typescript
// services/reports/analytics.service.ts
import { apiClient } from '../api/client';
import type { 
  SalesReport, 
  ProductReport, 
  CustomerReport,
  FinancialMetrics,
  ReportFilters 
} from './reports.types';

export class AnalyticsService {
  async getSalesReport(filters: ReportFilters): Promise<SalesReport> {
    const response = await apiClient.get<SalesReport>('/reports/sales', {
      params: filters
    });
    return response.data;
  }

  async getProductReport(filters: ReportFilters): Promise<ProductReport> {
    const response = await apiClient.get<ProductReport>('/reports/products', {
      params: filters
    });
    return response.data;
  }

  async getCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
    const response = await apiClient.get<CustomerReport>('/reports/customers', {
      params: filters
    });
    return response.data;
  }

  async getFinancialMetrics(period: string): Promise<FinancialMetrics> {
    const response = await apiClient.get<FinancialMetrics>('/reports/financial', {
      params: { period }
    });
    return response.data;
  }

  async getDashboardMetrics(): Promise<any> {
    const response = await apiClient.get('/reports/dashboard');
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
```

## 🎣 Custom Hooks Especializados

### Hook de Autenticação

```typescript
// hooks/auth/useAuth.ts
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { authService } from '../../services/auth/auth.service';
import { User } from '../../types/auth.types';
import { getSubdomain, getTenantFromCookie } from '../../utils/subdomain';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentTenant: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateTenantAccess: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Inicializa o tenant
      const tenant = getSubdomain() || getTenantFromCookie();
      setCurrentTenant(tenant);

      // Verifica se há um usuário autenticado
      const storedUser = authService.getUser();
      if (storedUser && authService.isAuthenticated()) {
        // Valida se o usuário tem acesso ao tenant atual
        const hasAccess = await authService.validateTenantAccess();
        if (hasAccess) {
          setUser(storedUser);
        } else {
          // Se não tem acesso, faz logout
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Atualiza o tenant após login bem-sucedido
      const newTenant = getTenantFromCookie() || getSubdomain();
      setCurrentTenant(newTenant);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTenantAccess = async (): Promise<boolean> => {
    return await authService.validateTenantAccess();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    currentTenant,
    login,
    logout,
    validateTenantAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Hook para verificar permissões baseadas no tenant
export const useTenantPermissions = () => {
  const { currentTenant, user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !currentTenant) return false;
    
    // Lógica de permissões baseada no tenant
    // Isso pode ser expandido conforme as regras de negócio
    return user.permissions?.includes(permission) || false;
  };

  const isTenantOwner = (): boolean => {
    if (!user || !currentTenant) return false;
    return user.role === 'owner' && user.tenantId === currentTenant;
  };

  const isTenantAdmin = (): boolean => {
    if (!user || !currentTenant) return false;
    return ['owner', 'admin'].includes(user.role) && user.tenantId === currentTenant;
  };

  return {
    hasPermission,
    isTenantOwner,
    isTenantAdmin,
    currentTenant,
  };
};
```

### Hook de Produtos

```typescript
// hooks/products/useProducts.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/products';
import type { Product, ProductFilters, CreateProductDto } from '../../types/product.types';

export const useProducts = (filters?: ProductFilters) => {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: (productData: CreateProductDto) => productService.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => 
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: products?.data || [],
    meta: products?.meta,
    isLoading,
    error,
    refetch,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
```

### Hook de Pedidos

```typescript
// hooks/orders/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orders';
import type { OrderFilters, UpdateOrderStatusDto } from '../../types/order.types';

export const useOrders = (filters?: OrderFilters) => {
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.getAll(filters),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: UpdateOrderStatusDto }) => 
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => orderService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    orders: orders?.data || [],
    meta: orders?.meta,
    stats,
    isLoading,
    isLoadingStats,
    error,
    refetch,
    updateOrderStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
```

### Hook de Analytics

```typescript
// hooks/reports/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/reports';
import type { ReportFilters } from '../../types/report.types';

export const useAnalytics = (filters: ReportFilters) => {
  const {
    data: salesReport,
    isLoading: isLoadingSales
  } = useQuery({
    queryKey: ['sales-report', filters],
    queryFn: () => analyticsService.getSalesReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });

  const {
    data: productReport,
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['product-report', filters],
    queryFn: () => analyticsService.getProductReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });

  const {
    data: dashboardMetrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });

  return {
    salesReport,
    productReport,
    dashboardMetrics,
    isLoadingSales,
    isLoadingProducts,
    isLoadingMetrics,
    isLoading: isLoadingSales || isLoadingProducts || isLoadingMetrics,
  };
};
```

## 📊 Páginas Principais

### Dashboard Principal

```typescript
// pages/Dashboard/Dashboard.tsx
import React from 'react';
import { useAnalytics } from '../../hooks/reports/useAnalytics';
import { DashboardMetrics } from './DashboardMetrics';
import { DashboardCharts } from './DashboardCharts';
import { RecentOrders } from '../Orders/RecentOrders';
import { TopProducts } from '../Products/TopProducts';

export const Dashboard: React.FC = () => {
  const { dashboardMetrics, isLoadingMetrics } = useAnalytics({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    endDate: new Date(),
  });

  if (isLoadingMetrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn-primary">Exportar Relatório</button>
        </div>
      </div>

      <DashboardMetrics metrics={dashboardMetrics} />
      
      <div className="dashboard-grid">
        <div className="dashboard-charts">
          <DashboardCharts data={dashboardMetrics?.charts} />
        </div>
        
        <div className="dashboard-sidebar">
          <RecentOrders />
          <TopProducts />
        </div>
      </div>
    </div>
  );
};
```

### Lista de Produtos

```typescript
// pages/Products/ProductList.tsx
import React, { useState } from 'react';
import { useProducts } from '../../hooks/products/useProducts';
import { ProductTable } from '../../components/products/ProductTable';
import { ProductFilters } from '../../components/products/ProductFilters';
import { CreateProductModal } from '../../components/products/CreateProductModal';

export const ProductList: React.FC = () => {
  const [filters, setFilters] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { 
    products, 
    meta, 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts(filters);

  const handleCreateProduct = (productData: CreateProductDto) => {
    createProduct(productData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  return (
    <div className="product-list">
      <div className="page-header">
        <h1>Produtos</h1>
        <button 
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Adicionar Produto
        </button>
      </div>

      <ProductFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ProductTable
        products={products}
        meta={meta}
        isLoading={isLoading}
        onUpdate={updateProduct}
        onDelete={deleteProduct}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
};
```

## 🎨 Componentes Especializados

### Tabela de Produtos

```typescript
// components/products/ProductTable.tsx
import React from 'react';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters/currency';
import type { Product } from '../../types/product.types';

interface ProductTableProps {
  products: Product[];
  meta?: any;
  isLoading: boolean;
  onUpdate: (id: number, data: Partial<Product>) => void;
  onDelete: (id: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  meta,
  isLoading,
  onUpdate,
  onDelete
}) => {
  const columns = [
    {
      key: 'image',
      label: 'Imagem',
      render: (product: Product) => (
        <img 
          src={product.photos[0]?.url || '/placeholder.jpg'} 
          alt={product.name}
          className="product-thumbnail"
        />
      )
    },
    {
      key: 'name',
      label: 'Nome',
      render: (product: Product) => (
        <div>
          <div className="product-name">{product.name}</div>
          <div className="product-category">{product.category?.name}</div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Preço',
      render: (product: Product) => formatCurrency(product.price)
    },
    {
      key: 'stock',
      label: 'Estoque',
      render: (product: Product) => (
        <Badge variant={product.stock > 10 ? 'success' : 'warning'}>
          {product.stock || 0}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (product: Product) => (
        <Badge variant={product.isAvailable ? 'success' : 'error'}>
          {product.isAvailable ? 'Disponível' : 'Indisponível'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (product: Product) => (
        <div className="table-actions">
          <button onClick={() => onUpdate(product.id, { isAvailable: !product.isAvailable })}>
            {product.isAvailable ? 'Desativar' : 'Ativar'}
          </button>
          <button onClick={() => onDelete(product.id)}>
            Excluir
          </button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={products}
      isLoading={isLoading}
      pagination={meta}
    />
  );
};
```

## 📈 Relatórios Financeiros

### Componente de Métricas

```typescript
// pages/Dashboard/DashboardMetrics.tsx
import React from 'react';
import { MetricCard } from '../../components/ui/MetricCard';
import { formatCurrency } from '../../utils/formatters/currency';
import type { DashboardMetrics as MetricsType } from '../../types/report.types';

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  return (
    <div className="metrics-grid">
      <MetricCard
        title="Receita Total"
        value={formatCurrency(metrics.totalRevenue)}
        change={metrics.revenueChange}
        icon="💰"
      />
      
      <MetricCard
        title="Pedidos Hoje"
        value={metrics.todayOrders}
        change={metrics.ordersChange}
        icon="📦"
      />
      
      <MetricCard
        title="Produtos Vendidos"
        value={metrics.productsSold}
        change={metrics.productsChange}
        icon="🛍️"
      />
      
      <MetricCard
        title="Clientes Ativos"
        value={metrics.activeCustomers}
        change={metrics.customersChange}
        icon="👥"
      />
    </div>
  );
};
```

## 🚀 Stack Tecnológica Recomendada

- **Framework:** React 18+ com TypeScript
- **Roteamento:** React Router v6
- **Estado Global:** Zustand + TanStack Query
- **Estilização:** Tailwind CSS + Headless UI
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts ou Chart.js
- **Tabelas:** TanStack Table
- **Testes:** Vitest + Testing Library
- **Build:** Vite

## 🎯 Funcionalidades Específicas

### 1. **Dashboard Executivo**
- Métricas em tempo real
- Gráficos de vendas por período
- Top produtos mais vendidos
- Pedidos recentes
- Alertas de estoque baixo

### 2. **Gerenciamento de Produtos**
- CRUD completo com upload de imagens
- Controle de estoque em tempo real
- Categorização e filtros avançados
- Produtos em destaque
- Histórico de alterações

### 3. **Gerenciamento de Pedidos**
- Lista com filtros por status, data, cliente
- Atualização de status em lote
- Detalhes completos do pedido
- Histórico de alterações
- Notificações automáticas

### 4. **Relatórios Financeiros**
- Vendas por período (dia, semana, mês, ano)
- Análise de produtos mais lucrativos
- Relatório de clientes
- Exportação em PDF/Excel
- Comparativos de períodos

### 5. **Gerenciamento de Clientes**
- Lista de clientes com histórico
- Pedidos por cliente
- Informações de pagamento
- Segmentação de clientes

## 📋 Checklist de Implementação

### Fase 1 - Fundação (Semana 1-2)
- [ ] Configurar projeto React + TypeScript
- [ ] Implementar sistema de autenticação
- [ ] Criar layout base e componentes UI
- [ ] Configurar roteamento e proteção de rotas
- [ ] Implementar interceptors de API

### Fase 2 - Funcionalidades Core (Semana 3-4)
- [ ] Dashboard com métricas principais
- [ ] CRUD de produtos com upload de imagens
- [ ] Lista e detalhes de pedidos
- [ ] Atualização de status de pedidos
- [ ] Filtros e paginação

### Fase 3 - Relatórios (Semana 5-6)
- [ ] Relatórios de vendas
- [ ] Análise de produtos
- [ ] Métricas financeiras
- [ ] Gráficos interativos
- [ ] Exportação de dados

### Fase 4 - Otimização (Semana 7-8)
- [ ] Performance e cache
- [ ] Testes automatizados
- [ ] Responsividade mobile
- [ ] Acessibilidade
- [ ] Deploy e monitoramento

## 🔒 Segurança e Permissões

### Sistema de Permissões
```typescript
// utils/permissions.ts
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_ORDERS = 'manage_orders',
  VIEW_REPORTS = 'view_reports',
  MANAGE_CUSTOMERS = 'manage_customers',
}

export const checkPermission = (userRole: string, permission: Permission): boolean => {
  const rolePermissions = {
    ADMIN: Object.values(Permission),
    MANAGER: [Permission.VIEW_DASHBOARD, Permission.MANAGE_ORDERS, Permission.VIEW_REPORTS],
    OPERATOR: [Permission.VIEW_DASHBOARD, Permission.MANAGE_ORDERS],
  };

  return rolePermissions[userRole]?.includes(permission) || false;
};
```

## 📱 Responsividade e UX

### Design System
- Componentes reutilizáveis e consistentes
- Tema claro/escuro
- Feedback visual para todas as ações
- Loading states e skeletons
- Tratamento de erros amigável
- Navegação intuitiva

### Performance
- Lazy loading de páginas
- Virtualização de listas grandes
- Cache inteligente com TanStack Query
- Otimização de imagens
- Bundle splitting

## 🔐 Considerações de Segurança e Multi-Tenancy

### Segurança Multi-Tenant

1. **Isolamento de Dados por Tenant**
   - Todos os requests incluem identificação do tenant via subdomínio ou cookie
   - Validação de acesso ao tenant em cada operação
   - Headers `X-Tenant` enviados automaticamente

2. **Autenticação e Autorização**
   - Tokens JWT incluem informações do tenant
   - Validação de permissões específicas por tenant
   - Logout automático em caso de acesso negado

3. **Cookies e Subdomínios**
   - Cookies httpOnly para segurança
   - Subdomínio extraído automaticamente da URL
   - Fallback para cookies quando subdomínio não disponível

### Configuração de Ambiente

```typescript
// .env.example
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DOMAIN=seudominio.com
REACT_APP_API_DOMAIN=api.seudominio.com
NODE_ENV=development
```

### Middleware de Tenant (Opcional)

```typescript
// middleware/tenantMiddleware.ts
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubdomain, getTenantFromCookie } from '../utils/subdomain';

export const useTenantValidation = () => {
  const { validateTenantAccess, logout } = useAuth();

  useEffect(() => {
    const validateAccess = async () => {
      const hasAccess = await validateTenantAccess();
      if (!hasAccess) {
        console.warn('Acesso negado ao tenant atual');
        await logout();
      }
    };

    // Valida acesso quando o componente monta
    validateAccess();

    // Revalida quando o subdomínio muda (se necessário)
    const currentTenant = getSubdomain() || getTenantFromCookie();
    if (currentTenant) {
      validateAccess();
    }
  }, [validateTenantAccess, logout]);
};
```

Este prompt fornece uma base completa para desenvolver um painel administrativo robusto, escalável e moderno que atende todas as necessidades de gerenciamento do e-commerce.