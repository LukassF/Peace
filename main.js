import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//loading sand textures
const sand = new THREE.TextureLoader().load("./assets/sand.jpg");
sand.wrapS = THREE.RepeatWrapping;
sand.wrapT = THREE.RepeatWrapping;
sand.repeat.set(10, 10);

//creating a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc2e5ee);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//adding lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemiLight.position.set(2000, 200, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 10, 8);
dirLight.castShadow = true;
scene.add(dirLight);

//adding camera and its boom
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

const boom = new THREE.Group();
boom.add(camera);
camera.position.set(0, 4, 9);
camera.lookAt(0, 0, 0);
scene.add(boom);

//applying scene to the canvas
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(1);
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.render(scene, camera);

//Creating ground geometry
const planeGeometry = new THREE.BoxGeometry(10, 0.2, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  map: sand,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
scene.add(plane);

//function for loading static models
const getModel = (url, scale, bodyPosition, bodyQuaternion) => {
  const loader = new GLTFLoader();
  loader.load(`./assets/${url}.glb`, (glb) => {
    glb.scene.scale.setScalar(scale);
    glb.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    glb.scene.position.copy(bodyPosition);
    glb.scene.quaternion.copy(bodyQuaternion);
    scene.add(glb.scene);
  });
};
const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);

const loaderOverlay = document.getElementById("loading");
const overlayContent = document.getElementById("overlay-content");
loadingManager.onLoad = () => {
  setTimeout(() => {
    loaderOverlay.style.display = "none";
    overlayContent.style.opacity = "1";
  }, 500);
  setTimeout(() => {
    overlayContent.style.opacity = "0";
  }, 2500);
};

//underside of the island
loader.load("./assets/underside.glb", (glb) => {
  glb.scene.scale.setScalar(11);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  glb.scene.rotateZ(Math.PI);
  glb.scene.position.set(0, -0.2, 0);
  scene.add(glb.scene);
});

//player model (not static)
let player;
loader.load("./assets/Tumbleweed.glb", (glb) => {
  glb.scene.scale.setScalar(0.7);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
  player = glb.scene;
  scene.add(glb.scene);
});

//Object model (not static)
let object;
loader.load("./assets/Desert pebble.glb", (glb) => {
  glb.scene.scale.setScalar(7);
  glb.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });

  object = glb.scene;
  scene.add(glb.scene);
});

//CANNON

//CANNON world creation
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0),
});

//ground physical body
const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)),
  type: CANNON.Body.STATIC,
  material: groundPhysMat,
});
world.addBody(groundBody);

//boulder physical body
const objectPhysMat = new CANNON.Material();
const objectBody = new CANNON.Body({
  mass: 0.05,
  shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.3, 0.4)),
  position: new CANNON.Vec3(0, 5, 0),
  material: objectPhysMat,
});

objectBody.linearDamping = 0.31;
objectBody.angularDamping = 0.31;
world.addBody(objectBody);

//player/ tumbleweed physical body
const spherePhysMat = new CANNON.Material();
const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Sphere(0.5),
  position: new CANNON.Vec3(0, 5, 1.5),
  material: spherePhysMat,
});
playerBody.linearDamping = 0.31;
playerBody.angularDamping = 0.31;
world.addBody(playerBody);

//cactus physical body
const cactusBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.4, 2.5, 0.4)),
  position: new CANNON.Vec3(2, 0, 3),
});
world.addBody(cactusBody);

//second cactus physical body
const cactusBody2 = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.3, 2, 0.3)),
  position: new CANNON.Vec3(-4, 0, -1),
});
world.addBody(cactusBody2);

//plant physical body
const plantBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.2, 0.4)),
  position: new CANNON.Vec3(1.7, 0.1, 4),
});
world.addBody(plantBody);

//big rock physical body
const rockBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(1, 0.7, 1)),
  position: new CANNON.Vec3(3.5, 0.5, 3.7),
});
world.addBody(rockBody);

//tent physical body
const tentBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(1, 0.6, 1.2)),
  position: new CANNON.Vec3(-3, 0.8, -3.2),
});
tentBody.quaternion.set(0, 0.2, 0, 1);
world.addBody(tentBody);

//bonfire physical body
const bonfireBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.1, 0.2)),
  position: new CANNON.Vec3(-2.1, 0.15, -1.6),
});
world.addBody(bonfireBody);

//gold rocks formation physical body
const goldRocksBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(1.4, 0.9, 1)),
  position: new CANNON.Vec3(3, 0.12, 0.6),
});
goldRocksBody.quaternion.set(0, 0.5, 0, 1);
world.addBody(goldRocksBody);

//Contact material between player and ground
const groundSphereContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  spherePhysMat,
  { restitution: 0.5, friction: 0.02 }
);
world.addContactMaterial(groundSphereContactMat);

//Contact material between boulder/ object and ground
const groundObjectContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  objectPhysMat,
  { restitution: 0.2, friction: 0.01 }
);
world.addContactMaterial(groundObjectContactMat);

//adding clock
const timeStep = 1 / 60;

