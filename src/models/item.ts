export interface Item {
  id: number;
  name: string;
  quantity: number;
  purchased: boolean;
}

export interface ItemInput {
  name?: unknown;
  quantity?: unknown;
  purchased?: unknown;
}