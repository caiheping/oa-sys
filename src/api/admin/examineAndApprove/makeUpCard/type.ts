import { IUser } from '../../system/user/type'
export interface IRows {
  rows: IMakeUpCard[];
  count: number;
}

export interface IMakeUpCard {
  createdAt: string;
  createdBy: string;
  endTime: string;
  id: number;
  makeUpCardDate: string;
  makeUpCardDuration: number;
  makeUpCardReason: string;
  remark: string;
  startTime: string;
  status: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  [key: string]: any;
}