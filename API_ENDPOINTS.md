# My-Stock API - Documentacion de Endpoints

Backend Spring Boot 3.4.5 con Java 17. Autenticacion JWT + OAuth2 (Google).

**Base URL:** `http://localhost:8080`

---

## Autenticacion

Todas las rutas requieren autenticacion excepto las marcadas como PUBLIC.
El token JWT se envia en el header: `Authorization: Bearer <token>`

### Roles disponibles

- `ADMIN` - acceso total
- `USER` - acceso general
- `GUEST` - acceso limitado

---

## Auth Controller — `/auth`

### POST `/auth/login` — PUBLIC

Iniciar sesion.

**Request Body:**

```json
{
  "username": "string (requerido)",
  "password": "string"
}
```

**Response 200:**

```json
{
  "username": "string",
  "message": "string",
  "jwtToken": "string",
  "status": true
}
```

---

### POST `/auth/signup` — PUBLIC

Registrar nuevo usuario.

**Request Body:**

```json
{
  "username": "string (requerido)",
  "password": "string (requerido)",
  "name": "string",
  "lastname": "string",
  "roleEnum": "ADMIN | USER | GUEST (requerido)"
}
```

**Response 200:**

```json
{
  "username": "string",
  "message": "string",
  "jwtToken": "string",
  "status": true
}
```

---

### GET `/auth/oauth2/success` — PUBLIC

Callback tras login con OAuth2 (Google).

**Query Params:**

| Param   | Tipo   | Descripcion          |
|---------|--------|----------------------|
| `token` | String | Token JWT generado   |

**Response 200:**

```json
{
  "username": "string",
  "message": "string",
  "jwtToken": "string",
  "status": true
}
```

---

## Product Controller — `/api/products`

> Todos los endpoints requieren autenticacion.

### GET `/api/products` — AUTH

Listar productos paginados. Opcionalmente filtrar por `userId`.

**Query Params:**

| Param    | Tipo   | Requerido | Descripcion                |
|----------|--------|-----------|----------------------------|
| `userId` | Long   | No        | Filtrar por ID de usuario  |
| `page`   | int    | No        | Numero de pagina (default 0) |
| `size`   | int    | No        | Tamanio de pagina (default 20) |
| `sort`   | String | No        | Campo y direccion de orden |

**Response 200:** `Page<ProductResponse>`

```json
{
  "content": [
    {
      "name": "string",
      "description": "string",
      "createdAt": "2025-01-01T00:00:00",
      "stock": 0,
      "userId": 1,
      "user": "string"
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 20
}
```

---

### GET `/api/products/by-username/{username}` — AUTH

Listar productos de un usuario por su username.

**Path Params:**

| Param      | Tipo   | Descripcion       |
|------------|--------|-------------------|
| `username` | String | Username del usuario |

**Query Params:**

| Param  | Tipo   | Requerido | Descripcion        |
|--------|--------|-----------|--------------------|
| `sort` | String | No        | Ordenamiento       |

**Response 200:** `List<ProductResponse>`

```json
[
  {
    "name": "string",
    "description": "string",
    "createdAt": "2025-01-01T00:00:00",
    "stock": 0,
    "userId": 1,
    "user": "string"
  }
]
```

---

### GET `/api/products/{id}` — AUTH

Obtener un producto por ID.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Response 200:**

```json
{
  "name": "string",
  "description": "string",
  "createdAt": "2025-01-01T00:00:00",
  "stock": 0,
  "userId": 1,
  "user": "string"
}
```

---

### POST `/api/products` — AUTH

Crear un nuevo producto.

**Request Body:**

```json
{
  "name": "string (requerido)",
  "description": "string (requerido, 10-150 chars)",
  "createdAt": "2025-01-01T00:00:00 (debe ser pasado o presente)",
  "stock": 0,
  "userId": 1
}
```

**Validaciones:**

- `name`: no puede estar vacio
- `description`: no puede estar vacio, entre 10 y 150 caracteres
- `createdAt`: debe ser fecha pasada o presente
- `stock`: minimo 0
- `userId`: requerido

**Response 201:**

