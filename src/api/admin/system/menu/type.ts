export interface IRows {
  rows: IMenu[];
  count: number;
}

export interface IMenu {
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