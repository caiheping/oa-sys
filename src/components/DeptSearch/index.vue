<template>
  <a-input
    :allowClear="true"
    v-model:value="searchValue"
    :placeholder="t('component.deptSearch.placeholder')"
  >
    <template #prefix>
      <svg-icon name="search" class="text-[#d9d9d9]" />
    </template>
  </a-input>
  <a-tree
    :blockNode="true"
    :expandedKeys="expandedKeys"
    :auto-expand-parent="autoExpandParent"
    :replace-fields="replaceFields"
    :tree-data="deptTreeOption"
    v-model:selectedKeys="selectedKeys"
    @expand="onExpand"
    @select="handleSelect"
  >
    <template #title="{ deptName }">
      <span v-if="deptName.indexOf(searchValue) > -1">
        {{ deptName.substr(0, deptName.indexOf(searchValue)) }}
        <span class="text-red-400">{{ searchValue }}</span>
        {{
          deptName.substr(deptName.indexOf(searchValue) + searchValue.length)
        }}
      </span>
      <span v-else>{{ deptName }}</span>
    </template>
  </a-tree>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'

export default defineComponent({
  props: {
    data: {
      type: Array,
      required: true,
    },
    original: {
      type: Array,
      default: () => {
        return []
      },
    },
    baseFields: {
      type: Object,
      default: () => {
        return {
          children: 'children',
          title: 'title',
          key: 'id',
        }
      },
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const searchValue = ref<string>('')
    const selectedKeys = ref<number[]>([])
    const expandedKeys = ref<number[]>([])
    const autoExpandParent = ref<boolean>(true)
    const deptTreeOption = computed(() => props.data)
    const replaceFields = computed(() => props.baseFields)
    const originalTreeLists: TreeDataItem = computed(() => props.original)
    const onExpand = (keys: number[]) => {
      expandedKeys.value = keys
      autoExpandParent.value = false
    }

    const handleSelect = (keys: number[]) => {
      emit('select', keys)
    }

    watch(searchValue, (value) => {
      const expanded = originalTreeLists.value
        .map((item: TreeDataItem) => {
          if ((item.deptName as string).indexOf(value) > -1) {
            return item.deptId
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      expandedKeys.value = expanded as number[]
      searchValue.value = value
      autoExpandParent.value = true
    })
    watch(selectedKeys, (val) => {
      console.log('selectedKeys', val)
    })
    return {
      t,
      searchValue,
      expandedKeys,
      autoExpandParent,
      deptTreeOption,
      replaceFields,
      selectedKeys,
      onExpand,
      handleSelect,
    }
  },
})
</script>