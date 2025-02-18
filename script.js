import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from 'lil-gui';
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import fireFlyVertex from "./shaders/fireFly/vertex.glsl"
import fireFlyFragment from "./shaders/fireFly/fragment.glsl"
import portalVertex from "./shaders/portal/vertex.glsl"
import portalFragment from "./shaders/portal/fragment.glsl"


// html element
const overlay = document.getElementById("overlay")
const loadingbar = document.getElementById("barloading")


// load gui
const gui = new GUI()
gui.hide()
gui.close()
const debugObject = {}



// find canvas element
const canvas = document.getElementById("canvas")



// scene
const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// axes helper
// const axesHelper = new THREE.AxesHelper(1)
// scene.add(axesHelper)

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
if (sizes.width > 760) {
    camera.position.z = 2.5
    camera.position.x = 1.5
    camera.position.y = 1
} else {
    camera.position.z = 4
    camera.position.x = 3.5
    camera.position.y = 1.5
}
scene.add(camera)


// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// loading manager
const loadingManager = new THREE.LoadingManager(
    () => {
        setTimeout(() => {
            loadingbar.style.transformOrigin = `center`
        }, 2000);
        setTimeout(() => {
            loadingbar.style.transform = `scale(0)`
        }, 3000);
        setTimeout(() => {
            overlay.style.opacity = `0`
        }, 3500);
        setTimeout(() => {
            overlay.style.transform = `scale(0)`
            gui.show()
        }, 4500);
    },
    (itemUrl, itemsLoaded, totalItem) => {
        setTimeout(() => {
            loadingbar.style.transform = `scale(${itemsLoaded / totalItem})`
        }, 500);
    }
)



// texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

const bakedTexture = textureLoader.load("statics/baked2k.jpg")
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

// gltf loader
const gltfLoader = new GLTFLoader(loadingManager)


// material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// light Material for model
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffeb })


debugObject.startColor = "#6f0166"
debugObject.endColor = "#fdf7fb"
const portalMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertex,
    fragmentShader: portalFragment,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uStartColor: new THREE.Uniform(new THREE.Color(debugObject.startColor)),
        uEndColor: new THREE.Uniform(new THREE.Color(debugObject.endColor)),
    }
})

gui.addColor(debugObject, "startColor").name("startColorPortal").onChange(() => {
    portalMaterial.uniforms.uStartColor.value = new THREE.Color(debugObject.startColor)
})
gui.addColor(debugObject, "endColor").name("endColorPortal").onChange(() => {
    portalMaterial.uniforms.uEndColor.value = new THREE.Color(debugObject.endColor)
})


// model
gltfLoader.load('statics/protableSceneMerged.glb', (gltf) => {

    const bakedMesh = gltf.scene.children.find((child) => child.name == "Cube052")
    const portalLight = gltf.scene.children.find((child) => child.name == "portalLight")
    const poleLightA = gltf.scene.children.find((child) => child.name == "poleLightA")
    const poleLightB = gltf.scene.children.find((child) => child.name == "poleLightB")


    bakedMesh.material = bakedMaterial
    portalLight.material = portalMaterial
    poleLightA.material = poleLightMaterial
    poleLightB.material = poleLightMaterial

    scene.add(gltf.scene)
})


// fireFlies
const firefliesGeometery = new THREE.BufferGeometry()
debugObject.countParticle = 30
const positionArray = new Float32Array(debugObject.countParticle * 3)
const scaleArray = new Float32Array(debugObject.countParticle)

for (let i = 0; i < debugObject.countParticle; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}

firefliesGeometery.setAttribute("position", new THREE.BufferAttribute(positionArray, 3))
firefliesGeometery.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1))

const fireFliesMaterial = new THREE.ShaderMaterial({
    vertexShader: fireFlyVertex,
    fragmentShader: fireFlyFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
        uSize: new THREE.Uniform(100),
        uSpeed: new THREE.Uniform(1),
        uFrequency: new THREE.Uniform(100),
        uAmpilitude: new THREE.Uniform(0.2)
    }
})

gui.add(fireFliesMaterial.uniforms.uSize, "value").min(0).max(500).step(1).name("fireFliesSize")
gui.add(fireFliesMaterial.uniforms.uSpeed, "value").min(0).max(100).step(1).name("fireFliesSpeed")
gui.add(fireFliesMaterial.uniforms.uFrequency, "value").min(0).max(500).step(1).name("fireFliesFrequency")
gui.add(fireFliesMaterial.uniforms.uAmpilitude, "value").min(0).max(10).step(0.01).name("fireFliesAmpilitude")

const fireFliesMesh = new THREE.Points(firefliesGeometery, fireFliesMaterial)
scene.add(fireFliesMesh)

// renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = "#1a1a1a"
renderer.setClearColor(debugObject.clearColor)

gui.addColor(debugObject, "clearColor").onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})


// tick function

const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // update material
    fireFliesMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime


    // update control
    controls.update()

    // update renderer
    renderer.render(scene, camera)

    // request frame
    requestAnimationFrame(tick)
}

tick()


window.addEventListener("resize", () => {
    // update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // update material
    fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)


    // update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


})