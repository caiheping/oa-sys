<template>
  <div class="p-4">
    <a-calendar
      v-model:value="value"
      @select="handleSelect"
      @panelChange="handlePanelChange"
    >
      <template #dateCellRender="{ current: value }">
        <div v-show="getListData(value)" class="h-[100%] bg-[#e6f7ff] p-3">
          <a-badge status="success" :text="getListData(value).remark" />
        </div>
      </template>
    </a-calendar>

    <a-modal
      v-model:visible="visible"
      title="设置为工作日"
      ok-text="确认"
      cancel-text="取消"
      @cancel="handleCancel"
      @ok="handleSubmit"
    >
      <a-textarea
        v-model:value="remark"
        placeholder="请输入备注信息"
        allow-clear
      />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import moment, { Moment } from 'moment'
import { Modal, message as Message } from 'ant-design-vue'
import {
  getWorkingDaySettings,
  delWorkingDaySettings,
  addWorkingDaySettings,
} from '@/api/admin/baseInfo/workingDaySettings'
import { IWorkingDaySettings } from '@/api/admin/baseInfo/workingDaySettings/type'

export default defineComponent({
  setup() {
    const value = ref<Moment>()
    const remark = ref<string>('')
    const time = ref<Moment>()
    const calendarMode = ref<string>('month')
    const visible = ref<boolean>(false)
    const dateLists = ref<IWorkingDaySettings[]>([])

    const getListData = (value: Moment) => {
      // console.log(value.format('YYYY-MM-DD'))
      console.log(dateLists.value)
      if (
        dateLists.value.filter(
          (item) => item.day === value.format('YYYY-MM-DD')
        ).length
      ) {
        return dateLists.value.filter(
          (item) => item.day === value.format('YYYY-MM-DD')
        )[0]
      }
      return ''
    }

    // 点击日期操作
    const handleSelect = (value: Moment) => {
      if (calendarMode.value === 'month') {
        time.value = value
        if (
          dateLists.value.filter(
            (item) => item.day === value.format('YYYY-MM-DD')
          ).length === 0
        ) {
          showModal()
        } else {
          Modal.confirm({
            title: '确定取消该工作日吗？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              console.log(8989)
              const id = dateLists.value.filter(
                (item) => item.day === value.format('YYYY-MM-DD')
              )[0].id
              delWorkingDaySettings(id).then((res) => {
                Message.success(res.message)
                getList()
              })
            },
          })
        }
      }
    }
    // 显示弹窗
    const showModal = () => {
      visible.value = true
    }
    const handleCancel = () => {
      remark.value = ''
      visible.value = false
    }
    // 提交
    const handleSubmit = async () => {
      // console.log(moment(time.value).format('YYYY-MM-DD'), remark.value)
      visible.value = false
      await addWorkingDaySettings({
        day: moment(time.value).format('YYYY-MM-DD'),
        remark: remark.value,
      })
      remark.value = ''
      await getList()
    }
    // 日历组件切换模式事件
    const handlePanelChange = (date: Moment, mode: string) => {
      console.log(date, mode)
      calendarMode.value = mode
    }

    const getList = () => {
      getWorkingDaySettings().then((res) => {
        dateLists.value = res.data.rows
      })
    }

    onMounted(() => {
      getList()
    })

    return {
      value,
      visible,
      remark,
      getListData,
      handleSelect,
      showModal,
      handleCancel,
      handleSubmit,
      confirm,
      handlePanelChange,
    }
  },
})
</script>