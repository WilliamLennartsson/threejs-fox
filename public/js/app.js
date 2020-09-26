import * as THREE from './dependencies/three.module.js'
import { GLTFLoader } from './dependencies/GLTFLoader.js'

// Path to model
const dataPath = '../models/glTF/Fox.gltf'

// Three objects
let scene, camera, renderer, mixer, loader, clock

// GLTF Model
let fox // Scene
let gltfFox // Full gltf object

// Animation vars
const foxAnimations = ["Survey", "Walk", "Run"] // All avaliable animations
let animationIndex = 2
let activeAnimation

// For mouse events
let isPressingDown = false
const keysPressed = {
    'W': false,
    'S': false,
    'A': false,
    'D': false
}

window.onload = () => {
    init()
}

window.onmousedown = () => {
    isPressingDown = true
    console.log("Down")

    nextAnimation()
}

window.onmouseup = () => {
    isPressingDown = false
    console.log("Up")
}

window.onmousemove = (e) => {
    if (!isPressingDown) return
    console.log('e', e)
    // console.log("Move")
    // camera.rotation.y += 1
    // console.log('camera.rotation.y', camera.rotation.y)
}

window.onkeydown = (e) => {
    if (e.keyCode == 65) { // A
        keysPressed['A'] = true
    } else if (e.keyCode == 83) { // S
        keysPressed['S'] = true
    } else if (e.keyCode == 68) { // D
        keysPressed['D'] = true
    } else if (e.keyCode == 87) { // W
        keysPressed['W'] = true
    }
}

window.onkeyup = (e) => {
    if (e.keyCode == 65) { // A
        keysPressed['A'] = false
    } else if (e.keyCode == 83) { // S
        keysPressed['S'] = false
    } else if (e.keyCode == 68) { // D
        keysPressed['D'] = false
    } else if (e.keyCode == 87) { // W
        keysPressed['W'] = false
    }
}

const rotateFox = () => {
    if (fox == undefined || fox == null) return
    fox.rotation.y += 0.005
    renderer.render(scene, camera)
    requestAnimationFrame(rotateFox)
}

function init() {
    // Clock setup
    clock = new THREE.Clock()
    // Loader setup
    loader = new GLTFLoader()

    // Scene setup
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x222222)

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    // camera.rotation.y = 45 / 180 * Math.PI
    camera.rotation.x = -0.2
    camera.rotation.y = 0
    camera.position.x = 0
    camera.position.y = 200
    camera.position.z = 800

    // Lights setup
    const ambiLight = new THREE.AmbientLight(0x404040, 100)
    scene.add(ambiLight)
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 100)
    // directionalLight.position.set(0, 1, 0)
    // directionalLight.castShadow = true
    // scene.add(directionalLight)
    const light1 = new THREE.PointLight(0xc4c4c4, 10)
    light1.position.set(0, 300, 500)
    scene.add(light1)
    const light2 = new THREE.PointLight(0xc4c4c4, 10)
    light2.position.set(500, 100, 0)
    scene.add(light2)

    // Renderer setup
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)


    loader.load(dataPath, function (gltf) {

        gltfFox = gltf
        fox = gltf.scene.children[0]
        fox.material = new THREE.MeshLambertMaterial()
        fox.scale.set(4, 4, 4)
        fox.position.z = 300

        fox.rotation.y = 45
        scene.add(gltf.scene)
        console.log('gltf', gltf)
        // Animation
        mixer = new THREE.AnimationMixer(gltf.scene);
        nextAnimation()

        // Render
        renderer.render(scene, camera)
        // Start update loop
        requestAnimationFrame(update)

    }, undefined, function (error) {
        console.error(error)
    })
}

const nextAnimation = () => {
    if (activeAnimation) activeAnimation.stop()
    animationIndex++
    if (animationIndex >= foxAnimations.length) animationIndex = 0

    const clip = findAnimation(foxAnimations[animationIndex])
    playAnimation(clip)
}

const findAnimation = (animationName) => {
    var clips = gltfFox.animations;
    return THREE.AnimationClip.findByName(clips, animationName)
}

const playAnimation = (clip) => {
    activeAnimation = mixer.clipAction(clip)
    activeAnimation.play()
}

const update = () => {
    const deltaSeconds = clock.getDelta()
    moveFox()
    mixer.update(deltaSeconds);
    renderer.render(scene, camera)
    requestAnimationFrame(update)
}

function moveFox() {
    var delta = clock.getDelta(); // seconds
    var moveDistance = 500 * delta; // n pixels per second
    var dir = new THREE.Vector3(fox.position.x, fox.position.y, fox.position.z);
    dir.sub(camera.position).normalize(); // direction vector between the camera and the ball
    if (keysPressed['W'] || keysPressed['ARROWUP']) {
        fox.position.x += moveDistance * dir.x;
        fox.position.z += moveDistance * dir.z;
    }
    if (keysPressed['S'] || keysPressed['ARROWDOWN']) {
        fox.position.x -= moveDistance * dir.x;
        fox.position.z -= moveDistance * dir.z;
    }
    if (keysPressed['A'] || keysPressed['ARROWLEFT']) {
        fox.position.x -= moveDistance * 0.2;
    }
    if (keysPressed['D'] || keysPressed['ARROWRIGHT']) {
        fox.position.x += moveDistance * 0.2;
    }
}
