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
    products.reduce((max, item) => Math.max(max, item.id ?? 0), 0) + 1;
  const created: ProductResponse = { ...input, id: nextId, user: "" };
  writeStore(input.userId, [created, ...products]);
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
  return Promise.resolve(target);
}

export function mockDeleteProduct(id: number): Promise<void> {
  const found = findStore(id);
  if (found) {
    writeStore(
      found.userId,
      found.products.filter((item) => item.id !== id),
    );
  }
  return Promise.resolve();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const SAMPLE_MOVEMENTS: Movement[] = [
  { id: 1, productName: "Café molido 500g", type: "increased", quantity: 12, at: hoursAgo(1) },
  { id: 2, productName: "Yerba 1kg", type: "decreased", quantity: 3, at: hoursAgo(3) },
  { id: 3, productName: "Azúcar 1kg", type: "created", quantity: 0, at: hoursAgo(5) },
  { id: 4, productName: "Galletitas", type: "decreased", quantity: 6, at: hoursAgo(28) },
  { id: 5, productName: "Té en saquitos", type: "deleted", quantity: 0, at: hoursAgo(50) },
];

export function mockListMovements(): Promise<Movement[]> {
  return Promise.resolve(SAMPLE_MOVEMENTS);
}
