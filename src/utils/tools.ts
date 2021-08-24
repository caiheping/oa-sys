export function getLocalStorage(key: string) {
  return localStorage.getItem(key)
}

export function setLoclastorage(key: string, val: string) {
  localStorage.setItem(key, val)
}


/**
 *
 * @param data 数据源
 * @param id字段 默认 'id'
 * @param parentId 父节点字段 默认 'parentId'
 * @param children 孩子节点字段 默认 'children'
 * @param rootId 根Id 默认 0
 * @returns {{obj, list: Array}}
 */
export function handleTree(data: any[], id = 'id', parentId = 'parentId', children = 'children', rootId = 0) {
  const obj: any = {}
  data.forEach((item: any) => {
    item[children] = []
    obj[item[id]] = item
  })
  const tree: any[] = []
  data.forEach(list => {
    if (list[parentId] !== rootId) {
      if (obj[list[parentId]]) {
        obj[list[parentId]][children].push(list)
      }
    } else {
      tree.push(list)
    }
  })
  Object.keys(obj).forEach(key => {
    if (!obj[key].children.length) {
      delete obj[key].children
    }
  })
  return {
    tree,
    obj
  }
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = ''
  Object.keys(params).forEach((key) => {
    if (!Object.is(params[key], undefined) && !Object.is(params[key], null) && !Object.is(JSON.stringify(params[key]), '{}')) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
    }
  })
  return result
}
