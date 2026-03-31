export const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

const MAGIC_NUMBERS: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'image/webp': ['52494646'],
  'application/pdf': ['25504446'],
}

export const validateFileType = async (file: File): Promise<string | null> => {
  if (!ACCEPTED_MIME.includes(file.type)) return null

  const header = await getFileHeader(file)

  if (header.startsWith('52494646')) {
    const isWebP = await checkWebPSubtype(file)
    return isWebP ? 'image/webp' : null
  }

  for (const [mime, signatures] of Object.entries(MAGIC_NUMBERS)) {
    if (signatures.some((sig) => header.startsWith(sig))) {
      return mime
    }
  }

  return null
}

const getFileHeader = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4)

      let header = ''

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0')
      }
      resolve(header)
    }
    reader.readAsArrayBuffer(file.slice(0, 4))
  })
}

const checkWebPSubtype = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer)
      const str = Array.from(arr)
        .map((b) => String.fromCharCode(b))
        .join('')
      resolve(str === 'WEBP')
    }

    reader.readAsArrayBuffer(file.slice(8, 12))
  })
}
