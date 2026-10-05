import { ref, type Ref, type ComputedRef } from 'vue'
import axiosInstance from './axiosConfig'
import { useToastStore } from '../stores/toastStore'
import { useVisualizerStore } from '../stores/visualizerStore'
import { type Model, type ModelImage, type ModelPdf } from '../types/model'

export const useMedia = (
  model: Ref<Model | null>,
  hasPermissions: ComputedRef<boolean>,
) => {
  const toastStore = useToastStore()
  const visualizerStore = useVisualizerStore()

  const showMediaUploadModal = ref(false)

  const showEditImgModal = ref(false)
  const imgToEdit = ref<Model['images'][number] | null>(null)

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

  const handleEditImg = (img: Model['images'][number]) => {
    imgToEdit.value = { ...img }
    showEditImgModal.value = true
  }

  const confirmImgEdit = async () => {
    if (!model.value || !imgToEdit.value || !hasPermissions.value) return

    const data = {
      modelId: model.value.id,
      image: {
        alt: imgToEdit.value.alt?.trim() || null,
        label: imgToEdit.value.label?.trim() || null,
        description: imgToEdit.value.description?.trim() || null,
      },
    }

    try {
      await axiosInstance.put(`/images/edit/${imgToEdit.value.id}`, data)

      model.value.images = model.value.images.map((img): ModelImage => {
        if (imgToEdit.value && img.id === imgToEdit.value.id) {
          return { ...imgToEdit.value }
        }
        return img
      })

      toastStore.showToast('success', 'Changes saved successfully')
    } catch (error) {
      console.error('Failed to update image.', error)
      toastStore.showToast('error', 'Failed to update image.')
    } finally {
      imgToEdit.value = null
      showEditImgModal.value = false
    }
  }

  const confirmImgDelete = async () => {
    if (!model.value || !imgToEdit.value || !hasPermissions.value) return

    try {
      await axiosInstance.delete('/images', {
        data: {
          modelId: model.value.id,
          imageId: imgToEdit.value.id,
        },
      })

      model.value.images = model.value.images.filter(
        (img) => img.id !== imgToEdit.value!.id,
      )

      toastStore.showToast('success', 'Image deleted successfully')
      visualizerStore.refreshVisualizer()
    } catch (error) {
      console.error('Failed to delete image.', error)
      toastStore.showToast('error', 'Failed to delete image.')
    } finally {
      imgToEdit.value = null
      showEditImgModal.value = false
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
    showEditImgModal,
    showDeletePDFModal,
    imgToEdit,
    pdfToDelete,
    handleMediaUploaded,
    handleEditImg,
    confirmImgDelete,
    handleDeletePdf,
    cancelPdfDelete,
    confirmPdfDelete,
    confirmImgEdit,
  }
}
