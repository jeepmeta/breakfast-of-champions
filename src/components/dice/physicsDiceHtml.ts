/**
 * Three.js + Cannon-es dice table.
 * Felt noise floor, tight walls — dice stay in frame.
 */
export const PHYSICS_DICE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #145A40; touch-action: none; }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; }
  #hint {
    position: absolute; left: 14px; bottom: 16px;
    pointer-events: none; z-index: 5;
    display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
    opacity: 1; transition: opacity 0.25s;
  }
  #hint.hide { opacity: 0; }
  .bubble {
    background: rgba(255,255,255,0.92);
    border: 2px solid #F9A8D4;
    border-radius: 18px;
    padding: 8px 12px;
    box-shadow: 0 6px 16px rgba(190,24,93,0.18);
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 800; font-size: 12px; color: #9D174D;
  }
  .arrows { display: flex; gap: 4px; padding-left: 6px; }
  .arrows span {
    display: inline-block; color: #EC4899; font-size: 16px; font-weight: 900;
    animation: pulse 1s ease-in-out infinite;
  }
  .arrows span:nth-child(2) { animation-delay: 0.12s; }
  .arrows span:nth-child(3) { animation-delay: 0.24s; }
  @keyframes pulse {
    0%, 100% { transform: translate(0,0); opacity: 0.45; }
    50% { transform: translate(5px, -5px); opacity: 1; }
  }
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
<div id="hint">
  <div class="bubble">Swipe to roll</div>
  <div class="arrows"><span>↗</span><span>↗</span><span>↗</span></div>
</div>
<script type="module">
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";

let scene, camera, renderer, world;
let diceObjects = [];
let needsResultCheck = false;
let isRolling = false;
let settleFrames = 0;
let forceTimer = null;
let resultPosted = false;

const FRUSTUM_SIZE = 24;
const WALL = 7.2;
const CLAMP = 6.5;
const BOX = 1.65;
const IDLE_ORIGIN = { x: -3.8, z: 3.2, y: BOX / 2 + 0.08 };
const FORCE_SETTLE_MS = 2600;

const CAM_RIGHT = new THREE.Vector3(0.707, 0, -0.707);
const CAM_FWD = new THREE.Vector3(-0.707, 0, -0.707);

const palette = [
  "#F59E0B", "#EC4899", "#10B981", "#FBBF24",
  "#F472B6", "#34D399", "#FFFFFF", "#D97706"
];
const commonColors = { dots: "#FFFFFF", outline: "#1E293B", shadow: "#0a2e22" };
const hintEl = document.getElementById("hint");

const FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
];
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

function post(msg) {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  } catch (e) {}
}

function setHintVisible(v) {
  if (!hintEl) return;
  if (v) hintEl.classList.remove("hide");
  else hintEl.classList.add("hide");
}

function createFeltTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size*0.75);
  g.addColorStop(0, "#2D8A64");
  g.addColorStop(0.55, "#1B6B4A");
  g.addColorStop(1, "#0F4530");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 32;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n * 0.7));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 0.55));
  }
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, 0);
    ctx.lineTo(Math.random() * size, size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function addFeltFloor() {
  const geo = new THREE.PlaneGeometry(48, 48);
  const mat = new THREE.MeshBasicMaterial({ map: createFeltTexture() });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.001;
  scene.add(mesh);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#145A40");
  addFeltFloor();

  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  camera = new THREE.OrthographicCamera(
    (FRUSTUM_SIZE * aspect) / -2,
    (FRUSTUM_SIZE * aspect) / 2,
    FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / -2,
    1,
    1000
  );
  camera.position.set(52, 52, 52);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.touchAction = "none";
  document.body.appendChild(renderer.domElement);

  world = new CANNON.World();
  world.gravity.set(0, -52, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 28;
  world.allowSleep = true;

  const wallMat = new CANNON.Material("wall");
  const diceMat = new CANNON.Material("dice");
  world.addContactMaterial(
    new CANNON.ContactMaterial(wallMat, diceMat, {
      friction: 0.55,
      restitution: 0.22,
    })
  );

  createPhysicsWalls(wallMat);
  updateDiceCount(2);
  bindSwipe();

  window.addEventListener("resize", onWindowResize);
  post({ type: "ready" });
  animate();
}

function createPhysicsWalls(material) {
  const floorBody = new CANNON.Body({ mass: 0, material });
  floorBody.addShape(new CANNON.Plane());
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  const ceil = new CANNON.Body({ mass: 0, material });
  ceil.addShape(new CANNON.Plane());
  ceil.position.set(0, 14, 0);
  ceil.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
  world.addBody(ceil);

  const createWall = (x, z, rot) => {
    const body = new CANNON.Body({ mass: 0, material });
    body.addShape(new CANNON.Plane());
    body.position.set(x, 0, z);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot);
    world.addBody(body);
  };
  createWall(WALL, 0, -Math.PI / 2);
  createWall(-WALL, 0, Math.PI / 2);
  createWall(0, -WALL, 0);
  createWall(0, WALL, Math.PI);
}

function createVectorDiceTexture(number, colorHex) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, size, size);
  const grd = ctx.createLinearGradient(0, 0, size, size);
  grd.addColorStop(0, "rgba(255,255,255,0.35)");
  grd.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const isWhite = colorHex === "#FFFFFF";
  let dotColor = commonColors.dots;
  if (isWhite) dotColor = number === 1 || number === 4 ? "#E11D48" : "#1E293B";
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

