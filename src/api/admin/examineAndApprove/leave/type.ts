import { IUser } from '../../system/user/type'
export interface IRows {
  rows: ILeave[];
  count: number;
}

export interface ILeave {
  createdAt: string;
  createdBy: string;
  endTime: string;
  id: number;
  leaveDate: string;
  leaveDuration: number;
  leaveReason: string;
  remark: string;
  startTime: string;
  status: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  [key: string]: any;
}