export interface FormDataItem {
  name: string
  type: string
  label: string
  placeholder?: string
  props?: any
  fn?: any
  [key: string]: any
}