function placeIdle(body, i) {
  const col = i % 3;
  const row = Math.floor(i / 3);
  body.position.set(
    IDLE_ORIGIN.x + col * (BOX + 0.25),
    IDLE_ORIGIN.y + row * (BOX + 0.15),
    IDLE_ORIGIN.z + row * 0.35
  );
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
  body.quaternion.setFromEuler(0, (i * 0.4) % Math.PI, 0);
  body.sleep();
}

function updateDiceCount(count) {
  count = Math.max(1, Math.min(6, count | 0));
  clearForceTimer();
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
  settleFrames = 0;
  resultPosted = false;

  const geometry = new RoundedBoxGeometry(BOX, BOX, BOX, 4, 0.32);
  const outlineGeo = geometry.clone();
  const shadowGeo = new THREE.CircleGeometry(BOX * 0.5, 32);
  const shape = new CANNON.Box(new CANNON.Vec3(BOX / 2, BOX / 2, BOX / 2));
  const outlineMat = new THREE.MeshBasicMaterial({
    color: commonColors.outline,
    side: THREE.BackSide,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    color: commonColors.shadow,
    transparent: true,
    opacity: 0.35,
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
    outline.scale.setScalar(1.05);
    scene.add(outline);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone());
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    scene.add(shadow);

    const body = new CANNON.Body({
      mass: 4,
      shape,
      sleepSpeedLimit: 0.25,
      linearDamping: 0.22,
      angularDamping: 0.28,
    });
    placeIdle(body, i);
    world.addBody(body);
    diceObjects.push({ mesh, outline, shadow, body });
  }
  setHintVisible(true);
  post({ type: "count", count });
  post({ type: "idle" });
}

function clearForceTimer() {
  if (forceTimer) {
    clearTimeout(forceTimer);
    forceTimer = null;
  }
}

function applySwipeForce(body, sx, sy, strength) {
  const s = Math.max(0.5, Math.min(1.75, strength));
  const vx = CAM_RIGHT.x * sx * 14 * s + CAM_FWD.x * sy * 14 * s;
  const vz = CAM_RIGHT.z * sx * 14 * s + CAM_FWD.z * sy * 14 * s;
  body.velocity.set(
    vx + (Math.random() - 0.5) * 2,
    6.5 + 5 * s + Math.random() * 2,
    vz + (Math.random() - 0.5) * 2
  );
  body.angularVelocity.set(
    (Math.random() - 0.5) * 26 * s,
    (Math.random() - 0.5) * 26 * s,
    (Math.random() - 0.5) * 26 * s
  );
}

function clampBody(body) {
  let x = body.position.x;
  let z = body.position.z;
  let y = body.position.y;
  let hit = false;
  if (x > CLAMP) { x = CLAMP; body.velocity.x = -Math.abs(body.velocity.x) * 0.35; hit = true; }
  if (x < -CLAMP) { x = -CLAMP; body.velocity.x = Math.abs(body.velocity.x) * 0.35; hit = true; }
  if (z > CLAMP) { z = CLAMP; body.velocity.z = -Math.abs(body.velocity.z) * 0.35; hit = true; }
  if (z < -CLAMP) { z = -CLAMP; body.velocity.z = Math.abs(body.velocity.z) * 0.35; hit = true; }
  if (y > 10) { y = 10; body.velocity.y = -Math.abs(body.velocity.y) * 0.2; hit = true; }
  if (y < BOX / 2) y = BOX / 2;
  if (hit) {
    body.position.set(x, y, z);
    body.angularVelocity.scale(0.85);
  }
}

function bestFaceIndex(mesh) {
  let maxDot = -Infinity;
  let idx = 2;
  FACE_NORMALS.forEach((normal, index) => {
    const worldNormal = normal.clone().applyQuaternion(mesh.quaternion);
    if (worldNormal.y > maxDot) {
      maxDot = worldNormal.y;
      idx = index;
    }
  });
  return idx;
}

