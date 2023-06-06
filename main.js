import * as THREE from "three";
import "./style.css";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const sand = new THREE.TextureLoader().load("./assets/sand.jpg");
sand.wrapS = THREE.RepeatWrapping;
sand.wrapT = THREE.RepeatWrapping;
sand.repeat.set(10, 10);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc2e5ee);

const planeGeometry = new THREE.BoxGeometry(10, 0.2, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  map: sand,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
scene.add(plane);

let cactus;
const loader = new GLTFLoader();
loader.load("./assets/cactus.glb", (glb) => {
  glb.scene.scale.setScalar(0.17);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  cactus = glb.scene;
  scene.add(glb.scene);
});

let plant;
loader.load("./assets/Small Plant.glb", (glb) => {
  glb.scene.scale.setScalar(1);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  plant = glb.scene;
  scene.add(glb.scene);
});

let rock;
loader.load("./assets/Desert pebble.glb", (glb) => {
  glb.scene.scale.setScalar(15);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  rock = glb.scene;
  scene.add(glb.scene);
});

let ball2;
loader.load("./assets/Tumbleweed.glb", (glb) => {
  glb.scene.scale.setScalar(0.7);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  //   ball = glb.scene;
  ball2 = glb.scene;
  scene.add(glb.scene);
});

let ball;
loader.load("./assets/Tumbleweed.glb", (glb) => {
  glb.scene.scale.setScalar(0.7);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  ball = glb.scene;
  // ball2 = glb.scene;
  scene.add(glb.scene);
});

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0),
});

const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)),
  type: CANNON.Body.STATIC,
  material: groundPhysMat,
});
world.addBody(groundBody);

const spherePhysMat = new CANNON.Material();
const sphereBody = new CANNON.Body({
  mass: 0.2,
  shape: new CANNON.Sphere(0.5),
  position: new CANNON.Vec3(0, 10, 0),
  material: spherePhysMat,
});
const sphereBody2 = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Sphere(0.5),
  position: new CANNON.Vec3(0, 5, 1.5),
  material: spherePhysMat,
});

sphereBody.linearDamping = 0.31;
sphereBody2.linearDamping = 0.31;
sphereBody.angularDamping = 0.31;
sphereBody2.angularDamping = 0.31;
world.addBody(sphereBody);
world.addBody(sphereBody2);

const cactusBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.4, 2, 0.4)),
  position: new CANNON.Vec3(2, 0, 3),
});
world.addBody(cactusBody);

const plantBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.2, 0.4)),
  position: new CANNON.Vec3(1.7, 0.1, 4),
});
world.addBody(plantBody);

const rockBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(1, 0.7, 1)),
  position: new CANNON.Vec3(3.5, 0.5, 3.7),
});
world.addBody(rockBody);

const groundSphereContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  spherePhysMat,
  { restitution: 0.6, friction: 0.02 }
);
world.addContactMaterial(groundSphereContactMat);
const timeStep = 1 / 60;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemiLight.position.set(2000, 200, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 4, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

const boom = new THREE.Group();
boom.add(camera);
camera.position.set(0, 4, 10);
camera.lookAt(0, 0, 0);
scene.add(boom);

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(2);
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.render(scene, camera);

const loop = () => {
  window.requestAnimationFrame(loop);
  world.step(timeStep);

  plane.position.copy(groundBody.position);
  plane.quaternion.copy(groundBody.quaternion);
  if (ball) {
    ball.position.copy(sphereBody.position);
    ball.quaternion.copy(sphereBody.quaternion);
  }
  if (ball2) {
    ball2.position.copy(sphereBody2.position);
    ball2.quaternion.copy(sphereBody2.quaternion);

    camera.lookAt(ball2.position.x, ball2.position.y, ball2.position.z);
    boom.position.copy(ball2.position);
  }
  if (cactus) {
    cactus.position.copy(cactusBody.position);
    cactus.quaternion.copy(cactusBody.quaternion);
  }
  if (plant) {
    plant.position.copy(plantBody.position);
    plant.quaternion.copy(plantBody.quaternion);
  }
  if (rock) {
    rock.position.copy(rockBody.position);
    rock.quaternion.copy(rockBody.quaternion);
  }

  renderer.render(scene, camera);
};
loop();

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.updateProjectionMatrix();
  camera.aspect = sizes.width / sizes.height;
  renderer.setSize(sizes.width, sizes.height);
});

window.onmousemove = (e) => {
  boom.rotation.y = THREE.MathUtils.lerp(
    boom.rotation.y,
    -(e.clientX * Math.PI) / 600 - window.innerWidth / 2,
    0.5
  );
};

let keysMap = {};
window.onkeydown = (e) => {
  keysMap[e.key] = e.type == "keydown";
};
window.onkeyup = (e) => {
  keysMap[e.key] = e.type == "keydown";
};
let i = 0;
window.addEventListener("keydown", (e) => {
  let vectorX = 0,
    vectorY = 0,
    vectorZ = 0;

  if (keysMap["w"]) vectorZ = -1;
  if (keysMap["s"]) vectorZ = 1;
  if (keysMap["a"]) vectorX = -1;
  if (keysMap["d"]) vectorX = 1;
  if (keysMap[" "]) {
    i++;
    vectorY = 6;
  }

  sphereBody2.applyImpulse(new CANNON.Vec3(vectorX / 2, vectorY, vectorZ / 2));
});
