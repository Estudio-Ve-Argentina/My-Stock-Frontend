# My-Stock API - Documentacion de Endpoints

Backend Spring Boot 3.4.5 con Java 17. Autenticacion JWT + OAuth2 (Google). Refresh tokens para renovacion de sesion.

**Base URL:** `http://localhost:8080`

---

## Autenticacion

Todas las rutas requieren autenticacion excepto las marcadas como PUBLIC.
El token JWT (access token) se envia en el header: `Authorization: Bearer <token>`

### Tokens

| Token | Duracion | Donde se guarda | Se puede invalidar |
|-------|----------|-----------------|-------------------|
| Access token (JWT) | 30 minutos | Frontend (memoria/localStorage) | No (expira solo) |
| Refresh token (UUID) | 7 dias | BD (tabla refresh_token) + Frontend | Si (borrando de BD) |

**Flujo de renovacion:**
1. El access token expira, backend devuelve 401
2. Frontend envia el refresh token a `POST /auth/refresh`
3. Backend valida el refresh token contra BD y genera un nuevo access token
4. Si el refresh token no existe o expiro, el usuario debe loguearse de nuevo

### Roles disponibles

| Rol     | Descripcion                                                                 |
|---------|-----------------------------------------------------------------------------|
| `ADMIN` | Acceso total. Panel de administracion, gestionar planes, crear usuarios, ver todos los usuarios. |
| `USER`  | Usuario de la aplicacion. Gestiona **sus propios** productos segun su plan. |
| `GUEST` | Solo puede registrarse, loguearse, ver el front y consultar planes.         |

### Planes disponibles

| Plan          | Max Productos | Precio | durationDays | Expira |
|---------------|---------------|--------|--------------|--------|
| `FREE`        | 10            | $0     | 0            | Nunca (`planExpiresAt: null`) |
| `PRO_MONTHLY` | 120           | $6     | 30           | 30 dias desde activacion |
| `PRO_ANNUAL`  | 120           | $48    | 365          | 365 dias desde activacion |

Al registrarse (signup o OAuth2) se asigna automaticamente el rol `USER` y el plan configurado en `app.default-plan` (por defecto `FREE`).

### Suscripcion y vencimiento de planes

- **Plan FREE:** permanente, no tiene fecha de vencimiento.
- **Plan PRO_MONTHLY:** `planExpiresAt` se setea a 30 dias desde la activacion. Al vencer:
  - Si `autoRenew = true`: se renueva automaticamente 30 dias mas.
  - Si `autoRenew = false`: se baja automaticamente a FREE y se congelan productos excedentes.
- **Plan PRO_ANNUAL:** `planExpiresAt` se setea a 365 dias desde la activacion. Misma logica de renovacion.
- La verificacion de vencimiento es **lazy** (se ejecuta al consultar/operar sobre el usuario), no hay cron.

### Productos activos e inactivos

Cuando un usuario baja de plan y tiene mas productos de los permitidos, los productos excedentes se **congelan** (`active: false`). Los productos inactivos:

- Se pueden **ver** y **eliminar**, pero NO modificar ni cambiar stock.
- Se desactivan los **mas viejos** primero (se mantienen los mas nuevos).
- Se reactivan automaticamente al subir de plan o al eliminar un producto activo (si hay espacio).
- El limite del plan se compara contra **productos activos solamente**.

### Validacion de ownership

Todas las operaciones (lectura y escritura) validan que el usuario autenticado sea el duenio del recurso. Un `USER` solo puede ver y operar sobre sus propios productos, movimientos de stock y su propia cuenta. `ADMIN` puede operar sobre cualquier recurso. Intentar acceder a un recurso ajeno retorna **403**.

### Rate limiting

Los endpoints publicos `/auth/login`, `/auth/signup` y `/auth/refresh` tienen rate limiting: **10 requests por minuto por IP**. Si se excede, retorna **429 Too Many Requests**.

### CORS

Configurado para permitir requests desde `app.frontend.url` (default `http://localhost:5173`).

### Paginacion

El tamanio maximo de pagina es **50**. Si se envia `size` mayor, se recorta automaticamente.

---

## Auth Controller — `/auth`

### POST `/auth/login` — PUBLIC

Iniciar sesion.

**Request Body:**

