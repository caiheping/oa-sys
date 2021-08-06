import { genMessage } from "../helper"

const modules = import.meta.globEager("./zh-cn/**/*.ts")
export default {
  message: {
    ...genMessage(modules, "zh-cn"),
  },
}
