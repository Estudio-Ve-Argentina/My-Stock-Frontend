import type {
  AuthResponse,
  Movement,
  ProductRequest,
  ProductResponse,
} from "@/config/site.types";
import type { LoginInput, SignupInput } from "./auth";

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
  return Promise.resolve(authResponse(input.username));
}

export function mockSignup(input: SignupInput): Promise<AuthResponse> {
  return Promise.resolve(authResponse(input.username));
}

const STORE_PREFIX = "mystock_mock_products_";

function storeKey(userId: number): string {
  return `${STORE_PREFIX}${userId}`;
}

function readStore(userId: number): ProductResponse[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(storeKey(userId));
  return raw ? (JSON.parse(raw) as ProductResponse[]) : [];
}

function writeStore(userId: number, products: ProductResponse[]): void {
  window.localStorage.setItem(storeKey(userId), JSON.stringify(products));
}

export function mockListProducts(username: string): Promise<ProductResponse[]> {
  return Promise.resolve(readStore(stableId(username)));
}

export function mockCreateProduct(
  input: ProductRequest,
): Promise<ProductResponse> {
  const products = readStore(input.userId);
  const nextId =
    products.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const created: ProductResponse = { ...input, id: nextId, user: "", createdAt: new Date().toISOString() };
  writeStore(input.userId, [created, ...products]);
  addMockMovement({ productName: input.name, type: "created", quantity: 0 });
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
  name: string,
  description: string,
): Promise<ProductResponse> {
  const found = findStore(id);
  if (!found) {
    return Promise.reject(new Error("Product not found"));
  }
  const target = found.products.find((item) => item.id === id)!;
  target.name = name;
  target.description = description;
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
      });
    }
  }
  return Promise.resolve();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const MOVEMENTS_KEY = "mystock_mock_movements";

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
  { id: 1, productName: "Café molido 500g", type: "increased", quantity: 12, at: hoursAgo(1) },
  { id: 2, productName: "Yerba 1kg", type: "decreased", quantity: 3, at: hoursAgo(3) },
  { id: 3, productName: "Azúcar 1kg", type: "created", quantity: 0, at: hoursAgo(5) },
  { id: 4, productName: "Galletitas", type: "decreased", quantity: 6, at: hoursAgo(26) },
  { id: 5, productName: "Té en saquitos", type: "deleted", quantity: 0, at: hoursAgo(28) },
  { id: 6, productName: "Harina 000 1kg", type: "increased", quantity: 20, at: hoursAgo(30) },
];

export function mockListMovements(): Promise<Movement[]> {
  const stored = readMovements();
  return Promise.resolve([...stored, ...SAMPLE_MOVEMENTS]);
}
