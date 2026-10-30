# Task 6 - Shopping List API

A REST API for managing a shopping list, built with plain Node.js `http` and TypeScript. Users can add, view, update and delete items. Items are stored in memory, so the list resets when the server restarts.

## Setup

```bash
npm install
npm run dev
```

The server runs on `http://localhost:3000`.

To run the compiled version instead:

```bash
npm run build
npm start
```

## Project structure

```
src/
├── models/item.ts       # Item type
├── utils/response.ts    # Error class, JSON response helpers, error handler
└── server.ts            # HTTP server, routing, validation
```

## Item shape

| Field       | Type    | Notes                         |
|-------------|---------|-------------------------------|
| `id`        | number  | Auto-generated                |
| `name`      | string  | Required, non-empty           |
| `quantity`  | number  | Required, positive integer    |
| `purchased` | boolean | Optional, defaults to `false` |

## Response format

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{
  "success": false,
  "error": { "status": 400, "message": "Validation failed", "details": ["name is required"] }
}
```

## Endpoints

| Method | Endpoint     | Description    | Success | Errors   |
|--------|--------------|----------------|---------|----------|
| POST   | `/items`     | Add an item    | 201     | 400      |
| GET    | `/items`     | Get all items  | 200     | -        |
| GET    | `/items/:id` | Get one item   | 200     | 400, 404 |
| PUT    | `/items/:id` | Update an item | 200     | 400, 404 |
| DELETE | `/items/:id` | Delete an item | 204     | 400, 404 |

### Add an item

`POST /items`

Request body:

```json
{ "name": "Milk", "quantity": 2 }
```

Response (201):

```json
{
  "success": true,
  "data": { "id": 1, "name": "Milk", "quantity": 2, "purchased": false }
}
```

### Get all items

`GET /items`

Response (200):

```json
{
  "success": true,
  "data": [{ "id": 1, "name": "Milk", "quantity": 2, "purchased": false }]
}
```

### Get one item

`GET /items/1` returns the item (200), or 404 if the id doesn't exist.

### Update an item

`PUT /items/1`

Send any of `name`, `quantity` or `purchased`:

```json
{ "quantity": 3, "purchased": true }
```

Response (200):

```json
{
  "success": true,
  "data": { "id": 1, "name": "Milk", "quantity": 3, "purchased": true }
}
```

### Delete an item

`DELETE /items/1` returns 204 with no body, or 404 if the id doesn't