```json
{
  "username": "string (requerido)",
  "password": "string (requerido)"
}
```

**Response 200:**

```json
{
  "username": "string",
  "message": "string",
  "jwtToken": "string",
  "refreshToken": "string",
  "status": true
}
```

---

### POST `/auth/signup` — PUBLIC

Registrar nuevo usuario. Se asigna rol `USER` y plan por defecto automaticamente.

**Request Body:**

```json
{
  "username": "string (requerido)",
  "password": "string (requerido)",
  "name": "string",
  "lastname": "string"
}
```

**Response 200:**

```json
{
  "username": "string",
  "message": "string",
  "jwtToken": "string",
  "refreshToken": "string",
  "status": true
}
```

---

### GET `/auth/me` — AUTH (cualquier rol)

Obtener datos del usuario autenticado. Requiere header `Authorization: Bearer <token>`.

**Response 200:**

```json
{
  "id": 1,
  "name": "string",
  "lastName": "string",
  "username": "string",
  "planName": "FREE",
  "maxProducts": 10,
  "roles": ["USER"]
}
```

---

### POST `/auth/refresh` — PUBLIC

Renovar el access token usando un refresh token valido. No requiere autenticacion (el access token ya expiro cuando se usa este endpoint).

**Query Params:**

| Param          | Tipo   | Requerido | Descripcion          |
|----------------|--------|-----------|----------------------|
| `refreshToken` | String | Si        | El refresh token     |

**Response 200:**

```json
{
  "username": "string",
  "message": "Token refreshed",
  "jwtToken": "string (nuevo access token)",
  "refreshToken": "string (mismo refresh token)",
  "status": true
}
```

**Response 404:** Si el refresh token no existe o expiro.

---

### POST `/auth/logout` — USER / ADMIN

Cerrar sesion. Borra el refresh token de BD (solo esa sesion/dispositivo).

**Query Params:**

| Param          | Tipo   | Requerido | Descripcion          |
|----------------|--------|-----------|----------------------|
| `refreshToken` | String | Si        | El refresh token     |

**Response 204:** No Content

---

### OAuth2 (Google)

**Flujo:**

1. El front redirige al usuario a `GET /oauth2/authorization/google`
2. Google autentica y redirige al backend
3. El backend genera un access token + refresh token, los guarda en un store temporal asociados a un codigo de un solo uso
4. El backend redirige al front: `{app.frontend.url}/oauth2/success?code=<uuid>`
5. El front hace `POST /auth/oauth2/exchange?code=<uuid>`
6. El backend consume el codigo y devuelve ambos tokens en el body

**POST `/auth/oauth2/exchange`** — PUBLIC

**Query Params:**

| Param  | Tipo   | Requerido | Descripcion                      |
|--------|--------|-----------|----------------------------------|
| `code` | String | Si        | Codigo de un solo uso (UUID)     |

**Response 200:**

```json
{
  "username": "oauth2",
  "message": "Login exitoso",
  "jwtToken": "string",
  "refreshToken": "string",
  "status": true
}
```

**Response 401:** Si el codigo es invalido o expiro (30 segundos de vida, un solo uso).

**Configuracion backend:**

```properties
app.frontend.url=http://localhost:5173
```

---

## Plan Controller — `/api/plans`

### GET `/api/plans` — PUBLIC

Listar todos los planes disponibles.

**Response 200:**

```json
[
  { "id": 1, "name": "FREE", "maxProducts": 10, "price": 0, "durationDays": 0 },
  { "id": 2, "name": "PRO_MONTHLY", "maxProducts": 120, "price": 6.00, "durationDays": 30 },
  { "id": 3, "name": "PRO_ANNUAL", "maxProducts": 120, "price": 48.00, "durationDays": 365 }
]
```

---

### GET `/api/plans/{id}` — PUBLIC

Obtener un plan por ID.

**Path Params:**

| Param | Tipo | Descripcion   |
|-------|------|---------------|
| `id`  | Long | ID del plan   |

**Response 200:**

```json
{
  "id": 1,
  "name": "FREE",
  "maxProducts": 10,
  "price": 0,
  "durationDays": 0
}
```

---

### POST `/api/plans` — ADMIN

Crear un nuevo plan.

**Request Body:**

```json
{
  "name": "string (requerido)",
  "maxProducts": 50,
  "price": 9.99,
  "durationDays": 30
}
```

