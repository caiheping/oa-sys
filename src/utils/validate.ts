import { RuleObject } from 'ant-design-vue/es/form/interface'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()
export const formRules = {
  validPwd: (rule: RuleObject, value: string) => {
    const re = /^[0-9a-zA-Z]*$/
    if (!value.trim()) {
      return Promise.reject(t("validate.validPwd.cannotBeEmpty"))
    } else if (value.trim().length < 6) {
      return Promise.reject(t("validate.validPwd.atLeastSixDigits"))
    } else if (value.trim().length > 20) {
      return Promise.reject(t("validate.validPwd.upToTwentyDigits"))
    } else if (!re.test(value.trim())) {
      return Promise.reject(t("validate.validPwd.lettersOrnumbers"))
    } else {
      return Promise.resolve()
    }
  },
  checkRoleLength: (rule: RuleObject, value: any[]) => {
    if (value.length) {
      return Promise.resolve()
    } else {
      return Promise.reject(t("validate.checkRoleLength.cannotBeEmpty"))
    }
  },
  email: (rule: RuleObject, value: string) => {
    const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
    if (value && !reg.test(value)) {
      return Promise.reject(t("validate.email.illegalEmail"))
    } else {
      return Promise.resolve()
    }
  },
  moblie: (rule: RuleObject, value: string) => {
    if (!(/^1[34578]\d{9}$/.test(value))) {
      return Promise.reject(t("validate.moblie.illegalMoblie"))
    } else {
      return Promise.resolve()
    }
  },
  number: (rule: RuleObject, value: string) => {
    const reg = /^[0-9]*$/
    if (!reg.test(value)) {
      return Promise.reject(t("validate.number.illegalNumber"))
    } else {
      return Promise.resolve()
    }
  },
  // 正整数
  positiveNumber: (rule: RuleObject, value: string) => {
    const reg = /^[1-9]\d*$/
    if (!value.replace(/^(\s*)|(\s*)$/g, '')) {
      return Promise.reject(t("validate.positiveNumber.cannotBeEmpty"))
    } else if (!reg.test(value)) {
      return Promise.reject(t("validate.positiveNumber.positiveInteger"))
    } else {
      return Promise.resolve()
    }
  },
  str: (rule: RuleObject, value: string) => {
    if (!value.replace(/^(\s*)|(\s*)$/g, '')) {
      return Promise.reject(t("validate.str.cannotBeEmpty"))
    } else {
      return Promise.resolve()
    }
  },
  username: (rule: RuleObject, value: string) => {
    const reg = /^[\u4e00-\u9fa5_a-zA-Z0-9.·]+$/
    if (!reg.test(value)) {
      return Promise.reject(t("validate.username.illegalUsername"))
    } else {
      return Promise.resolve()
    }
  },
  time: (rule: RuleObject, value) => {
    const nowTime = new Date().getTime()
    const currentTime = new Date(value).getTime()
    if (!value) {
      return Promise.reject(t("validate.time.cannotBeEmpty"))
    }
    if (currentTime < nowTime) {
      return Promise.reject(t("validate.time.pastTime"))
    } else {
      return Promise.resolve()
    }
  },
}