```json
{
  "name": "string",
  "description": "string",
  "createdAt": "2025-01-01T00:00:00",
  "stock": 0,
  "userId": 1,
  "user": "string"
}
```

---

### PUT `/api/products/{id}` — AUTH

Actualizar un producto completo.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Request Body:** Mismo formato que POST.

**Response 200:** `ProductResponse`

---

### PATCH `/api/products/{id}` — AUTH

Actualizar solo la descripcion de un producto.

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

---

### PATCH `/api/products/{id}/stock` — AUTH

Actualizar el stock de un producto.

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

**Response 200:** `ProductResponse`

---

### DELETE `/api/products/{id}` — AUTH

Eliminar un producto.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del producto |

**Response 204:** No Content

---

## User Controller — `/api/user`

> Todos los endpoints requieren autenticacion. GET (listar) requiere rol ADMIN.

### GET `/api/user` — ADMIN

Listar usuarios paginados. Opcionalmente filtrar por `username`.

**Query Params:**

| Param      | Tipo   | Requerido | Descripcion              |
|------------|--------|-----------|--------------------------|
| `username` | String | No        | Filtrar por username     |
| `page`     | int    | No        | Numero de pagina         |
| `size`     | int    | No        | Tamanio de pagina        |

**Response 200:** `Page<UserEntityResponse>`

```json
{
  "content": [
    {
      "name": "string",
      "lastName": "string",
      "username": "string"
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 20
}
```

---

### GET `/api/user/{id}` — AUTH

Obtener un usuario por ID.

**Path Params:**

| Param | Tipo | Descripcion     |
|-------|------|-----------------|
| `id`  | Long | ID del usuario  |

**Response 200:**

```json
{
  "name": "string",
  "lastName": "string",
  "username": "string"
}
```

---

### POST `/api/user/save` — AUTH

Crear un nuevo usuario.

**Request Body:**

```json
{
  "name": "string (3-50 chars)",
  "lastName": "string (requerido)",
  "username": "string (requerido)",
  "password": "string (requerido, min 6 chars)"
}
```

**Response 201:**

```json
{
  "name": "string",
  "lastName": "string",
  "username": "string"
}
```

---

### PUT `/api/user/{id}` — AUTH

Actualizar un usuario completo.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Request Body:** Mismo formato que POST.

**Response 200:** `UserEntityResponse`

---

### PATCH `/api/user/{id}` — AUTH

Actualizar solo el nombre de un usuario.

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

---

### DELETE `/api/user/{id}` — AUTH

Eliminar un usuario.

**Path Params:**

| Param | Tipo | Descripcion    |
|-------|------|----------------|
| `id`  | Long | ID del usuario |

**Response 204:** No Content

---

## Resumen

| Controlador | Metodo | Ruta                                | Acceso  |
|-------------|--------|-------------------------------------|---------|
| Auth        | POST   | `/auth/login`                       | PUBLIC  |
| Auth        | POST   | `/auth/signup`                      | PUBLIC  |
| Auth        | GET    | `/auth/oauth2/success`              | PUBLIC  |
| Product     | GET    | `/api/products`                     | AUTH    |
| Product     | GET    | `/api/products/by-username/{username}` | AUTH |
| Product     | GET    | `/api/products/{id}`                | AUTH    |
| Product     | POST   | `/api/products`                     | AUTH    |
| Product     | PUT    | `/api/products/{id}`                | AUTH    |
| Product     | PATCH  | `/api/products/{id}`                | AUTH    |
| Product     | PATCH  | `/api/products/{id}/stock`          | AUTH    |
| Product     | DELETE | `/api/products/{id}`                | AUTH    |
| User        | GET    | `/api/user`                         | ADMIN   |
| User        | GET    | `/api/user/{id}`                    | AUTH    |
| User        | POST   | `/api/user/save`                    | AUTH    |
| User        | PUT    | `/api/user/{id}`                    | AUTH    |
| User        | PATCH  | `/api/user/{id}`                    | AUTH    |
| User        | DELETE | `/api/user/{id}`                    | AUTH    |

**Total: 17 endpoints** (3 publicos, 13 autenticados, 1 solo admin)