function snapFlat(obj) {
  const idx = bestFaceIndex(obj.mesh);
  const localUp = FACE_NORMALS[idx].clone();
  const q = new THREE.Quaternion().setFromUnitVectors(
    localUp,
    new THREE.Vector3(0, 1, 0)
  );
  const yaw = Math.atan2(
    2 * (obj.mesh.quaternion.y * obj.mesh.quaternion.w),
    1 - 2 * (obj.mesh.quaternion.y * obj.mesh.quaternion.y)
  );
  const yawQ = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    yaw * 0.15
  );
  q.premultiply(yawQ);

  obj.body.velocity.set(0, 0, 0);
  obj.body.angularVelocity.set(0, 0, 0);
  obj.body.position.y = BOX / 2;
  obj.body.quaternion.set(q.x, q.y, q.z, q.w);
  obj.mesh.quaternion.copy(q);
  obj.mesh.position.copy(obj.body.position);
  obj.outline.quaternion.copy(q);
  obj.outline.position.copy(obj.mesh.position);
  obj.body.sleep();
}

function forceSettleAll() {
  if (resultPosted) return;
  diceObjects.forEach(snapFlat);
  finishResult();
}

function castSwipe(dx, dy, speed) {
  if (isRolling) return;
  const len = Math.hypot(dx, dy) || 1;
  const sx = dx / len;
  const sy = -dy / len;
  const strength = Math.max(0.5, Math.min(1.7, speed / 900));

  isRolling = true;
  needsResultCheck = false;
  settleFrames = 0;
  resultPosted = false;
  setHintVisible(false);
  post({ type: "rolling" });
  clearForceTimer();

  diceObjects.forEach((obj) => {
    const body = obj.body;
    body.wakeUp();
    body.position.x += (Math.random() - 0.5) * 0.35;
    body.position.y = Math.max(body.position.y, BOX + 0.6);
    body.position.z += (Math.random() - 0.5) * 0.35;
    applySwipeForce(
      body,
      sx + (Math.random() - 0.5) * 0.1,
      sy + (Math.random() - 0.5) * 0.1,
      strength
    );
  });

  setTimeout(() => { needsResultCheck = true; }, 450);
  forceTimer = setTimeout(forceSettleAll, FORCE_SETTLE_MS);
}

function resetTable() {
  clearForceTimer();
  needsResultCheck = false;
  isRolling = false;
  settleFrames = 0;
  resultPosted = false;
  diceObjects.forEach((obj, i) => placeIdle(obj.body, i));
  setHintVisible(true);
  post({ type: "idle" });
}

function isSettledFlat(body, mesh) {
  const lin = body.velocity.lengthSquared();
  const ang = body.angularVelocity.lengthSquared();
  if (lin > 0.06 || ang > 0.06) return false;
  if (body.position.y > BOX / 2 + 0.28) return false;
  const idx = bestFaceIndex(mesh);
  const up = FACE_NORMALS[idx].clone().applyQuaternion(mesh.quaternion);
  return up.y > 0.94;
}

function finishResult() {
  if (resultPosted) return;
  resultPosted = true;
  needsResultCheck = false;
  isRolling = false;
  clearForceTimer();

  let total = 0;
  const details = [];
  diceObjects.forEach(({ mesh }) => {
    const idx = bestFaceIndex(mesh);
    const v = FACE_VALUES[idx];
    total += v;
    details.push(v);
  });
  post({ type: "result", total, details });
}

function bindSwipe() {
  let startX = 0, startY = 0, startT = 0, tracking = false;

  const onStart = (x, y) => {
    if (isRolling) return;
    tracking = true;
    startX = x;
    startY = y;
    startT = performance.now();
  };
  const onEnd = (x, y) => {
    if (!tracking || isRolling) return;
    tracking = false;
    const dx = x - startX;
    const dy = y - startY;
    const dt = Math.max(16, performance.now() - startT);
    const dist = Math.hypot(dx, dy);
    if (dist < 24) return;
    const speed = (dist / dt) * 1000;
    castSwipe(dx, dy, speed);
  };

  window.addEventListener("touchstart", (e) => {
    if (e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    if (t) onEnd(t.clientX, t.clientY);
  });
  window.addEventListener("mousedown", (e) => onStart(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e) => onEnd(e.clientX, e.clientY));
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  for (let i = 0; i < diceObjects.length; i++) {
    const { mesh, outline, shadow, body } = diceObjects[i];
    clampBody(body);
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    outline.position.copy(mesh.position);
    outline.quaternion.copy(mesh.quaternion);
    shadow.position.x = body.position.x;
    shadow.position.z = body.position.z;
    const height = Math.max(0, body.position.y - 1);
    shadow.scale.setScalar(Math.max(0.5, 1 - height * 0.04));
    shadow.material.opacity = Math.max(0, 0.35 - height * 0.01);
  }

  if (needsResultCheck && !resultPosted) {
    let allFlat = true;
    for (const o of diceObjects) {
      if (!isSettledFlat(o.body, o.mesh)) {
        allFlat = false;
        break;
      }
    }
    if (allFlat) {
      settleFrames += 1;
      if (settleFrames >= 6) {
        diceObjects.forEach(snapFlat);
        finishResult();
      }
    } else {
      settleFrames = 0;
    }
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
window.wafflrReset = resetTable;
window.wafflrSwipe = castSwipe;

init();
</script>
</body>
</html>`;
