import { getDicts } from '@/api/admin/system/dict/data'

interface Data {
  dictLabel: string
  dictType: string
  remark: string
  status: string
  [key: string]: string
}

// 回显数据字典
export function selectDictLabel(datas: Data[], value) {
  const actions: string[] = []
  Object.keys(datas).map((key) => {
    if (datas[key].dictValue === ('' + value)) {
      actions.push(datas[key].dictLabel)
      return false
    }
  })
  return actions.join('')
}

// 获取字典数据
export const getDict = async (dictVal) => {
  const { data } = await getDicts(dictVal)
  return data
}
