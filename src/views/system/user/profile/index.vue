<template>
  <div class="p-4">
    <a-tabs tab-position="left" v-model:activeKey="activeKey">
      <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.title">
        <component :is="item.component" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import UserInfo from './UserInfo.vue'
import UpdatePwd from './UpdatePwd.vue'

export default defineComponent({
  components: {
    UserInfo,
    UpdatePwd,
  },
  setup() {
    const activeKey = ref(1)
    const tabs = [
      {
        key: 1,
        title: '个人信息',
        component: 'UserInfo',
      },
      {
        key: 2,
        title: '修改密码',
        component: 'UpdatePwd',
      },
    ]
    return {
      activeKey,
      tabs,
    }
  },
})
</script>