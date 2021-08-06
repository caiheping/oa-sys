import { reactive, toRefs } from "vue"

function useDrawer() {
  const handleClose = () => {
    drawer.open = false
  }


  const drawer = reactive({
    open: false,
    drawerTitle: '',
    placement: 'right',
    width: '50%',
    handleClose
  })

  return {
    ...toRefs(drawer),
  }
}

export default useDrawer