**Validaciones:**

- `name`: no puede estar vacio
- `maxProducts`: minimo 1
- `price`: requerido, minimo 0

**Response 201:**

```json
{
  "id": 3,
  "name": "string",
  "maxProducts": 50,
  "price": 9.99
}
```

---

### PUT `/api/plans/{id}` — ADMIN

Actualizar un plan completo.

**Path Params:**

| Param | Tipo | Descripcion   |
|-------|------|---------------|
| `id`  | Long | ID del plan   |

**Request Body:** Mismo formato que POST.

**Response 200:** `PlanResponse`

---

### DELETE `/api/plans/{id}` — ADMIN

Eliminar un plan.

**Path Params:**

| Param | Tipo | Descripcion   |
|-------|------|---------------|
| `id`  | Long | ID del plan   |

**Response 204:** No Content

---

## Category Controller — `/api/categories`

> Requiere rol `USER` o `ADMIN`. Un `USER` solo ve y opera sobre sus propias categorías.

### GET `/api/categories` — USER / ADMIN

Listar las categorías del usuario autenticado.

**Response 200:** `List<CategoryResponse>`

```json
[
  { "id": 1, "name": "Bebidas" },
  { "id": 2, "name": "Electrónica" }
]
```

---

### POST `/api/categories` — USER / ADMIN

Crear una categoría. Constraint único en `(name, user_id)`.

**Request Body:**

```json
{
  "name": "string (requerido)"
}
```

**Response 201:** `CategoryResponse`

---

### PUT `/api/categories/{id}` — USER / ADMIN

Renombrar una categoría.

**Path Params:**

| Param | Tipo | Descripción        |
|-------|------|--------------------|
| `id`  | Long | ID de la categoría |

**Request Body:**

```json
{
  "name": "string (requerido)"
}
```

**Response 200:** `CategoryResponse`

---

### DELETE `/api/categories/{id}` — USER / ADMIN

Eliminar una categoría. Los productos de esa categoría quedan sin categoría (no se borran).

**Path Params:**

| Param | Tipo | Descripción        |
|-------|------|--------------------|
| `id`  | Long | ID de la categoría |

**Response 204:** No Content

---

## Product Controller — `/api/products`

> Requiere rol `USER` o `ADMIN`. El rol `GUEST` no tiene acceso.
>
> **Ownership:** Un `USER` solo puede ver y operar sobre **sus propios** productos. El `userId` en el body de POST debe coincidir con el usuario autenticado. `ADMIN` puede operar sobre cualquier producto.
>
> **Limite de plan:** Al crear un producto se valida el limite del plan (solo cuenta productos activos). Si se excede o el usuario no tiene plan, retorna **403**.
>
> **Productos inactivos:** Los endpoints PUT, PATCH y PATCH stock rechazan operaciones sobre productos inactivos con **403**. Los productos inactivos se pueden ver (GET) y eliminar (DELETE).

### GET `/api/products` — USER / ADMIN

Listar productos paginados. Un USER solo ve sus propios productos. ADMIN ve todos o filtra por `userId`.

**Query Params:**

| Param        | Tipo   | Requerido | Descripcion                              |
|--------------|--------|-----------|------------------------------------------|
| `userId`     | Long   | No        | Filtrar por ID de usuario (ADMIN only)   |
| `categoryId` | Long   | No        | Filtrar por categoría                    |
| `page`       | int    | No        | Numero de pagina (default 0)             |
| `size`       | int    | No        | Tamanio de pagina (default 10, max 50)   |
| `sort`       | String | No        | Campo y direccion de orden               |

**Response 200:** `Page<ProductResponse>`

```json
{
  "content": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "createdAt": "2025-01-01T00:00:00",
      "stock": 0,
      "active": true,
      "minStock": 5,
      "lowStock": false,
      "categoryId": 2,
      "categoryName": "Electrónica",
      "userId": 1,
      "user": "string"
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 10
}
```

---

### GET `/api/products/by-username/{username}` — USER / ADMIN

Listar productos de un usuario por su username. Un USER solo puede consultar sus propios productos.

**Path Params:**

| Param      | Tipo   | Descripcion          |
|------------|--------|----------------------|
| `username` | String | Username del usuario |

