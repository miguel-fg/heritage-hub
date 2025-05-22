import { computed } from "vue";
import { useMediaQuery } from "@vueuse/core";

export const useTailwindBreakpoints = () => {
  const sm = useMediaQuery("(min-width: 640px)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const xl = useMediaQuery("(min-width: 1536px)");

  const current = computed(() => {
    if (xl.value) return "xl";
    if (lg.value) return "lg";
    if (md.value) return "md";
    if (sm.value) return "sm";
    return "xs";
  });

  return {
    sm,
    md,
    lg,
    xl,
    current,
  };
};
