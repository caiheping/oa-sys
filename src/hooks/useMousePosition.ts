import { reactive, toRefs, onMounted, onUnmounted } from "vue"

function useMousePosition() {
  const position = reactive({
    x: 0,
    y: 0,
    updateMouse: (e: MouseEvent) => {
      position.x = e.pageX
      position.y = e.pageY
    },
  })

  onMounted(() => {
    document.addEventListener("click", position.updateMouse)
  })

  onUnmounted(() => {
    document.removeEventListener("click", position.updateMouse)
  })

  return {
    ...toRefs(position),
  }
}

export default useMousePosition