**Query Params:**

| Param  | Tipo   | Requerido | Descripcion  |
|--------|--------|-----------|--------------|
| `sort` | String | No        | Ordenamiento |

**Response 200:** `List<ProductResponse>`

**Response 403:** Si un USER intenta ver productos de otro usuario.

---

### GET `/api/products/{id}` — USER / ADMIN

Obtener un producto por ID. Un USER solo puede ver sus propios productos.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Response 200:** `ProductResponse`

**Response 403:** Si el producto no pertenece al usuario autenticado.

---

### POST `/api/products` — USER / ADMIN (solo propios)

Crear un nuevo producto. El `userId` debe coincidir con el usuario autenticado (ADMIN puede crear para cualquier usuario). La fecha de creacion se asigna automaticamente en el backend.

**Request Body:**

```json
{
  "name": "string (requerido)",
  "description": "string (requerido, 10-150 chars)",
  "stock": 0,
  "userId": 1,
  "categoryId": null,
  "minStock": 0
}
```

**Validaciones:**

- `name`: no puede estar vacio
- `description`: no puede estar vacio, entre 10 y 150 caracteres
- `stock`: minimo 0
- `userId`: requerido, debe coincidir con el usuario autenticado (excepto ADMIN)
- `categoryId`: opcional, nullable. Valida ownership de la categoría.
- `minStock`: opcional, default 0. Si `minStock > 0 && stock <= minStock`, `lowStock` se calcula como `true` en la respuesta.

**Response 201:** `ProductResponse`

**Response 403:**
- Si el `userId` no coincide con el usuario autenticado
- Si se excede el limite del plan
- Si el usuario no tiene plan asignado

---

### PUT `/api/products/{id}` — USER / ADMIN (solo propios)

Actualizar un producto completo. Solo el duenio o ADMIN. Rechaza productos inactivos.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Request Body:** Mismo formato que POST.

**Response 200:** `ProductResponse`

**Response 403:** Si el producto no pertenece al usuario autenticado o si el producto esta inactivo.

---

### PATCH `/api/products/{id}` — USER / ADMIN (solo propios)

Actualizar solo la descripcion de un producto. Solo el duenio o ADMIN. Rechaza productos inactivos.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Request Body:**

```json
{
  "description": "string (requerido, 10-150 chars)"
}
```

**Response 200:** `ProductResponse`

**Response 403:** Si el producto no pertenece al usuario autenticado o si el producto esta inactivo.

---

### PATCH `/api/products/{id}/stock` — USER / ADMIN (solo propios)

Actualizar el stock de un producto. Acepta valores negativos para restar. Solo el duenio o ADMIN. Rechaza productos inactivos. **Cada cambio de stock se registra automaticamente en el historial de movimientos.** Operacion transaccional: si el registro del movimiento falla, el cambio de stock se revierte.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Request Body:**

```json
{
  "quantity": 10
}
```

**Validaciones:**

- `quantity`: requerido, entre -99999 y 99999

**Response 200:** `ProductResponse`

**Response 400:** Si el stock resultante seria negativo.

**Response 403:** Si el producto no pertenece al usuario autenticado o si el producto esta inactivo.

---

### DELETE `/api/products/{id}` — USER / ADMIN (solo propios)

Eliminar un producto (activo o inactivo). Solo el duenio o ADMIN. Si se elimina un producto activo y hay productos inactivos, se reactiva uno automaticamente.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Response 204:** No Content

**Response 403:** Si el producto no pertenece al usuario autenticado.

---

## Stock Movement Controller — `/api/stock-movements`

> Requiere rol `USER` o `ADMIN`. Historial de movimientos. Se genera automaticamente en cada operacion sobre productos (crear, modificar, cambiar stock, eliminar).
>
> **Ownership:** Un `USER` solo puede ver movimientos de sus propios productos. `ADMIN` puede ver todos.

### GET `/api/stock-movements/user/{userId}` — USER / ADMIN

Listar movimientos de stock de un usuario, ordenados por fecha descendente. Un USER solo puede consultar sus propios movimientos.

**Path Params:**

| Param    | Tipo | Descripcion    |
|----------|------|----------------|
| `userId` | Long | ID del usuario |

**Query Params:**

