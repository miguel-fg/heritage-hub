import { ref, type Ref, type ComputedRef } from 'vue'
import axiosInstance from './axiosConfig'
import { useToastStore } from '../stores/toastStore'
import { type Model, type ModelImage, type ModelPdf } from '../types/model'

export const useMedia = (
  model: Ref<Model | null>,
  hasPermissions: ComputedRef<boolean>,
) => {
  const toastStore = useToastStore()

  const showMediaUploadModal = ref(false)

  const showDeleteImgModal = ref(false)
  const imgToDelete = ref<string | null>(null)

  const showDeletePDFModal = ref(false)
  const pdfToDelete = ref<string | null>(null)

  const handleMediaUploaded = (
    newImages: ModelImage[],
    newPdfs: ModelPdf[],
  ) => {
    if (!model.value) return

    if (newImages.length > 0) {
      const imgRecords: ModelImage[] = newImages.map((img) => ({
        ...img,
        modelId: model.value!.id,
      }))
      model.value.images = [...model.value.images, ...imgRecords]
    }

    if (newPdfs.length > 0) {
      const pdfRecords: ModelPdf[] = newPdfs.map((pdf) => ({
        ...pdf,
        modelId: model.value!.id,
      }))
      model.value.pdfs = [...model.value.pdfs, ...pdfRecords]
    }

    showMediaUploadModal.value = false
    toastStore.showToast('success', 'Files saved successfully')
  }

  const handleDeleteImg = async (imgId: string) => {
    imgToDelete.value = imgId
    showDeleteImgModal.value = true
  }

  const cancelImgDelete = () => {
    showDeleteImgModal.value = false
    imgToDelete.value = null
  }

  const confirmImgDelete = async () => {
    if (!model.value || !imgToDelete.value || !hasPermissions.value) return

    try {
      await axiosInstance.delete('/images', {
        data: {
          modelId: model.value.id,
          imageId: imgToDelete.value,
        },
      })

      model.value.images = model.value.images.filter(
        (img) => img.id !== imgToDelete.value,
      )

      toastStore.showToast('success', 'Image deleted successfully')
    } catch (error) {
      console.error('Failed to delete image.', error)
      toastStore.showToast('error', 'Failed to delete image.')
    } finally {
      imgToDelete.value = null
      showDeleteImgModal.value = false
    }
  }

  const handleDeletePdf = async (pdfId: string) => {
    pdfToDelete.value = pdfId
    showDeletePDFModal.value = true
  }

  const cancelPdfDelete = () => {
    showDeletePDFModal.value = false
    pdfToDelete.value = null
  }

  const confirmPdfDelete = async () => {
    if (!model.value || !pdfToDelete.value || !hasPermissions.value) return

    try {
      await axiosInstance.delete('/pdfs', {
        data: {
          modelId: model.value.id,
          pdfId: pdfToDelete.value,
        },
      })

      model.value.pdfs = model.value.pdfs.filter(
        (pdf) => pdf.id !== pdfToDelete.value,
      )

      toastStore.showToast('success', 'File deleted successfully')
    } catch (error) {
      console.error('Failed to delete file. ', error)
      toastStore.showToast('error', 'Failed to delete file.')
    } finally {
      pdfToDelete.value = null
      showDeletePDFModal.value = false
    }
  }

  return {
    showMediaUploadModal,
    showDeleteImgModal,
    showDeletePDFModal,
    imgToDelete,
    pdfToDelete,
    handleMediaUploaded,
    handleDeleteImg,
    cancelImgDelete,
    confirmImgDelete,
    handleDeletePdf,
    cancelPdfDelete,
    confirmPdfDelete,
  }
}
