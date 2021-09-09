<template>
  <div class="p-4">
    <a-button type="primary" @click="handleCreate">
      生成当月工资数据({{ selectDates }}天)
    </a-button>
    <a-calendar
      v-model:value="dateTime"
      @select="handleSelect"
      @panelChange="handlePanelChange"
    >
      <template #dateCellRender="{ current: val }">
        <div v-show="getListData(val)" class="pl-2 pr-2">
          <a-badge status="success" :text="getListData(val).remark" />
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
import { computed, defineComponent, onMounted, ref } from 'vue'
import moment, { Moment } from 'moment'
import { Modal, message as Message } from 'ant-design-vue'
import {
  getWorkingDaySettings,
  delWorkingDaySettings,
  addWorkingDaySettings,
} from '@/api/admin/baseInfo/workingDaySettings'
import { createEmployeeSalary } from '@/api/admin/finance/salary'
import { IWorkingDaySettings } from '@/api/admin/baseInfo/workingDaySettings/type'

export default defineComponent({
  setup() {
    const dateTime = ref<Moment>(moment())
    const remark = ref<string>('')
    const time = ref<Moment>()
    const calendarMode = ref<string>('month')
    const visible = ref<boolean>(false)
    const dateLists = ref<IWorkingDaySettings[]>([])

    const handleCreate = () => {
      const params = {
        dateTime: moment(dateTime.value).format('YYYY-MM-DD'),
        dateLists: dateLists.value,
      }
      createEmployeeSalary(params).then((res) => {
        console.log(res)
      })
    }

    const getListData = (value: Moment) => {
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
      getList()
    }

    const getList = () => {
      getWorkingDaySettings({
        day: moment(dateTime.value).format('YYYY-MM-DD'),
      }).then((res) => {
        dateLists.value = res.data.rows
      })
    }

    const selectDates = computed(() => {
      return dateLists.value.length
    })

    onMounted(() => {
      getList()
    })

    return {
      dateTime,
      visible,
      remark,
      selectDates,
      handleCreate,
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