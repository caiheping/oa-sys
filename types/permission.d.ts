import type { RouteRecordRaw } from 'vue-router'

// @ts-ignore
export interface AppRouteRecordRaw extends RouteRecordRaw {
  path: string;
  name?: string;
  component?: any;
  hidden?: boolean;
  redirect?: string;
  children?: AppRouteRecordRaw[];
  meta?: RouteMeta
}

export interface RouteMeta {
  title: string,
  menuType?: string,
  noCache?: boolean, // 不缓存
  icon?: string
}