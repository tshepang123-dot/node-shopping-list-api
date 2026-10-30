import http, { IncomingMessage, ServerResponse } from "http";
import { Item, ItemInput } from "./models/item";
import { HttpError, handleError, sendJson, sendNoContent } from "./utils/response";

const PORT = Number(process.env.PORT) || 3000;
const items: Item[] = [];
let nextId = 1;

function readBody(req: IncomingMessage): Promise<ItemInput> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          return reject(new HttpError(400, "Body must be a JSON object"));
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, "Invalid JSON body"));
      }
    });
    req.on("error", () => reject(new HttpError(400, "Could not read request body")));
  });
}

function validate(body: ItemInput, partial: boolean): Partial<Item> {
  const errors: string[] = [];
  const out: Partial<Item> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim() === "") errors.push("name must be a non-empty string");
    else out.name = body.name.trim();
  } else if (!partial) errors.push("name is required");

  if (body.quantity !== undefined) {
    if (typeof body.quantity !== "number" || !Number.isInteger(body.quantity) || body.quantity < 1)
      errors.push("quantity must be a positive integer");
    else out.quantity = body.quantity;
  } else if (!partial) errors.push("quantity is required");

  if (body.purchased !== undefined) {
    if (typeof body.purchased !== "boolean") errors.push("purchased must be a boolean");
    else out.purchased = body.purchased;
  }

  if (partial && Object.keys(body).length === 0) errors.push("provide at least one field to update");
  if (errors.length) throw new HttpError(400, "Validation failed", errors);
  return out;
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Item id must be a positive integer");
  return id;
}

function findItem(id: number): Item {
  const item = items.find((i) => i.id === id);
  if (!item) throw new HttpError(404, `Item with id ${id} not found`);
  return item;
}

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  const method = req.method || "GET";

  if (parts[0] !== "items" || parts.length > 2) throw new HttpError(404, "Route not found");

  if (parts.length === 1) {
    if (method === "GET") return sendJson(res, 200, items);
    if (method === "POST") {
      const data = validate(await readBody(req), false);
      const item: Item = { id: nextId++, name: data.name!, quantity: data.quantity!, purchased: data.purchased ?? false };
      items.push(item);
      return sendJson(res, 201, item);
    }
    throw new HttpError(405, "Method not allowed");
  }

  const id = parseId(parts[1]);
  if (method === "GET") return sendJson(res, 200, findItem(id));
  if (method === "PUT") {
    const item = findItem(id);
    Object.assign(item, validate(await readBody(req), true));
    return sendJson(res, 200, item);
  }
  if (method === "DELETE") {
    const item = findItem(id);
    items.splice(items.indexOf(item), 1);
    return sendNoContent(res);
  }
  throw new HttpError(405, "Method not allowed");
}

http
  .createServer((req, res) => {
    route(req, res).catch((err) => handleError(res, err));
  })
  .listen(PORT, () => console.log(`Shopping List API running on http://localhost:${PORT}`));