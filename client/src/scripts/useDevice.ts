import { ref, onMounted } from 'vue'

export const useDevice = () => {
  const isMobileDevice = ref(false)

  const checkDevice = () => {
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

    const isMacintosh = /Macintosh/i.test(ua)
    const isIPadOS = isMacintosh && navigator.maxTouchPoints > 1

    isMobileDevice.value = hasTouch && (isMobileUA || isIPadOS)
  }

  onMounted(() => {
    checkDevice()
  })

  return { isMobileDevice }
}
