import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CENTER, MeshBVH, acceleratedRaycast } from "three-mesh-bvh";
import { ref, type ShallowRef } from "vue";
import { useModelStore } from "../stores/modelStore";
import { useToastStore } from "../stores/toastStore";

THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const useModelViewer = (
  container: Readonly<ShallowRef<HTMLDivElement | null>>,
) => {
  const modelStore = useModelStore();
  const toastStore = useToastStore();

  const modelScale = ref(1);
  // Core scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 5;
  camera.layers.enableAll();

  const renderer = ref<THREE.WebGLRenderer | null>(null);
  const controls = ref<OrbitControls | null>(null);
  const model = ref<THREE.Group | null>(null);
  const modelMeshes = ref<THREE.Mesh[]>([]);

  // Lights
  const ambientLight = ref(new THREE.AmbientLight(0xffffff, 0.5));
  scene.add(ambientLight.value);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  // State
  const loading = ref(false);
  const loadingProgress = ref(0);
  const objectUrl = ref("");

  /**
   * Initialize the WebGL renderer and controls
   */
  const init = (): boolean => {
    // Dispose existing renderer
    if (renderer.value) {
      cleanRenderer(renderer.value);
    }

    if (WebGL.isWebGL2Available()) {
      // Initialize renderer
      renderer.value = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
      renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.value.shadowMap.enabled = true;

      if (container) {
        container.value?.appendChild(renderer.value.domElement);
      }

      handleResize();
      renderer.value.setAnimationLoop(animate);

      // Initialize controls
      controls.value = new OrbitControls(camera, renderer.value.domElement);
      controls.value.enableDamping = true;
      controls.value.dampingFactor = 0.1;
      controls.value.autoRotate = true;
      controls.value.autoRotateSpeed = 2;

      return true;
    } else {
      const warning = WebGL.getWebGL2ErrorMessage();
      if (container.value) {
        container.value.appendChild(warning);
      }
      return false;
    }
  };

  /**
   * Load a 3D model from URL
   */
  const loadModel = async (url: string) => {
    if (!url) return;

    loading.value = true;
    objectUrl.value = url;

    const loader = new GLTFLoader();

    try {
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            model.value = gltf.scene;

            // Build BVH meshes in model
            modelMeshes.value = [];
            gltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                modelMeshes.value.push(child);
                const geometry = child.geometry;

                const bvh = new MeshBVH(geometry, {
                  maxLeafTris: 10,
                  strategy: CENTER,
                });

                geometry.boundsTree = bvh;
              }
            });

            // Center model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Adjust model position
            gltf.scene.position.x -= center.x;
            gltf.scene.position.y -= center.y - size.y / 2;
            gltf.scene.position.z -= center.z;

            // Adjust camera to fit model
            const maxDim = Math.max(size.x, size.y, size.z);
            modelScale.value = maxDim;
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5; // Padding
            camera.position.z = cameraZ;

            // Update camera's near and far planes
            camera.near = cameraZ / 100;
            camera.far = cameraZ * 100;
            camera.updateProjectionMatrix();

            if (controls.value) {
              controls.value.target.set(0, size.y / 2, 0);
              controls.value.update();
            }

            scene.add(gltf.scene);
            loading.value = false;
            resolve(gltf);
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              loadingProgress.value = Math.round(
                (xhr.loaded / xhr.total) * 100,
              );
            }
          },
          (error) => {
            console.error("Error loading model: ", error);
            loading.value = false;
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error("Error loading model: ", error);
      loading.value = false;
      throw error;
    }
  };

  /**
   * Fetch model URL and load model
   */
  const fetchAndLoadModel = async (
    modelId: string,
    editing: boolean,
    fileRef?: File,
  ) => {
    loading.value = true;
    try {
      const url = await modelStore.getObjectUrl(modelId, editing, fileRef);
      return await loadModel(url);
    } catch (error) {
      console.error("Error fetching model URL: ", error);
      toastStore.showToast("error", "Failed to load 3D model");
      loading.value = false;
      throw error;
    }
  };

  /**
   * Animation loop
   */
  const animate = () => {
    if (renderer.value) {
      controls.value?.update();
      renderer.value.render(scene, camera);
    }
  };

  /**
   * Handle window resizing
   */
  const handleResize = () => {
    if (!container.value || !renderer.value) {
      return;
    }

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.value.setSize(width, height);
  };

  /**
   * Clean up resources
   */
  const cleanup = () => {
    modelMeshes.value.forEach((mesh) => {
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      disposeMaterials(mesh.material);
    });
    modelMeshes.value = [];

    // Remove model from scene
    if (model.value) {
      scene.remove(model.value);
      model.value = null;
    }

    // Dispose controls
    if (controls.value) {
      controls.value.dispose();
      controls.value = null;
    }

    // Remove lights
    scene.remove(ambientLight.value);
    scene.remove(directionalLight);

    // Clear scene
    while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);
    }

    // Dispose renderer
    if (renderer.value) {
      const domElement = renderer.value.domElement;
      if (domElement && domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      cleanRenderer(renderer.value);
    }
  };

  /**
   * Helper functions
   */
  const disposeMaterials = (material: THREE.Material | THREE.Material[]) => {
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose());
    } else {
      material.dispose();
    }
  };

  const cleanRenderer = (renderer: THREE.WebGLRenderer) => {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    model,
    modelMeshes,
    ambientLight,
    directionalLight,
    loading,
    loadingProgress,
    objectUrl,
    init,
    loadModel,
    fetchAndLoadModel,
    animate,
    handleResize,
    cleanup,
    modelScale,
  };
};
