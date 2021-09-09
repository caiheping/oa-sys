import { IUser } from '../../system/user/type'

export interface IRows {
  rows: ISalary[];
  count: number;
}

export interface ISalary {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  user: IUser;
  userId: 1
  [key: string]: any;
}