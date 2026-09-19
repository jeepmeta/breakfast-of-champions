/**
 * Self-contained Three.js + Cannon-es dice table.
 * Adapted from https://codepen.io/Mant0uStudio/pen/ZYWywJB (physics / feel).
 * Branded for Wafflr: cream canvas, amber/pink/emerald dice, 1–5 count.
 * Controlled via window.wafflrSetCount / wafflrRoll; results postMessage to RN.
 */
export const PHYSICS_DICE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #FFF8EB; }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; }
</style>
<script type="importmap">
{
  "imports": {
    "three": "https://esm.sh/three@0.160.0",
    "three/addons/": "https://esm.sh/three@0.160.0/examples/jsm/",
    "cannon-es": "https://esm.sh/cannon-es@0.20.0"
  }
}
</script>
</head>
<body>
<script type="module">
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";

let scene, camera, renderer, world;
let diceObjects = [];
let needsResultCheck = false;
let isRolling = false;
const FRUSTUM_SIZE = 22;

// Wafflr brand palette
const palette = [
  "#F59E0B", "#EC4899", "#10B981", "#FBBF24",
  "#F472B6", "#34D399", "#FFFFFF", "#D97706"
];
const commonColors = {
  dots: "#FFFFFF",
  outline: "#1E293B",
  shadow: "#F59E0B"
};

function post(msg) {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  } catch (e) {}
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#FFF8EB");

  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  camera = new THREE.OrthographicCamera(
    (FRUSTUM_SIZE * aspect) / -2,
    (FRUSTUM_SIZE * aspect) / 2,
    FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / -2,
    1,
    1000
  );
  camera.position.set(50, 50, 50);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.touchAction = "none";
  document.body.appendChild(renderer.domElement);

  world = new CANNON.World();
  world.gravity.set(0, -40, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 20;
  world.allowSleep = true;

  const wallMat = new CANNON.Material("wall");
  const diceMat = new CANNON.Material("dice");
  world.addContactMaterial(
    new CANNON.ContactMaterial(wallMat, diceMat, {
      friction: 0.3,
      restitution: 0.6,
    })
  );

  createPhysicsWalls(wallMat);
  updateDiceCount(1);

  window.addEventListener("resize", onWindowResize);
  post({ type: "ready" });
  animate();
}

function createPhysicsWalls(material) {
  const floorBody = new CANNON.Body({ mass: 0, material });
  floorBody.addShape(new CANNON.Plane());
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  const wallDistance = 11;
  const createWall = (x, z, rot) => {
    const body = new CANNON.Body({ mass: 0, material });
    body.addShape(new CANNON.Plane());
    body.position.set(x, 0, z);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot);
    world.addBody(body);
  };
  createWall(wallDistance, 0, -Math.PI / 2);
  createWall(-wallDistance, 0, Math.PI / 2);
  createWall(0, -wallDistance, 0);
  createWall(0, wallDistance, Math.PI);
}

function createVectorDiceTexture(number, colorHex) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, size, size);

  // soft bevel highlight
  const grd = ctx.createLinearGradient(0, 0, size, size);
  grd.addColorStop(0, "rgba(255,255,255,0.35)");
  grd.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const isWhite = colorHex === "#FFFFFF";
  let dotColor = commonColors.dots;
  if (isWhite) {
    dotColor = number === 1 || number === 4 ? "#E11D48" : "#1E293B";
  }
  ctx.fillStyle = dotColor;
  const dotSize = size / 5;
  const current = isWhite && number === 1 ? dotSize * 1.45 : dotSize;
  const center = size / 2;
  const q1 = size / 4;
  const q3 = (size * 3) / 4;
  function drawDot(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, current / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (number === 1) drawDot(center, center);
  else if (number === 2) { drawDot(q1, q1); drawDot(q3, q3); }
  else if (number === 3) { drawDot(q1, q1); drawDot(center, center); drawDot(q3, q3); }
  else if (number === 4) { drawDot(q1, q1); drawDot(q3, q1); drawDot(q1, q3); drawDot(q3, q3); }
  else if (number === 5) { drawDot(q1, q1); drawDot(q3, q1); drawDot(center, center); drawDot(q1, q3); drawDot(q3, q3); }
  else if (number === 6) { drawDot(q1, q1); drawDot(q3, q1); drawDot(q1, center); drawDot(q3, center); drawDot(q1, q3); drawDot(q3, q3); }
  return new THREE.CanvasTexture(canvas);
}