//loading all static models
getModel("Cactus", 0.17, cactusBody.position, cactusBody.quaternion);
getModel("Small Plant", 1, plantBody.position, plantBody.quaternion);
getModel("Desert pebble", 15, rockBody.position, rockBody.quaternion);
getModel("Tent", 1.2, tentBody.position, tentBody.quaternion);
getModel("Bonfire", 2.5, bonfireBody.position, bonfireBody.quaternion);
getModel("Cactus", 0.12, cactusBody2.position, cactusBody2.quaternion);
getModel("Gold Rocks", 7, goldRocksBody.position, goldRocksBody.quaternion);

let result = 0;
let canJump = true;
const resultDisplay = document.getElementById("result-display");

//instructions running in a recursive function
const loop = () => {
  window.requestAnimationFrame(loop);
  world.step(timeStep);

  plane.position.copy(groundBody.position);
  plane.quaternion.copy(groundBody.quaternion);
  if (object) {
    object.position.copy(objectBody.position);
    object.quaternion.copy(objectBody.quaternion);

    if (object.position.y < -10) {
      scene.remove(object);
      objectBody.position.set(0, 7, 0);
      addButton.disabled = false;
      result++;
      resultDisplay.innerText = `${result} boulders dumped!`;
    }
  }
  if (player) {
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);
    camera.lookAt(player.position.x, player.position.y, player.position.z);
    boom.position.copy(player.position);

    if (playerBody.position.y < -10) {
      playerBody.position.set(0, 2, 1.5);
    }
    if (
      playerBody.velocity.y <= 0.1 &&
      playerBody.position.y <= 3 &&
      playerBody.position.y > 0 &&
      Math.abs(playerBody.position.x) < 5 &&
      Math.abs(playerBody.position.z) < 5
    )
      canJump = true;
  }
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.updateProjectionMatrix();
  camera.aspect = sizes.width / sizes.height;
  renderer.render(scene, camera);
};
loop();

//camera rotation on mouse movement
window.onmousemove = (e) => {
  boom.rotation.y = THREE.MathUtils.lerp(
    boom.rotation.y,
    -(
      (((e.clientX * Math.PI) / 600) * window.screen.width) /
      window.innerWidth
    ) -
      window.innerWidth / 2,
    0.5
  );
};

//Keys array to account for multiple keys pressed at once
let keysMap = {};
window.onkeydown = (e) => {
  keysMap[e.key] = e.type == "keydown";
};
window.onkeyup = (e) => {
  keysMap[e.key] = e.type == "keydown";
};

//WSAD movement
window.addEventListener("keydown", () => {
  const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

  if (keysMap["w"])
    playerBody.applyImpulse(
      new CANNON.Vec3(cameraDirection.x, 0, cameraDirection.z)
    );
  if (keysMap["s"])
    playerBody.applyImpulse(
      new CANNON.Vec3(-cameraDirection.x, 0, -cameraDirection.z)
    );
  if (keysMap["a"])
    playerBody.applyImpulse(
      new CANNON.Vec3(cameraDirection.z, 0, -cameraDirection.x)
    );
  if (keysMap["d"])
    playerBody.applyImpulse(
      new CANNON.Vec3(-cameraDirection.z, 0, cameraDirection.x)
    );
  if (keysMap[" "] && canJump)
    playerBody.applyImpulse(new CANNON.Vec3(0, 6, 0));
  canJump = false;
});

//declaration of an overlaying div
const overlay = document.getElementById("overlay");

//Function for changing a time of day (in game :) )
const changeTime = (timeOfDay) => {
  switch (timeOfDay) {
    case "noon":
      //using gsap for smooth animations
      gsap.to(dirLight.position, {
        x: 0,
        y: 10,
        z: 8,
        duration: 0.3,
      });
      scene.background.lerpColors(
        scene.background,
        new THREE.Color(0xc2e5ee),
        1
      );
      overlay.style.backgroundColor = "transparent";
      break;
    case "sunset":
      gsap.to(dirLight.position, {
        x: 0,
        y: 3,
        z: -13,
        duration: 0.3,
      });
      scene.background.lerpColors(
        scene.background,
        new THREE.Color(0xf86e39),
        1
      );
      overlay.style.backgroundColor = "rgba(243, 156, 42, 0.2)";
      break;
    case "night":
      gsap.to(dirLight.position, {
        x: 0,
        y: 4,
        z: 7,
        duration: 0.3,
      });
      scene.background.lerpColors(
        scene.background,
        new THREE.Color(0x07011f),
        1
      );
      overlay.style.backgroundColor = "rgba(0, 0, 0,0.5)";
      break;
    default:
      return;
  }
};

//declaration of remaining buttons
const sunsetButton = document.getElementById("sunset");
const nightButton = document.getElementById("night");
const noonButton = document.getElementById("noon");
const addButton = document.getElementById("add-object-button");

sunsetButton.addEventListener("click", () => changeTime("sunset"));
nightButton.addEventListener("click", () => changeTime("night"));
noonButton.addEventListener("click", () => changeTime("noon"));

//Preventing multiple boulders being rendered simultaneously
addButton.addEventListener("click", () => {
  addButton.disabled = true;
  objectBody.position.set(0, 7, 0);
  scene.add(object);
});
