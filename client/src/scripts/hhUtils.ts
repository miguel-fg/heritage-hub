export const debounce = (fn: Function) => {
  let timeout: number;

  return function (this: Function) {
    const context = this;
    const args = arguments;

    if (timeout) {
      window.cancelAnimationFrame(timeout);
    }

    timeout = window.requestAnimationFrame(() => {
      fn.apply(context, args);
    });
  };
};

export const isEmptyRecord = (obj: Record<any, any>) => {
  for (const _prop in obj) {
    return false;
  }

  return true;
};