function updateDiceCount(count) {
  count = Math.max(1, Math.min(5, count | 0));
  diceObjects.forEach((obj) => {
    scene.remove(obj.mesh);
    scene.remove(obj.outline);
    scene.remove(obj.shadow);
    world.removeBody(obj.body);
    if (obj.mesh.material) {
      obj.mesh.material.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
  diceObjects = [];
  needsResultCheck = false;
  isRolling = false;

  const boxSize = 2.5;
  const geometry = new RoundedBoxGeometry(boxSize, boxSize, boxSize, 4, 0.4);
  const outlineGeo = geometry.clone();
  const shadowGeo = new THREE.CircleGeometry(boxSize * 0.6, 32);
  const shape = new CANNON.Box(new CANNON.Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
  const outlineMat = new THREE.MeshBasicMaterial({
    color: commonColors.outline,
    side: THREE.BackSide,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    color: commonColors.shadow,
    transparent: true,
    opacity: 0.22,
  });

  for (let i = 0; i < count; i++) {
    const randomColor = palette[i % palette.length];
    const diceMaterials = [];
    for (let j = 1; j <= 6; j++) {
      diceMaterials.push(
        new THREE.MeshBasicMaterial({ map: createVectorDiceTexture(j, randomColor) })
      );
    }
    const matArray = [
      diceMaterials[0], diceMaterials[5], diceMaterials[1],
      diceMaterials[4], diceMaterials[2], diceMaterials[3],
    ];
    const mesh = new THREE.Mesh(geometry, matArray);
    scene.add(mesh);

    const outline = new THREE.Mesh(outlineGeo, outlineMat);
    outline.scale.setScalar(1.06);
    scene.add(outline);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone());
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    scene.add(shadow);

    const startX = (i - (count - 1) / 2) * 3.2;
    const body = new CANNON.Body({
      mass: 5,
      shape,
      position: new CANNON.Vec3(startX, boxSize + 0.2, 0),
      sleepSpeedLimit: 0.5,
    });
    body.quaternion.setFromEuler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    world.addBody(body);
    diceObjects.push({ mesh, outline, shadow, body });
  }
  post({ type: "count", count });
}

function applyThrowForce(body) {
  const xDist = -body.position.x;
  const zDist = -body.position.z;
  body.velocity.set(
    xDist * 1.4 + (Math.random() - 0.5) * 14,
    8 + Math.random() * 12,
    zDist * 1.4 + (Math.random() - 0.5) * 14
  );
  body.angularVelocity.set(
    (Math.random() - 0.5) * 32,
    (Math.random() - 0.5) * 32,
    (Math.random() - 0.5) * 32
  );
}

function rollDice() {
  if (isRolling) return;
  isRolling = true;
  needsResultCheck = false;
  post({ type: "rolling" });

  diceObjects.forEach((obj, i) => {
    const body = obj.body;
    body.wakeUp();
    // lift + scatter then throw
    const startX = (i - (diceObjects.length - 1) / 2) * 2.8;
    body.position.set(
      startX + (Math.random() - 0.5) * 1.5,
      10 + Math.random() * 4,
      (Math.random() - 0.5) * 2
    );
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
    applyThrowForce(body);
  });

  setTimeout(() => {
    needsResultCheck = true;
  }, 600);
}

function calculateResult() {
  let total = 0;
  const details = [];
  const faceNormals = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
  ];
  const faceValues = [1, 6, 2, 5, 3, 4];

  diceObjects.forEach(({ mesh }) => {
    let maxDot = -Infinity;
    let resultValue = 1;
    faceNormals.forEach((normal, index) => {
      const worldNormal = normal.clone().applyQuaternion(mesh.quaternion);
      if (worldNormal.y > maxDot) {
        maxDot = worldNormal.y;
        resultValue = faceValues[index];
      }
    });
    total += resultValue;
    details.push(resultValue);
  });

  needsResultCheck = false;
  isRolling = false;
  post({ type: "result", total, details });
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  for (let i = 0; i < diceObjects.length; i++) {
    const { mesh, outline, shadow, body } = diceObjects[i];
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    outline.position.copy(mesh.position);
    outline.quaternion.copy(mesh.quaternion);
    shadow.position.x = body.position.x;
    shadow.position.z = body.position.z;
    const height = Math.max(0, body.position.y - 1);
    const scale = Math.max(0.5, 1 - height * 0.04);
    const opacity = Math.max(0, 0.22 - height * 0.01);
    shadow.scale.setScalar(scale);
    shadow.material.opacity = opacity;
  }

  if (needsResultCheck) {
    let allStopped = true;
    for (const o of diceObjects) {
      if (
        o.body.velocity.lengthSquared() > 0.12 ||
        o.body.angularVelocity.lengthSquared() > 0.12
      ) {
        allStopped = false;
        break;
      }
    }
    if (allStopped) calculateResult();
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  camera.left = (-FRUSTUM_SIZE * aspect) / 2;
  camera.right = (FRUSTUM_SIZE * aspect) / 2;
  camera.top = FRUSTUM_SIZE / 2;
  camera.bottom = -FRUSTUM_SIZE / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.wafflrSetCount = updateDiceCount;
window.wafflrRoll = rollDice;

init();
</script>
</body>
</html>`;
