export function getLocalStorage(key: string) {
  return localStorage.getItem(key);
}

export function setLoclastorage(key: string, val: string) {
  localStorage.setItem(key, val);
}
