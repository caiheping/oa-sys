export interface IRows {
  rows: IRole[];
  count: number;
}

export interface IRole {
  component: string;
  createdAt: string;
  createdBy: string;
  icon: string;
  id: number;
  isDelete: string;
  isFrame: string;
  keepAlive: number;
  menuType: string;
  name: string;
  orderNum: number;
  parentId: number;
  path: string;
  perms: string;
  remark: string;
  status: string;
  title: string;
  updatedAt: string;
  updatedBy: string;
  visible: string;
  [key: string]: any;
}