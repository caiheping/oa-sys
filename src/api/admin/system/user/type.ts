export interface IRows {
  rows: IUser[];
  count: number;
}

export interface IUser {
  avatar: any;
  department: any;
  deptId: number;
  email: any;
  id: number;
  isDelete: string;
  mobile: any;
  nickName: string;
  remark: string;
  roles: any;
  sex: string;
  status: string;
  [key: string]: any;
}