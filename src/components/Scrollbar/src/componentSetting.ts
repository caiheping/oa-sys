import { Recordable } from "./util"
declare type Data = Record<string, unknown>;
declare type DefaultFactory<T> = (props: Data) => T | null | undefined;
export declare type Prop<T, D = T> = PropOptions<T, D> | PropType<T>;
declare interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null;
  required?: boolean;
  default?: D | DefaultFactory<D> | null | undefined | object;
  validator?(value: unknown): boolean;
}
declare type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
    | {
        required: true;
      }
    | {
        default: any;
      }
    | BooleanConstructor
    | {
        type: BooleanConstructor;
      }
    ? K
    : never;
}[keyof T];
declare type PropConstructor<T = any> =
  | {
      new (...args: any[]): T & {};
    }
  | {
      (): T;
    }
  | PropMethod<T>;
declare type PropMethod<T, TConstructor = any> = [T] extends [
  (...args: any) => any
]
  ? {
      new (): TConstructor;
      (): T;
      readonly prototype: TConstructor;
    }
  : never;
export declare type PropType<T> = PropConstructor<T> | PropConstructor<T>[];
declare type InferPropType<T> = [T] extends [null]
  ? any
  : [T] extends [
      {
        type: null | true;
      }
    ]
  ? any
  : [T] extends [
      | ObjectConstructor
      | {
          type: ObjectConstructor;
        }
    ]
  ? Record<string, any>
  : [T] extends [
      | BooleanConstructor
      | {
          type: BooleanConstructor;
        }
    ]
  ? boolean
  : [T] extends [
      | DateConstructor
      | {
          type: DateConstructor;
        }
    ]
  ? Date
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? D
    : V
  : T;
declare type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
export declare type ExtractPropTypes<O> = O extends object
  ? {
      [K in RequiredKeys<O>]: InferPropType<O[K]>;
    } &
      {
        [K in OptionalKeys<O>]?: InferPropType<O[K]>;
      }
  : {
      [K in string]: any;
    };
export declare const columnProps: {
  title: import("vue-types").VueTypeValidableDef<import("./types").VueNode>;
  key: import("vue-types").VueTypeDef<string | number>;
  dataIndex: import("vue-types").VueTypeValidableDef<string> & {
    default: string;
  };
  customRender: import("vue-types").VueTypeValidableDef<
    (...args: any[]) => any
  > & {
    default: (...args: any[]) => any;
  };
  customCell: import("vue-types").VueTypeValidableDef<
    (...args: any[]) => any
  > & {
    default: (...args: any[]) => any;
  };
  customHeaderCell: import("vue-types").VueTypeValidableDef<
    (...args: any[]) => any
  > & {
    default: (...args: any[]) => any;
  };
  align: import("vue-types").VueTypeDef<"center" | "left" | "right">;
  ellipsis: import("vue-types").VueTypeValidableDef<boolean>;
  filters: import("vue-types").VueTypeDef<
    {
      text: (string | ((props: Record<string, unknown>) => string)) & string;
      value: (string | ((props: Record<string, unknown>) => string)) & string;
      children:
        | unknown[]
        | (((props: Record<string, unknown>) => unknown[]) &
            (() => unknown[]) &
            (() => unknown[]));
    }[]
  >;
  filterMultiple: import("vue-types").VueTypeValidableDef<boolean>;
  filterDropdown: import("vue-types").VueTypeValidableDef<any>;
  filterDropdownVisible: import("vue-types").VueTypeValidableDef<boolean>;
  sorter: import("vue-types").VueTypeDef<any>;
  defaultSortOrder: import("vue-types").VueTypeDef<"descend" | "ascend">;
  colSpan: import("vue-types").VueTypeValidableDef<number> & {
    default: number;
  };
  width: import("vue-types").VueTypeDef<string | number>;
  className: import("vue-types").VueTypeValidableDef<string> & {
    default: string;
  };
  fixed: import("vue-types").VueTypeDef<boolean | "left" | "right">;
  filterIcon: import("vue-types").VueTypeValidableDef<any>;
  filteredValue: import("vue-types").VueTypeValidableDef<unknown[]> & {
    default: () => unknown[];
  };
  filtered: import("vue-types").VueTypeValidableDef<boolean>;
  defaultFilteredValue: import("vue-types").VueTypeValidableDef<unknown[]> & {
    default: () => unknown[];
  };
  sortOrder: import("vue-types").VueTypeDef<boolean | "descend" | "ascend">;
  sortDirections: import("vue-types").VueTypeValidableDef<unknown[]> & {
    default: () => unknown[];
  };
}
export declare type ColumnProps = Partial<
  ExtractPropTypes<typeof columnProps>
> & {
  slots?: Record<string, string>;
};
export declare type SortOrder = "descend" | "ascend";
export interface SorterResult {
  column: ColumnProps;
  order: SortOrder;
  field: string;
  columnKey: string;
}

export default {
  // basic-table setting
  table: {
    // Form interface request general configuration
    // support xxx.xxx.xxx
    fetchSetting: {
      // The field name of the current page passed to the background
      pageField: "page",
      // The number field name of each page displayed in the background
      sizeField: "pageSize",
      // Field name of the form data returned by the interface
      listField: "items",
      // Total number of tables returned by the interface field name
      totalField: "total",
    },
    // Number of pages that can be selected
    pageSizeOptions: ["10", "50", "80", "100"],
    // Default display quantity on one page
    defaultPageSize: 10,
    // Custom general sort function
    defaultSortFn: (sortInfo: SorterResult) => {
      const { field, order } = sortInfo
      return {
        // The sort field passed to the backend you
        field,
        // Sorting method passed to the background asc/desc
        order,
      }
    },
    // Custom general filter function
    defaultFilterFn: (data: Partial<Recordable<string[]>>) => {
      return data
    },
  },
  // scrollbar setting
  scrollbar: {
    // Whether to use native scroll bar
    // After opening, the menu, modal, drawer will change the pop-up scroll bar to native
    native: false,
  },
}
