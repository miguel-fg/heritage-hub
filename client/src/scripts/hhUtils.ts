import { unzipSync } from 'fflate'

export const debounce = (fn: Function) => {
  let timeout: number

  return function (this: Function) {
    const context = this
    const args = arguments

    if (timeout) {
      window.cancelAnimationFrame(timeout)
    }

    timeout = window.requestAnimationFrame(() => {
      fn.apply(context, args)
    })
  }
}

export const isEmptyRecord = (obj: Record<any, any>) => {
  for (const _prop in obj) {
    return false
  }

  return true
}

export const dataUrlToFile = (dataUrl: string): File => {
  const byteString = atob(dataUrl.split(',')[1])
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]

  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([ab], { type: mimeString })

  const file = new File([blob], 'thumbnail.png', { type: mimeString })

  return file
}

export const extractFilesFromZip = async (zipFile: File): Promise<File[]> => {
  const buffer = await zipFile.arrayBuffer()
  const files = unzipSync(new Uint8Array(buffer))

  return Object.entries(files).map(([path, data]) => {
    const filename = path.split('/').pop() || path
    return new File([data], filename)
  })
}

export const extractGlbFromZip = async (zipFile: File): Promise<File> => {
  const extracted = await extractFilesFromZip(zipFile)
  const glb = extracted.find((f) => f.name.toLowerCase().endsWith('.glb'))

  if (!glb) {
    throw new Error('No .glb found in zip')
  }

  return new File([glb], 'model.glb', { type: 'model/gltf-binary' })
}
