import type { BarMap } from "./types"
export declare type Recordable<T = any> = Record<string, T>;
export declare type Nullable<T> = T | null;
const isServer = typeof window === "undefined"

/* istanbul ignore next */
function resizeHandler(entries: any[]) {
  for (const entry of entries) {
    const listeners = entry.target.__resizeListeners__ || []
    if (listeners.length) {
      listeners.forEach((fn: () => any) => {
        fn()
      })
    }
  }
}

export declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

export const BAR_MAP: BarMap = {
  vertical: {
    offset: "offsetHeight",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    size: "height",
    key: "vertical",
    axis: "Y",
    client: "clientY",
    direction: "top",
  },
  horizontal: {
    offset: "offsetWidth",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    size: "width",
    key: "horizontal",
    axis: "X",
    client: "clientX",
    direction: "left",
  },
}

// @ts-ignore
export function renderThumbStyle({ move, size, bar }) {
  const style = {} as any
  const translate = `translate${bar.axis}(${move}%)`

  style[bar.size] = size
  style.transform = translate
  style.msTransform = translate
  style.webkitTransform = translate

  return style
}

function extend<T, K>(to: T, _from: K): T & K {
  return Object.assign(to, _from)
}

export function toObject<T>(arr: Array<T>): Recordable<T> {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/* istanbul ignore next */
export function on(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, false)
  }
}

/* istanbul ignore next */
export function off(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: Fn
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false)
  }
}

/* istanbul ignore next */
export function addResizeListener(element: any, fn: () => any) {
  if (isServer) return
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = []
    element.__ro__ = new ResizeObserver(resizeHandler)
    element.__ro__.observe(element)
  }
  element.__resizeListeners__.push(fn)
}

/* istanbul ignore next */
export function removeResizeListener(element: any, fn: () => any) {
  if (!element || !element.__resizeListeners__) return
  element.__resizeListeners__.splice(
    element.__resizeListeners__.indexOf(fn),
    1
  )
  if (!element.__resizeListeners__.length) {
    element.__ro__.disconnect()
  }
}
