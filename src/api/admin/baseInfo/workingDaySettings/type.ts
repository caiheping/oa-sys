export interface IRows {
  rows: IWorkingDaySettings[];
  count: number;
}

export interface IWorkingDaySettings {
  createdAt: string;
  createdBy: string;
  day: string;
  remark: string;
  updatedAt: string;
  updatedBy: string;
  [key: string]: any;
}