| Param  | Tipo   | Requerido | Descripcion                     |
|--------|--------|-----------|---------------------------------|
| `page` | int    | No        | Numero de pagina (default 0)    |
| `size` | int    | No        | Tamanio de pagina (default 20, max 50)  |

**Response 200:** `Page<StockMovementResponse>`

```json
{
  "content": [
    {
      "id": 1,
      "productName": "Laptop HP 15",
      "productId": 1,
      "quantity": 5,
      "movementType": "STOCK_UPDATE",
      "createdAt": "2025-06-21T14:30:00"
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 20
}
```

**Tipos de movimiento (`movementType`):**

| Tipo | Cuando se genera | Valor de `quantity` |
|------|-----------------|---------------------|
| `STOCK_UPDATE` | `PATCH /api/products/{id}/stock` | Delta del cambio (+5, -3, etc.) |
| `PRODUCT_CREATED` | `POST /api/products` | Stock inicial del producto |
| `PRODUCT_MODIFIED` | `PUT /api/products/{id}` o `PATCH /api/products/{id}` | Delta del stock (0 si solo cambio nombre/descripcion) |
| `PRODUCT_DELETED` | `DELETE /api/products/{id}` | 0 |

> **Nota:** `productId` sera `null` en movimientos de productos que fueron eliminados.

**Response 403:** Si un USER intenta ver movimientos de otro usuario.

---

### GET `/api/stock-movements/product/{productId}` — USER / ADMIN

Listar movimientos de stock de un producto especifico, ordenados por fecha descendente. Un USER solo puede ver movimientos de sus propios productos.

**Path Params:**

| Param       | Tipo | Descripcion     |
|-------------|------|-----------------|
| `productId` | Long | ID del producto |

**Query Params:**

| Param  | Tipo   | Requerido | Descripcion                     |
|--------|--------|-----------|---------------------------------|
| `page` | int    | No        | Numero de pagina (default 0)    |
| `size` | int    | No        | Tamanio de pagina (default 20, max 50)  |

**Response 200:** `Page<StockMovementResponse>`

**Response 403:** Si el producto no pertenece al usuario autenticado.

---

### GET `/api/stock-movements/user/{userId}/dates` — USER / ADMIN

Listar movimientos de stock de un usuario filtrados por rango de fechas.

**Path Params:**

| Param    | Tipo | Descripcion    |
|----------|------|----------------|
| `userId` | Long | ID del usuario |

**Query Params:**

| Param  | Tipo       | Requerido | Descripcion                          |
|--------|------------|-----------|--------------------------------------|
| `from` | LocalDate  | Si        | Fecha inicio (formato `YYYY-MM-DD`)  |
| `to`   | LocalDate  | Si        | Fecha fin (formato `YYYY-MM-DD`)     |
| `page` | int        | No        | Numero de pagina (default 0)         |
| `size` | int        | No        | Tamanio de pagina (default 20, max 50)       |

**Ejemplo:** `GET /api/stock-movements/user/1/dates?from=2025-06-01&to=2025-06-30`

**Response 200:** `Page<StockMovementResponse>`

**Response 403:** Si un USER intenta ver movimientos de otro usuario.

---

## User Controller — `/api/user`

> **Ownership:** Un `USER` solo puede ver y modificar **su propia cuenta**. `ADMIN` puede ver y modificar cualquier usuario. Intentar acceder a otro usuario retorna **403**.

### GET `/api/user` — ADMIN

Listar usuarios paginados. Opcionalmente filtrar por `username`.

**Query Params:**

| Param      | Tipo   | Requerido | Descripcion          |
|------------|--------|-----------|----------------------|
| `username` | String | No        | Filtrar por username |
| `page`     | int    | No        | Numero de pagina     |
| `size`     | int    | No        | Tamanio de pagina (max 50) |

**Response 200:** `Page<UserEntityResponse>`

```json
{
  "content": [
    {
      "name": "string",
      "lastName": "string",
      "username": "string",
      "planName": "FREE",
      "planExpiresAt": null,
      "autoRenew": true
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 20
}
```

---

### GET `/api/user/{id}` — USER / ADMIN

Obtener un usuario por ID. Un USER solo puede ver su propia cuenta.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Response 200:**

```json
{
  "name": "string",
  "lastName": "string",
  "username": "string",
  "planName": "FREE",
  "planExpiresAt": null,
  "autoRenew": true
}
```

