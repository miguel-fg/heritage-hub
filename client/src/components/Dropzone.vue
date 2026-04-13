<template>
  <h1 class="title text-primary-500 mb-5 w-full max-w-300 mx-auto">
    File Select
  </h1>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave="toggleActive"
    @dragover.prevent
    @drop.prevent="handleDrop"
    :class="active ? 'bg-grayscale-200 border-grayscale-400' : ''"
    class="flex justify-center items-center w-full max-w-300 mx-auto h-148 px-3 border-2 border-dashed border-grayscale-300 bg-grayscale-100 rounded-xs hover:bg-grayscale-200 hover:border-grayscale-400"
  >
    <label
      for="objectInput"
      class="flex flex-col gap-3 w-full h-full justify-center items-center cursor-pointer"
    >
      <img
        src="../../assets/icons/object-placeholder.svg"
        alt="Object placeholder icon"
      />
      <p class="font-poppins text-grayscale-800 text-pretty text-center">
        Click to choose a
        <span class="font-bold">.glb</span>
        file or an <span class="font-bold">.obj</span> bundle (.obj + .mtl +
        textures) or drag and drop them here.
      </p>
    </label>
    <input
      type="file"
      name="object"
      id="objectInput"
      class="hidden"
      multiple
      @change="handleFileChange"
    />
  </div>
  <div class="flex gap-3 w-full max-w-300 mx-auto justify-end mt-4">
    <Button type="secondary" @click="emit('cancel')">Cancel</Button>
    <Button type="primary" @click="uploadClick">Upload</Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'
import { useToastStore } from '../stores/toastStore'
import { extractGlbFromZip, extractFilesFromZip } from '../scripts/hhUtils'
import type { ModelFiles } from '../types/model'

const file = defineModel<ModelFiles | null>()
const emit = defineEmits(['update', 'cancel'])
const active = ref(false)
const toastStore = useToastStore()

const TEXTURE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

const toggleActive = () => {
  active.value = !active.value
}

const validateGLTFFile = async (targetFile: File): Promise<boolean> => {
  const MAX_GLB_SIZE = 150 * 1024 * 1024 // 150 MB

  if (targetFile.size > MAX_GLB_SIZE) {
    toastStore.showToast('error', 'GLB file exceeds the 150MB limit')
    return false
  }

  const fileName = targetFile.name.toLowerCase()

  if (fileName.endsWith('.gltf')) {
    try {
      const text = await targetFile.text()
      const json = JSON.parse(text)
      return json.asset && json.asset.version ? true : false
    } catch (error) {
      return false
    }
  } else if (fileName.endsWith('.glb')) {
    try {
      const buffer = await targetFile.arrayBuffer()
      const view = new DataView(buffer)
      const magic = view.getUint32(0, true)
      const version = view.getUint32(4, true)

      return magic === 0x46546c67 && version === 2
    } catch (error) {
      return false
    }
  }

  return false
}

