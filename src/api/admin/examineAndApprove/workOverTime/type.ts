import { IUser } from '../../system/user/type'
export interface IRows {
  rows: IWorkOvertime[];
  count: number;
}

export interface IWorkOvertime {
  createdAt: string;
  createdBy: string;
  endTime: string;
  id: number;
  workOverTimeDate: string;
  workOverTimeDuration: number;
  workOverTimeReason: string;
  remark: string;
  startTime: string;
  status: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  [key: string]: any;
}