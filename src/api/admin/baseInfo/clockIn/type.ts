export interface IRows {
  rows: IClockIn[];
  count: number;
}

export interface IClockIn {
  createdAt: string;
  createdBy: string;
  id: number;
  noticeContent: string;
  noticeTitle: string;
  noticeType: string;
  status: string;
  updatedAt: string;
  updatedBy: string;
  [key: string]: any;
}