export interface IRows {
  rows: INotice[];
  count: number;
}

export interface INotice {
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