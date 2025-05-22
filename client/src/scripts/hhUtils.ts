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

export const dataUrlToFile = (dataUrl: string): File => {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });

  const file = new File([blob], "thumbnail.png", { type: mimeString });

  return file;
};
