
const datas = import.meta.globEager("../../icons/**/*.svg")
const icons = Object.keys(datas).map((item: string) => item.replace(/(.*\/)*([^.]+).*/, "$2"))

export default icons
