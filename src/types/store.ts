export interface Store {
  name: string;
  type: string;
  image: string;
  capacity: string;
}

export type StoreType = 'MAIN' | 'REGIONAL' | 'SUB REGIONAL';