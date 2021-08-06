import type { App, Directive, DirectiveBinding } from 'vue'

import { useUserStore } from "@/store/modules/user"

function hasPermi(el: Element, binding: any) {
  const { value } = binding
  const allPermission = '*:*:*'
  const userStore = useUserStore()
  const permissions = userStore.permissions

  if (value && value instanceof Array && value.length > 0) {
    const permissionFlag = value

    const hasPermissions = permissions.some(permission => {
      return allPermission === permission || permissionFlag.includes(permission)
    })

    if (!hasPermissions) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('请设置操作权限标签值')
  }
}

function hasRole(el: Element, binding: any) {
  const { value } = binding
  const superAdmin = 'admin'
  const userStore = useUserStore()
  const roles = userStore.userInfo.roles.map(item => item.roleName)
  console.log(roles)

  if (value && value instanceof Array && value.length > 0) {
    const roleFlag = value

    const hasRole = roles.some(role => {
      return superAdmin === role || roleFlag.includes(role)
    })

    if (!hasRole) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('请设置角色权限标签值"')
  }
}

const hasPermiDirective: Directive = {
  mounted: (el: Element, binding: DirectiveBinding<any>) => {
    hasPermi(el, binding)
  },
}

const hasRoleDirective: Directive = {
  mounted: (el: Element, binding: DirectiveBinding<any>) => {
    hasRole(el, binding)
  },
}

export function setupPermissionDirective(app: App) {
  app.directive('hasPermi', hasPermiDirective)
}

export function setupRoleDirective(app: App) {
  app.directive('hasRole', hasRoleDirective)
}
