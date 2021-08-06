export interface IRows {
  rows: IDept[];
  count: number;
}

export interface IDept {
  createdAt: string;
  createdBy: string;
  deptId: number;
  deptName: string;
  isDelete: string;
  orderNum: number;
  parentId: number;
  status: string;
  updatedAt: string;
  updatedBy: string;
  [key: string]: any;
}