import { IUser } from '../../system/user/type'
export interface IRows {
  rows: IEvection[];
  count: number;
}

export interface IEvection {
  createdAt: string;
  createdBy: string;
  endTime: string;
  id: number;
  evectionDate: string;
  evectionDuration: number;
  evectionReason: string;
  remark: string;
  startTime: string;
  status: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  [key: string]: any;
}