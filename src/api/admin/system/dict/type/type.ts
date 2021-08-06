export interface IRows {
  rows: IType[];
  count: number;
}

export interface IType {
  createdAt: string;
  createdBy: string;
  dictName: string;
  dictType: string;
  id: number;
  remark: string;
  status: string;
  updatedAt: string;
  updatedBy: string;
  [key: string]: any;
}