**Response 403:** Si un USER intenta ver otro usuario.

---

### POST `/api/user/save` — ADMIN

Crear un nuevo usuario (uso administrativo). Se asigna plan por defecto. Los usuarios se registran a si mismos via `/auth/signup`.

**Request Body:**

```json
{
  "name": "string (3-50 chars)",
  "lastName": "string (requerido)",
  "username": "string (requerido)",
  "password": "string (requerido, min 6 chars)"
}
```

**Response 201:** `UserEntityResponse`

---

### PUT `/api/user/{id}` — USER (solo propio) / ADMIN

Actualizar un usuario completo. Un USER solo puede actualizar su propia cuenta.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Request Body:** Mismo formato que POST.

**Response 200:** `UserEntityResponse`

**Response 403:** Si intenta modificar otro usuario.

---

### PATCH `/api/user/{id}` — USER (solo propio) / ADMIN

Actualizar solo el apellido de un usuario. Un USER solo puede actualizar su propia cuenta.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Request Body:**

```json
{
  "name": "string (requerido)"
}
```

**Response 200:** `UserEntityResponse`

**Response 403:** Si intenta modificar otro usuario.

---

### PATCH `/api/user/{id}/plan` — USER (solo propio) / ADMIN

Cambiar el plan de un usuario. Un USER solo puede cambiar su propio plan. Al cambiar:

- **A plan PRO_MONTHLY:** setea `planExpiresAt = now + 30 dias`, `autoRenew = true`. Reactiva productos inactivos hasta el nuevo limite.
- **A plan PRO_ANNUAL:** setea `planExpiresAt = now + 365 dias`, `autoRenew = true`. Reactiva productos inactivos hasta el nuevo limite.
- **A plan FREE:** setea `planExpiresAt = null`. Congela productos que excedan el limite de 10.
- **Al mismo plan:** retorna **400** `"User is already on plan 'X'"`.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Request Body:**

```json
{
  "planId": 2
}
```

**Response 200:**

```json
{
  "name": "string",
  "lastName": "string",
  "username": "string",
  "planName": "PRO_MONTHLY",
  "planExpiresAt": "2026-07-24T14:30:00",
  "autoRenew": true
}
```

**Response 400:** Si intenta cambiar al mismo plan que ya tiene.

**Response 403:** Si intenta cambiar el plan de otro usuario.

---

### PATCH `/api/user/{id}/plan/cancel` — USER (solo propio) / ADMIN

Cancelar la renovacion del plan. Pone `autoRenew = false`. El plan sigue activo hasta que venza `planExpiresAt`. Si el plan ya vencio, se procesa el vencimiento primero (downgrade a FREE) y luego se rechaza. No requiere body.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Response 200:**

```json
{
  "name": "string",
  "lastName": "string",
  "username": "string",
  "planName": "PRO_MONTHLY",
  "planExpiresAt": "2026-07-24T14:30:00",
  "autoRenew": false
}
```

**Response 400:** `"Cannot cancel a free plan"`.

**Response 403:** Si intenta cancelar el plan de otro usuario.

---

### DELETE `/api/user/{id}` — USER (solo propio) / ADMIN

Eliminar un usuario. Un USER solo puede eliminar su propia cuenta.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Response 204:** No Content

**Response 403:** Si intenta eliminar otro usuario.

---

## Datos de prueba (DataLoader)

El backend carga datos iniciales al arrancar:

**Planes:**

| ID | Nombre        | Max Productos | Precio | durationDays |
|----|---------------|---------------|--------|--------------|
| 1  | FREE          | 10            | $0     | 0            |
| 2  | PRO_MONTHLY   | 120           | $6     | 30           |
| 3  | PRO_ANNUAL    | 120           | $48    | 365          |

**Usuarios:**

| Username  | Password  | Roles        | Plan         | planExpiresAt | autoRenew |
|-----------|-----------|--------------|--------------|---------------|-----------|
| `roque_f` | admin123  | ADMIN, USER  | PRO_MONTHLY  | now + 30 dias | true |
| `juan_p`  | user123   | USER         | FREE         | null          | true |
| `maria_l` | user123   | USER         | PRO_ANNUAL   | now + 365 dias | true |

Cada usuario tiene 6 productos de ejemplo.

