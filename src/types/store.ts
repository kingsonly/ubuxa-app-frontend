export interface Store {
  name: string;
  type: string;
  image: string;
  capacity: string;
  value: number;
}

export type StoreType = 'MAIN' | 'REGIONAL' | 'SUB REGIONAL';