import { ServerResponse } from "http";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: string[]) {
    super(message);
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, data }));
}

export function sendNoContent(res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}

export function handleError(res: ServerResponse, err: unknown): void {
  const e = err instanceof HttpError ? err : new HttpError(500, "Internal server error");
  res.writeHead(e.status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, error: { status: e.status, message: e.message, details: e.details } }));
}