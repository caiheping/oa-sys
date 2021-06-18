<template>
  <Button
    v-bind="getBindValue"
    :class="[getColor, $attrs.class]"
    @click="onClick"
  >
    <template #default="data">
      <svg-icon :name="preIcon" v-if="preIcon" :size="14" />
      <slot v-bind="data"></slot>
      <svg-icon :name="postIcon" v-if="postIcon" :size="14" />
    </template>
  </Button>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue'

import { Button } from 'ant-design-vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

import { propTypes } from './propTypes'

export default defineComponent({
  name: 'AButton',
  components: { Button, SvgIcon },
  inheritAttrs: false,
  props: {
    type: propTypes
      .oneOf(['primary', 'default', 'danger', 'dashed', 'link'])
      .def('default'),
    color: propTypes.oneOf(['error', 'warning', 'success', 'normal', '']),
    loading: propTypes.bool,
    disabled: propTypes.bool,
    preIcon: propTypes.string,
    postIcon: propTypes.string,
    onClick: propTypes.func,
  },
  setup(props, { attrs }) {
    const getColor = computed(() => {
      const { color, disabled } = props
      return {
        [`ant-btn-${color}`]: !!color,
        [`is-disabled`]: disabled,
      }
    })

    const getBindValue = computed((): any => {
      return { ...attrs, ...props }
    })

    return { getBindValue, getColor }
  },
})
</script>

<style lang="less" scoped>
.ant-btn-error,
.ant-btn-warning,
.ant-btn-success {
  color: #fff;
  border-width: 0;
}
.ant-btn-success {
  background-color: @success-color;
  border-color: @success-color;
  color: #fff;
  &:hover {
    background-color: @success-color;
    border-color: @success-color;
    opacity: 0.6;
    color: #fff;
  }
}
.ant-btn-warning {
  background-color: @warning-color;
  border-color: @warning-color;
  color: #fff;
  &:hover {
    background-color: @warning-color;
    border-color: @warning-color;
    opacity: 0.6;
    color: #fff;
  }
}
.ant-btn-error {
  background-color: @error-color;
  border-color: @error-color;
  color: #fff;
  &:hover {
    background-color: @error-color;
    border-color: @error-color;
    opacity: 0.6;
    color: #fff;
  }
}

.ant-btn-normal {
  background-color: @normal-color;
  border-color: @normal-color;
  color: #fff;
  &:hover {
    background-color: @normal-color;
    border-color: @normal-color;
    opacity: 0.6;
    color: #fff;
  }
}

.ant-btn-link {
  padding: 0;
  &.ant-btn-success {
    background: transparent;
    color: @success-color;
  }
  &.ant-btn-warning {
    background: transparent;
    color: @warning-color;
  }
  &.ant-btn-error {
    background: transparent;
    color: @error-color;
  }
  &.ant-btn-normal {
    background: transparent;
    color: @normal-color;
  }
}
</style>
