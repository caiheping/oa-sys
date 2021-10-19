import { IUser } from '../../system/user/type'

export interface IRows {
  rows: IClockIn[];
  count: number;
}

export interface IClockIn {
  createdAt: string;
  createdBy: string;
  firstClockInAddr: string;
  firstClockInTime: string;
  id: number;
  lastClockInAddr: string;
  lastClockInTime: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  userId: 1
  [key: string]: any;
}