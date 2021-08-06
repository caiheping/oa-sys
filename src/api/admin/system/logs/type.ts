export interface IRows {
  rows: ILog[];
  count: number;
}

export interface ILog {
  createdAt: string;
  createdBy: string;
  data: string;
  id: number;
  ip: string;
  method: string;
  updatedAt: string;
  updatedBy: string;
  url: string;
  [key: string]: any;
}