---

## Resumen de endpoints

| Controlador | Metodo | Ruta                                          | Acceso              | Ownership   |
|-------------|--------|-----------------------------------------------|---------------------|-------------|
| Auth        | POST   | `/auth/login`                                 | PUBLIC              | -           |
| Auth        | POST   | `/auth/signup`                                | PUBLIC              | -           |
| Auth        | GET    | `/auth/me`                                    | AUTH (todos)        | -           |
| Auth        | POST   | `/auth/refresh`                               | PUBLIC              | -           |
| Auth        | POST   | `/auth/logout`                                | USER / ADMIN        | -           |
| Auth        | POST   | `/auth/oauth2/exchange`                       | PUBLIC              | -           |
| Plan        | GET    | `/api/plans`                                  | PUBLIC              | -           |
| Plan        | GET    | `/api/plans/{id}`                             | PUBLIC              | -           |
| Plan        | POST   | `/api/plans`                                  | ADMIN               | -           |
| Plan        | PUT    | `/api/plans/{id}`                             | ADMIN               | -           |
| Plan        | DELETE | `/api/plans/{id}`                             | ADMIN               | -           |
| Category    | GET    | `/api/categories`                             | USER / ADMIN        | Si          |
| Category    | POST   | `/api/categories`                             | USER / ADMIN        | Si          |
| Category    | PUT    | `/api/categories/{id}`                        | USER / ADMIN        | Si          |
| Category    | DELETE | `/api/categories/{id}`                        | USER / ADMIN        | Si          |
| Product     | GET    | `/api/products`                               | USER / ADMIN        | Si          |
| Product     | GET    | `/api/products/by-username/{username}`         | USER / ADMIN        | Si          |
| Product     | GET    | `/api/products/{id}`                          | USER / ADMIN        | Si          |
| Product     | POST   | `/api/products`                               | USER / ADMIN        | Si          |
| Product     | PUT    | `/api/products/{id}`                          | USER / ADMIN        | Si          |
| Product     | PATCH  | `/api/products/{id}`                          | USER / ADMIN        | Si          |
| Product     | PATCH  | `/api/products/{id}/stock`                    | USER / ADMIN        | Si          |
| Product     | DELETE | `/api/products/{id}`                          | USER / ADMIN        | Si          |
| StockMov    | GET    | `/api/stock-movements/user/{userId}`          | USER / ADMIN        | Si          |
| StockMov    | GET    | `/api/stock-movements/product/{prodId}`       | USER / ADMIN        | Si          |
| StockMov    | GET    | `/api/stock-movements/user/{userId}/dates`    | USER / ADMIN        | Si          |
| User        | GET    | `/api/user`                                   | ADMIN               | -           |
| User        | GET    | `/api/user/{id}`                              | USER / ADMIN        | Si          |
| User        | POST   | `/api/user/save`                              | ADMIN               | -           |
| User        | PUT    | `/api/user/{id}`                              | USER / ADMIN        | Si          |
| User        | PATCH  | `/api/user/{id}`                              | USER / ADMIN        | Si          |
| User        | PATCH  | `/api/user/{id}/plan`                         | USER / ADMIN        | Si          |
| User        | PATCH  | `/api/user/{id}/plan/cancel`                  | USER / ADMIN        | Si          |
| User        | DELETE | `/api/user/{id}`                              | USER / ADMIN        | Si          |

**Total: 34 endpoints** (6 publicos, 22 USER/ADMIN, 5 solo ADMIN, 1 AUTH general)

**Ownership = Si:** El usuario solo puede operar sobre sus propios recursos. ADMIN puede operar sobre cualquiera.

## Codigos de error comunes

| Codigo | Descripcion                                                    |
|--------|----------------------------------------------------------------|
| 400    | Validacion fallida (retorna mapa campo:error) / Stock insuficiente / Cancelar plan FREE / Cambiar al mismo plan |
| 401    | No autenticado (falta token o token invalido/expirado)         |
| 403    | Sin permisos / Ownership violation / Limite de productos / Producto inactivo |
| 404    | Recurso no encontrado / Refresh token invalido o expirado      |
| 429    | Rate limit excedido (max 10 req/min por IP en auth endpoints)  |
| 500    | Error interno (sin detalles expuestos)                         |
