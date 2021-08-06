export interface IRows {
  rows: IData[];
  count: number;
}

export interface IData {
  createdAt: string;
  createdBy: string;
  cssClass: string;
  dictLabel: string;
  dictSort: number;
  dictType: string;
  dictValue: string;
  id: number;
  isDefault: string;
  listClass: string;
  remark: string;
  status: string;
  updatedAt: string;
  [key: string]: any;
}