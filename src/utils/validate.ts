import { RuleObject } from 'ant-design-vue/es/form/interface';
export const formRules = {
  validPwd: (rule: RuleObject, value: string) => {
    const re = /^[0-9a-zA-Z]*$/
    if (!value.trim()) {
      return Promise.reject('密码不能为空')
    } else if (value.trim().length < 6) {
      return Promise.reject('密码至少为六位数')
    } else if (value.trim().length > 20) {
      return Promise.reject('密码至多为二十位数')
    } else if (!re.test(value.trim())) {
      return Promise.reject('密码只能是字母、数字的组合')
    } else {
      return Promise.resolve();
    }
  },
  email: (rule: RuleObject, value: string) => {
    const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
    if (value && !reg.test(value)) {
      return Promise.reject('非法的邮箱格式')
    } else {
      return Promise.resolve();
    }
  },
  moblie: (rule: RuleObject, value: string) => {
    if (!(/^1[34578]\d{9}$/.test(value))) {
      return Promise.reject('不合格的手机号码')
    } else {
      return Promise.resolve();
    }
  },
  checkTel(rule: RuleObject, value: string) {
    if ((/^1[34578]\d{9}$/.test(value)) || /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('请填写合法的手机号码或者固话号码')
    }
  },
  number: (rule: RuleObject, value: string) => {
    const reg = /^[0-9]*$/
    if (!reg.test(value)) {
      return Promise.reject('请填纯数字')
    } else {
      return Promise.resolve();
    }
  },
  // 正整数
  positiveNumber: (rule: RuleObject, value: string) => {
    const reg = /^[1-9]\d*$/
    if (!value.replace(/^(\s*)|(\s*)$/g, '')) {
      return Promise.reject('请输入内容')
    } else if (!reg.test(value)) {
      return Promise.reject('请填正整数')
    } else {
      return Promise.resolve();
    }
  },
  str: (rule: RuleObject, value: string) => {
    if (!value.replace(/^(\s*)|(\s*)$/g, '')) {
      return Promise.reject('请填字符串')
    } else {
      return Promise.resolve();
    }
  },
  username: (rule: RuleObject, value: string) => {
    const reg = /^[\u4e00-\u9fa5_a-zA-Z0-9.·]+$/
    if (!reg.test(value)) {
      return Promise.reject('登录名只能包含字母数字下划线')
    } else {
      return Promise.resolve();
    }
  },
  time: (rule: RuleObject, value) => {
    const nowTime = new Date().getTime()
    const currentTime = new Date(value).getTime()
    if (!value) {
      return Promise.reject('时间不能为空')
    }
    if (currentTime < nowTime) {
      return Promise.reject('不能选择过去时间')
    } else {
      return Promise.resolve();
    }
  },
  timerange: (rule: RuleObject, value) => {
    const nowTime = new Date().getTime()
    const startTime = new Date(value[0]).getTime()
    const endTime = new Date(value[1]).getTime()
    if (!value) {
      return Promise.reject('时间不能为空')
    }
    if (startTime < nowTime || endTime < nowTime) {
      return Promise.reject('不能选择过去时间')
    } else {
      return Promise.resolve();
    }
  },
  year: (rule: RuleObject, value) => {
    const nowTime = new Date().getFullYear()
    if (!value) {
      return Promise.reject('时间不能为空')
    }
    if (value < nowTime) {
      return Promise.reject('不能选择过去年份')
    } else {
      return Promise.resolve();
    }
  },
  name: (rule: RuleObject, value: string) => {
    const reg = /^[\w\u4E00-\u9FA5\uF900-\uFA2D]*$/
    if (!reg.test(value)) {
      return Promise.reject('含有非法字符')
    } else {
      return Promise.resolve();
    }
  },
  idCard(rule: RuleObject, value: string) {
    const reg = new RegExp(/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/)
    if (!reg.test(value)) {
      return Promise.reject('请输入正确身份证')
    } else {
      return Promise.resolve();
    }
  },
  ip(rule: RuleObject, value: string) {
    const reg = new RegExp(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/)
    if (!reg.test(value)) {
      return Promise.reject('请输入正确ip格式')
    } else {
      return Promise.resolve();
    }
  },
  port(rule: RuleObject, value: string) {
    const reg = new RegExp(/^(\d)+$/)
    if (!reg.test(value)) {
      return Promise.reject('请输入正确端口号')
    } else {
      return Promise.resolve();
    }
  }
}
