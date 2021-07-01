import { reactive, toRefs } from "vue";

function useDrawer() {
  const drawer = reactive({
    open: false,
    drawerTitle: '',
    placement: 'right',
    width: '50%',
    handleClose: () => {
      drawer.open = false
    }
  });

  return {
    ...toRefs(drawer),
  };
}

export default useDrawer;
