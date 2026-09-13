<template>
  <div ref="container" class="flex w-full h-full" />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CENTER, MeshBVH } from 'three-mesh-bvh'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { debounce } from '../scripts/hhUtils'
import {
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  type PropType,
} from 'vue'

const container = useTemplateRef('container')

const props = defineProps({
  model: { type: String as PropType<'buckle' | 'ring'> },
})

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
camera.position.z = 5
camera.layers.enableAll()

const renderer = ref<THREE.WebGLRenderer | null>(null)
const controls = ref<OrbitControls | null>(null)
const model = ref<THREE.Group | null>(null)
const modelMeshes = ref<THREE.Mesh[]>([])
const modelScale = ref(1)

const ambientLight = ref(new THREE.AmbientLight(0xffffff, 1.5))
scene.add(ambientLight.value)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
scene.add(directionalLight)

const loading = ref(false)
const loadingProgress = ref(0)
const objectUrl = ref('')

const init = (): boolean => {
  if (renderer.value) {
    cleanRenderer(renderer.value)
  }

  if (WebGL.isWebGL2Available()) {
    renderer.value = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      preserveDrawingBuffer: false,
    })
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 3))
    renderer.value.shadowMap.enabled = true
    renderer.value.domElement.style.touchAction = 'pan-y'

    if (container.value) {
      container.value.appendChild(renderer.value.domElement)
    }

    handleResize()
    renderer.value.setAnimationLoop(animate)

    controls.value = new OrbitControls(camera, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.1
    controls.value.autoRotate = true
    controls.value.autoRotateSpeed = 1
    controls.value.enableRotate = false
    controls.value.enableZoom = false
    controls.value.enablePan = false

    return true
  } else {
    const warning = WebGL.getWebGL2ErrorMessage()
    if (container.value) {
      container.value.appendChild(warning)
    }
    return false
  }
}

const loadGLBModel = async () => {
  loading.value = true

  if (props.model === 'ring') {
    objectUrl.value = '/models/ring.glb'
    scene.background = new THREE.Color(0xa0182c)
    ambientLight.value.intensity = 10
  } else {
    objectUrl.value = '/models/buckle.glb'
    scene.background = new THREE.Color(0xffffff)
  }

  const loader = new GLTFLoader()

  try {
    return new Promise((resolve, reject) => {
      loader.load(
        objectUrl.value,
        (gltf) => {
          model.value = gltf.scene

          modelMeshes.value = []
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              modelMeshes.value.push(child)
              const geometry = child.geometry

              const bvh = new MeshBVH(geometry, {
                maxLeafTris: 10,
                strategy: CENTER,
              })

              geometry.boundsTree = bvh
            }
          })

          // Center model
          const box = new THREE.Box3().setFromObject(gltf.scene)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())

          // Adjust model position
          gltf.scene.position.x -= center.x
          gltf.scene.position.y -= center.y - size.y / 2
          gltf.scene.position.z -= center.z

          // Adjust camera to fit model
          const maxDim = Math.max(size.x, size.y, size.z)
          modelScale.value = maxDim
          const fov = camera.fov * (Math.PI / 180)
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
          cameraZ *= 1.5 // Padding
          camera.position.z = cameraZ

          // Update camera's near and far planes
          camera.near = cameraZ / 100
          camera.far = cameraZ * 100
          camera.updateProjectionMatrix()

          if (controls.value) {
            controls.value.target.set(0, size.y / 2, 0)
            controls.value.update()
          }

          scene.add(gltf.scene)
          loading.value = false
          console.log('DONE')
          resolve(gltf)
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            loadingProgress.value = Math.round((xhr.loaded / xhr.total) * 100)
          }
        },
        (error) => {
          console.error('Error loading model: ', error)
          loading.value = false
          reject(error)
        },
      )
    })
  } catch (error) {
    console.error('Error loading model: ', error)
    loading.value = false
    throw error
  }
}

const animate = () => {
  if (renderer.value) {
    controls.value?.update()
    renderer.value.render(scene, camera)
  }
}

const handleResize = () => {
  if (!container.value || !renderer.value) {
    return
  }

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.value.setSize(width, height)
}

const debouncedResize = debounce(handleResize)
const resizeObserver = new ResizeObserver(debouncedResize.bind(debouncedResize))

const cleanup = () => {
  modelMeshes.value.forEach((mesh) => {
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    disposeMaterials(mesh.material)
  })
  modelMeshes.value = []

  // Remove model from scene
  if (model.value) {
    scene.remove(model.value)
    model.value = null
  }

  // Dispose controls
  if (controls.value) {
    controls.value.dispose()
    controls.value = null
  }

  // Remove lights
  scene.remove(ambientLight.value)
  scene.remove(directionalLight)

  // Clear scene
  while (scene.children.length > 0) {
    const object = scene.children[0]
    scene.remove(object)
  }

  // Dispose renderer
  if (renderer.value) {
    const domElement = renderer.value.domElement
    if (domElement && domElement.parentNode) {
      domElement.parentNode.removeChild(domElement)
    }
    cleanRenderer(renderer.value)
  }
}

/**
 * Helper functions
 */
const disposeMaterials = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose())
  } else {
    material.dispose()
  }
}

const cleanRenderer = (renderer: THREE.WebGLRenderer) => {
  renderer.dispose()
  renderer.forceContextLoss()
  renderer.domElement.remove()
}

onMounted(() => {
  const initialized = init()
  if (!initialized) return
  loadGLBModel()

  if (container.value) {
    resizeObserver.observe(container.value)
  }

  window.addEventListener('resize', debouncedResize)
})

onBeforeUnmount(() => {
  cleanup()
  resizeObserver.disconnect()
  window.removeEventListener('resize', debouncedResize)
})
</script>
