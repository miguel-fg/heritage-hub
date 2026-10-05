export type Stage = 'upload' | 'annotate' | 'list'

export type ProcessedFile = {
  id: string
  file: File
  type: 'image' | 'pdf'
  progress: number
  error: boolean
  alt?: string
  title?: string
  label?: string
  description?: string
  previewUrl?: string
}