const validateOBJFiles = (files: File[]): boolean => {
  const MAX_OBJ_SIZE = 150 * 1024 * 1024 // 150 MB
  const MAX_MTL_SIZE = 10 * 1024 * 1024 // 10 MB
  const MAX_TEXTURE_SIZE = 50 * 1024 * 1024 // 50 MB
  const MAX_TOTAL_SIZE = 250 * 1024 * 1024 // 250 MB

  const objFiles = files.filter((f) => f.name.toLowerCase().endsWith('.obj'))
  const mtlFiles = files.filter((f) => f.name.toLowerCase().endsWith('.mtl'))
  const textureFiles = files.filter((f) =>
    TEXTURE_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)),
  )

  const unknownFiles = files.filter((f) => {
    const name = f.name.toLowerCase()
    return (
      !name.endsWith('.obj') &&
      !name.endsWith('.mtl') &&
      !TEXTURE_EXTENSIONS.some((ext) => name.endsWith(ext))
    )
  })

  if (objFiles.length !== 1) {
    toastStore.showToast('error', 'Please provide exactly one .obj file')
    return false
  }
  if (mtlFiles.length !== 1) {
    toastStore.showToast('error', 'Please provide exactly one .mtl file')
    return false
  }
  if (textureFiles.length === 0) {
    toastStore.showToast(
      'error',
      'Please provide at least one texture (.jpg/.png)',
    )
    return false
  }
  if (unknownFiles.length > 0) {
    toastStore.showToast(
      'error',
      `Unexpected files(s): ${unknownFiles.map((f) => f.name).join(', ')}`,
    )
    return false
  }

  const totalSize = [...objFiles, ...mtlFiles, ...textureFiles].reduce(
    (sum, f) => sum + f.size,
    0,
  )

  if (objFiles[0].size > MAX_OBJ_SIZE) {
    toastStore.showToast('error', 'OBJ file exceeds the 150MB limit')
    return false
  }

  if (mtlFiles[0].size > MAX_MTL_SIZE) {
    toastStore.showToast('error', 'MTL file exceeds the 10MB limit')
    return false
  }

  if (textureFiles.some((f) => f.size > MAX_TEXTURE_SIZE)) {
    toastStore.showToast('error', 'Each texture file must be under 50MB')
    return false
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    toastStore.showToast('error', 'Total bundle size exceeds the 250MB limit')
    return false
  }

  file.value = {
    type: 'OBJ',
    obj: objFiles[0],
    mtl: mtlFiles[0],
    textures: textureFiles,
  }
  return true
}

const processFiles = async (incoming: File[]) => {
  // Zip files
  if (
    incoming.length === 1 &&
    incoming[0].name.toLowerCase().endsWith('.zip')
  ) {
    console.log('Validating ZIP file...')
    const extracted = await extractFilesFromZip(incoming[0])
    const hasObj = extracted.some((f) => f.name.toLowerCase().endsWith('.obj'))
    // OBJ Files
    if (hasObj) {
      const valid = validateOBJFiles(extracted)
      if (valid) {
        console.log('DONE')
        emit('update')
        return
      } else {
        toastStore.showToast(
          'error',
          'Invalid file type(s). Please upload a valid .obj file and texture files.',
        )
        return
      }
    }

    // GLB file
    try {
      const glb = await extractGlbFromZip(incoming[0])
      const isValid = await validateGLTFFile(glb)
      if (!isValid) {
        toastStore.showToast(
          'error',
          'Invalid file type. Please upload a .glb/.gltf file.',
        )
        return
      }

      file.value = { type: 'GLB', glb }
      console.log('DONE')
      emit('update')
    } catch {
      toastStore.showToast(
        'error',
        'Invalid file type. Please upload a .glb/.gltf file.',
      )
    }
    return
  }

  // Single GLB
  if (
    incoming.length === 1 &&
    incoming[0].name.toLowerCase().endsWith('.glb')
  ) {
    console.log('Validating GLB file...')
    const isValid = await validateGLTFFile(incoming[0])
    if (!isValid) {
      toastStore.showToast(
        'error',
        'Invalid file type. Please upload a .glb/.gltf file.',
      )
      return
    }

    file.value = { type: 'GLB', glb: incoming[0] }
    console.log('DONE')
    emit('update')
    return
  }

  // Multiple files (OBJ bundle)
  const hasObj = incoming.some((f) => f.name.toLowerCase().endsWith('.obj'))
  if (!hasObj) {
    toastStore.showToast(
      'error',
      'Invalid file type. Please upload a .glb or .obj bundle',
    )
    return
  }

  console.log('Validating OBJ files...')
  const valid = validateOBJFiles(incoming)

  if (valid) {
    console.log('DONE')
    emit('update')
    return
  } else {
    toastStore.showToast(
      'error',
      'Invalid file type(s). Please upload a valid .obj file and texture files.',
    )
  }
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement

  if (!target.files || target.files.length === 0) return

  await processFiles(Array.from(target.files))
}

const handleDrop = async (e: DragEvent) => {
  toggleActive()

  if (!e.dataTransfer || e.dataTransfer.files.length === 0) return

  await processFiles(Array.from(e.dataTransfer.files))
}

const uploadClick = () => {
  const fileInput = document.getElementById('objectInput')

  if (fileInput) {
    fileInput.click()
  }
}
</script>
