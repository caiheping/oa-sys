export function getLocalStorage(key: string) {
  return localStorage.getItem(key);
}

export function setLoclastorage(key: string, val: string) {
  localStorage.setItem(key, val);
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
export function handleTree(data: [], id = 'id', parentId = 'parentId', children = 'children', rootId = 0) {
  const obj: any = {}
  data.forEach((item: any) => {
    item[children] = []
    obj[item[id]] = item
  })
  const tree: [] = []
  data.forEach(list => {
    if (list[parentId] !== rootId) {
      if (obj[list[parentId]]) {
        obj[list[parentId]][children].push(list)
      }
    } else {
      tree.push(list)
    }
  })
  return {
    tree,
    obj
  }
}
