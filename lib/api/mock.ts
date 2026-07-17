import type {
  AuthResponse,
  CategoryRequest,
  CategoryResponse,
  Movement,
  ProductRequest,
  ProductResponse,
} from "@/config/site.types";
import type { LoginInput, SignupInput } from "./auth";
import type { UpdateProductInput } from "./products";

export function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

function base64url(value: object): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stableId(username: string): number {
  let hash = 0;
  for (let index = 0; index < username.length; index += 1) {
    hash = (hash * 31 + username.charCodeAt(index)) % 100000;
  }
  return hash + 1;
}

function createMockToken(username: string): string {
  const header = base64url({ alg: "none", typ: "JWT" });
  const payload = base64url({
    sub: username,
    username,
    userId: stableId(username),
    roles: ["USER"],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  });
  return `${header}.${payload}.mock`;
}

function authResponse(username: string): AuthResponse {
  return {
    username,
    message: "ok",
    jwtToken: createMockToken(username),
    refreshToken: `mock-refresh-${username}`,
    status: true,
  };
}

export function mockLogin(input: LoginInput): Promise<AuthResponse> {
  return Promise.resolve(authResponse(input.email));
}

export function mockSignup(input: SignupInput): Promise<AuthResponse> {
  return Promise.resolve(authResponse(input.email));
}

const STORE_PREFIX = "stockeo_mock_products_";

function storeKey(userId: number): string {
  return `${STORE_PREFIX}${userId}`;
}

function readStore(userId: number): ProductResponse[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(storeKey(userId));
  if (!raw) return [];
  return (JSON.parse(raw) as ProductResponse[]).map((p) => ({
    ...p,
    active: p.active ?? true,
  }));
}

function writeStore(userId: number, products: ProductResponse[]): void {
  window.localStorage.setItem(storeKey(userId), JSON.stringify(products));
}

function seedProducts(userId: number): ProductResponse[] {
  const base = { userId, active: true, user: "", categoryId: null, categoryName: null, supplierId: null, supplierName: null, branchStocks: [] };
  const seed: ProductResponse[] = [
    { ...base, id: 1, name: "Café molido 500g", description: "Café tostado premium molido fino", stock: 24, createdAt: hoursAgo(48), minStock: 5, lowStock: false, pinned: true },
    { ...base, id: 2, name: "Yerba 1kg", description: "Yerba mate tradicional con palo", stock: 8, createdAt: hoursAgo(72), minStock: 10, lowStock: true, pinned: false },
    { ...base, id: 3, name: "Azúcar 1kg", description: "Azúcar blanca refinada", stock: 15, createdAt: hoursAgo(5), minStock: 0, lowStock: false, pinned: false },
    { ...base, id: 4, name: "Galletitas", description: "Galletitas de agua clásicas x3", stock: 2, createdAt: hoursAgo(96), minStock: 5, lowStock: true, pinned: false },
    { ...base, id: 5, name: "Harina 000 1kg", description: "Harina de trigo triple cero", stock: 30, createdAt: hoursAgo(120), minStock: 0, lowStock: false, pinned: false },
  ];
  writeStore(userId, seed);
  return seed;
}

export function mockListProducts(username: string): Promise<ProductResponse[]> {
  const userId = stableId(username);
  if (typeof window !== "undefined" && window.localStorage.getItem(storeKey(userId)) === null) {
    return Promise.resolve(seedProducts(userId));
  }
  return Promise.resolve(readStore(userId));
}

export function mockCreateProduct(
  input: ProductRequest,
): Promise<ProductResponse> {
  const products = readStore(input.userId);
  const nextId =
    products.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const minStock = input.minStock ?? 0;
  const categoryName = input.categoryId
    ? readMockCategories().find((c) => c.id === input.categoryId)?.name ?? null
    : null;
  const created: ProductResponse = {
    ...input,
    id: nextId,
    active: true,
    pinned: false,
    user: "",
    createdAt: new Date().toISOString(),
    minStock,
    lowStock: minStock > 0 && input.stock <= minStock,
    categoryId: input.categoryId ?? null,
    categoryName,
    supplierId: input.supplierId ?? null,
    supplierName: null,
    branchStocks: [],
  };
  writeStore(input.userId, [created, ...products]);
  addMockMovement({ productName: input.name, type: "created", quantity: 0, reason: null, branchName: null });
  return Promise.resolve(created);
}

function findStore(id: number): { userId: number; products: ProductResponse[] } | null {
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(STORE_PREFIX)) {
      continue;
    }
    const userId = Number(key.slice(STORE_PREFIX.length));
    const products = readStore(userId);
    if (products.some((item) => item.id === id)) {
      return { userId, products };
    }
  }
  return null;
}

