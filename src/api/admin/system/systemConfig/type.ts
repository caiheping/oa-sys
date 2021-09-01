export interface IRows {
  rows: ISystemConfig[];
  count: number;
}

export interface ISystemConfig {
  createdAt: string;
  createdBy: string;
  id: number;
  name: string;
  keyName: string;
  key: string;
  remark: string;
  updatedAt: string;
  updatedBy: string;
  [key: string]: any;
}