export function mockUpdateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<ProductResponse> {
  const found = findStore(id);
  if (!found) {
    return Promise.reject(new Error("Product not found"));
  }
  const target = found.products.find((item) => item.id === id)!;
  target.name = input.name;
  target.description = input.description;
  target.minStock = input.minStock ?? target.minStock ?? 0;
  target.lowStock =
    target.minStock > 0 && target.stock <= target.minStock;
  target.categoryId = input.categoryId ?? null;
  target.categoryName = target.categoryId
    ? readMockCategories().find((c) => c.id === target.categoryId)?.name ?? null
    : null;
  writeStore(found.userId, found.products);
  return Promise.resolve(target);
}

export function mockUpdateStock(
  id: number,
  quantity: number,
): Promise<ProductResponse> {
  const found = findStore(id);
  if (!found) {
    return Promise.reject(new Error("Product not found"));
  }
  const target = found.products.find((item) => item.id === id)!;
  target.stock = Math.max(0, target.stock + quantity);
  writeStore(found.userId, found.products);
  addMockMovement({
    productName: target.name,
    type: quantity > 0 ? "increased" : "decreased",
    quantity: Math.abs(quantity),
    reason: null,
    branchName: null,
  });
  return Promise.resolve(target);
}

export function mockDeleteProduct(id: number): Promise<void> {
  const found = findStore(id);
  if (found) {
    const target = found.products.find((item) => item.id === id);
    writeStore(
      found.userId,
      found.products.filter((item) => item.id !== id),
    );
    if (target) {
      addMockMovement({
        productName: target.name,
        type: "deleted",
        quantity: 0,
        reason: null,
        branchName: null,
      });
    }
  }
  return Promise.resolve();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const MOVEMENTS_KEY = "stockeo_mock_movements";

function readMovements(): Movement[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(MOVEMENTS_KEY);
  return raw ? (JSON.parse(raw) as Movement[]) : [];
}

function writeMovements(movements: Movement[]): void {
  window.localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
}

function addMockMovement(partial: Omit<Movement, "id" | "at">): void {
  const stored = readMovements();
  const nextId = stored.reduce((max, m) => Math.max(max, m.id), 100) + 1;
  stored.unshift({ ...partial, id: nextId, at: new Date().toISOString() });
  writeMovements(stored);
}

const SAMPLE_MOVEMENTS: Movement[] = [
  { id: 1, productName: "Café molido 500g", type: "increased", quantity: 12, at: hoursAgo(1), reason: null, branchName: null },
  { id: 2, productName: "Yerba 1kg", type: "decreased", quantity: 3, at: hoursAgo(3), reason: null, branchName: null },
  { id: 3, productName: "Azúcar 1kg", type: "created", quantity: 0, at: hoursAgo(5), reason: null, branchName: null },
  { id: 4, productName: "Galletitas", type: "decreased", quantity: 6, at: hoursAgo(26), reason: null, branchName: null },
  { id: 5, productName: "Té en saquitos", type: "deleted", quantity: 0, at: hoursAgo(28), reason: null, branchName: null },
  { id: 6, productName: "Harina 000 1kg", type: "increased", quantity: 20, at: hoursAgo(30), reason: null, branchName: null },
];

export function mockListMovements(): Promise<Movement[]> {
  const stored = readMovements();
  return Promise.resolve([...stored, ...SAMPLE_MOVEMENTS]);
}

const MOCK_CATEGORIES_KEY = "stockeo_mock_categories";

function readMockCategories(): CategoryResponse[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(MOCK_CATEGORIES_KEY);
  return raw ? (JSON.parse(raw) as CategoryResponse[]) : [];
}

function writeMockCategories(categories: CategoryResponse[]): void {
  window.localStorage.setItem(
    MOCK_CATEGORIES_KEY,
    JSON.stringify(categories),
  );
}

export function mockListCategories(): Promise<CategoryResponse[]> {
  return Promise.resolve(readMockCategories());
}

export function mockCreateCategory(
  input: CategoryRequest,
): Promise<CategoryResponse> {
  const categories = readMockCategories();
  const nextId =
    categories.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const created: CategoryResponse = { id: nextId, name: input.name };
  writeMockCategories([...categories, created]);
  return Promise.resolve(created);
}

export function mockRenameCategory(
  id: number,
  input: CategoryRequest,
): Promise<CategoryResponse> {
  const categories = readMockCategories();
  const target = categories.find((item) => item.id === id);
  if (!target) return Promise.reject(new Error("Category not found"));
  target.name = input.name;
  writeMockCategories(categories);
  return Promise.resolve(target);
}

export function mockDeleteCategory(id: number): Promise<void> {
  const categories = readMockCategories();
  writeMockCategories(categories.filter((item) => item.id !== id));
  return Promise.resolve();
}
