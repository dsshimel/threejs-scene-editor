var torusPositions = [[-4, 0, 0],
[0, -2, 1],
[-8, 4, -2],
[-6, 5, -2],
[-4, 6, -2],
[-2, 7, -2],
[8, -2, -2],
[0, 8, -2],
[2, 7, -2],
[-8, -4, -2],
[-8, -2, -2],
[8, 2, -2],
[-8, 2, -2],
[-8, 0, -2],
[4, 6, -2],
[6, 5, -2],
[8, 4, -2],
[0, 0, 2],
[6, -3, -1],
[6, 1, -1],
[-4, -4, -1],
[2, -5, -1],
[-6, -1, -1],
[4, 2, 0],
[4, 0, 0],
[2, -3, 0],
[-4, 2, 0],
[-2, 3, 0],
[2, 3, 0],
[0, 2, 1],
[2, 1, 1],
[-2, -1, 1],
[-2, 1, 1],
[2, -1, 1],
[0, 4, 0],
[-4, -2, 0],
[-2, -3, 0],
[0, -4, 0],
[-4, 4, -1],
[4, -2, 0],
[-2, -5, -1],
[-2, 5, -1],
[4, -4, -1],
[6, -1, -1],
[4, -6, -2],
[0, -6, -1],
[-6, -3, -1],
[-2, -7, -2],
[8, 0, -2],
[6, 3, -1],
[4, 4, -1],
[2, 5, -1],
[0, 6, -1],
[-6, 3, -1],
[-6, -5, -2],
[-4, -6, -2],
[0, -8, -2],
[2, -7, -2],
[6, -5, -2],
[8, -4, -2],
[-6, 1, -1]];

var scene = new THREE.Scene();
var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);
var pointLight = new THREE.PointLight(0xaaaaaa, 1, 100);
scene.add(pointLight);
var width = 0.8 * window.innerWidth;
var height = 0.8 * window.innerHeight;
var camera = new THREE.PerspectiveCamera(45 /* fov */, width / height, 0.1, 1000);

var sceneCanvas = document.getElementById('scene');

var controls = new THREE.OrbitControls(camera, sceneCanvas);
controls.enableKeys = false;

var renderer = new THREE.WebGLRenderer({canvas: sceneCanvas});
renderer.setSize(width, height);

var selectedIndex = null;

var PLANES = ['XY', 'YZ', 'ZX'];
var RIGHT_STEPS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
var UP_STEPS = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)];
var RIGHT_COLORS = [0xff0000, 0x808000, 0x0000ff];
var UP_COLORS = [0x808000, 0x0000ff, 0xff0000];
var ORIGIN = new THREE.Vector3(0, 0, 0);
var planeIndex = 0;
var upLine;
var rightLine;
var updateLines = function() {
  if (upLine) {
    scene.remove(upLine);    
  }
  if (rightLine) {
    scene.remove(rightLine);    
  }
  var v1 = shapes[selectedIndex].position;
  var upGeom = new THREE.Geometry();
  upGeom.vertices[0] = v1;
  upGeom.vertices[1] = v1.clone().add(UP_STEPS[planeIndex].clone().multiplyScalar(2));
  var rightGeom = new THREE.Geometry();
  rightGeom.vertices[0] = v1;
  rightGeom.vertices[1] = v1.clone().add(RIGHT_STEPS[planeIndex].clone().multiplyScalar(2));
  upLine = new THREE.Line(
      upGeom,
      new THREE.LineDashedMaterial({color: UP_COLORS[planeIndex], dashSize: 1, gapSize: 0.5}));
  rightLine = new THREE.Line(
      rightGeom,
      new THREE.LineDashedMaterial({color: RIGHT_COLORS[planeIndex], dashSize: 1, gapSize: 0.5}));
  scene.add(upLine);
  scene.add(rightLine);
};

var selectShapeByIndex = function(index) {
  if (index < 0 || index >= shapes.length) {
    throw new Error('Invalid shape index ' + index);
  }
  scene.remove(wireframes[selectedIndex]);
  selectedIndex = index;
  scene.add(wireframes[selectedIndex]);
  updateLines();
};

var setColorInput = document.getElementById('color-input');
var setColorBtn = document.getElementById('set-color');
setColorBtn.onclick = function(evt) {
  var shape = shapes[selectedIndex];
  var hexColor = getColorFromInput();
  if (hexColor) {
    shape.material.color.setHex(hexColor);
  }
};

var getRandomColor = function() {
  var result = 0;
  var str = '0x';
  for (var i = 6; i > 0; i--) {
    var randInt = Math.floor((Math.random() * 16));    
    result += Math.pow(16, i) * randInt;
    if (randInt < 10) {
      str += randInt;
    } else {
      str += String.fromCharCode(randInt - 10 + 'a'.charCodeAt(0));
    }
  }
  console.log(str);
  return result;
};

var getColorFromInput = function() {
  return parseInt('0x' + setColorInput.value);
};

var shapes = [];
var wireframes = [];
var CUBE = 0;
var CONE = 1;
var TORUS = 2;
var addShape = function(shapeType, x, y, z) {
  x = x || 0;
  y = y || 0;
  z = z || 0;
  var geometry;
  switch (shapeType) {
    case CUBE:
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    case CONE:
      geometry = new THREE.ConeGeometry(1, 1);
      break;
    case TORUS:
      geometry = new THREE.TorusGeometry(1, 0.5);
      break;
    default:
      throw new Error('Unknown shape type ' + shapeType);
  }
  var hexColor = getColorFromInput();
  var material = new THREE.MeshLambertMaterial({color: hexColor ? hexColor : getRandomColor()});
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.position.set(x, y, z);
  shapes.push(mesh);

  var wireframe = new THREE.WireframeGeometry(geometry);
  var wireframeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
  wireframeMaterial.depthTest = false;
  wireframeMaterial.opacity = 0.25;
  wireframeMaterial.transparent = true;
  var lineSegments = new THREE.LineSegments(wireframe, wireframeMaterial);
  lineSegments.position.set(x, y, z);
  wireframes.push(lineSegments);

  if (selectedIndex == null) {
    selectedIndex = 0;
    selectShapeByIndex(selectedIndex);
  }
  return mesh;
};

camera.position.z = 10;

var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var RIGHT_TRANSLATE = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)];
var UP_TRANSLATE = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
var handleKeydown = function(evt) {
  if (selectedIndex == null) {
    return;
  }
  var selected = shapes[selectedIndex];
  var wireframe = wireframes[selectedIndex];
  var rightStep = RIGHT_TRANSLATE[planeIndex];
  var upStep = UP_TRANSLATE[planeIndex];
  switch (evt.keyCode) {
    case KEY_BACKSPACE:
      shapes.splice(selectedIndex, 1);
      wireframes.splice(selectedIndex, 1);
      scene.remove(selected);
      scene.remove(wireframe);
      selectedIndex -= 1;
      if (selectedIndex < 0) {
        if (shapes.length == 0) {
          selectedIndex = null;
          scene.remove(upLine);
          scene.remove(rightLine);
        } else {
          selectedIndex = shapes.length - 1;
          selectShapeByIndex(selectedIndex);
        }
      } else {
        selectShapeByIndex(selectedIndex);
      }
      evt.preventDefault();
      break;
    case KEY_TAB:
      var direction = evt.shiftKey ? -1 : 1;
      selectShapeByIndex((selectedIndex + direction + shapes.length) % shapes.length);
      evt.preventDefault();
      break;
    case KEY_SPACE:
      planeIndex = (planeIndex + 1) % PLANES.length;
      updateLines();
      document.getElementById('current-plane').innerText = 'Current plane: ' + PLANES[planeIndex];
      evt.preventDefault();
      break;
    case KEY_LEFT:
      selected.position.sub(rightStep);
      wireframe.position.sub(rightStep);
      upLine.position.sub(rightStep);
      rightLine.position.sub(rightStep);
      break;
    case KEY_UP:
      selected.position.add(upStep);
      wireframe.position.add(upStep);
      upLine.position.add(upStep);
      rightLine.position.add(upStep);
      break;
    case KEY_RIGHT:
      selected.position.add(rightStep);
      wireframe.position.add(rightStep);
      upLine.position.add(rightStep);
      rightLine.position.add(rightStep);
      break;
    case KEY_DOWN:
      selected.position.sub(upStep);
      wireframe.position.sub(upStep);
      upLine.position.sub(upStep);
      rightLine.position.sub(upStep);
      break;
  };
};
window.addEventListener('keydown', handleKeydown.bind(this));

var addCubeBtn = document.getElementById('add-cube');
addCubeBtn.onclick = function(evt) {
  addShape(CUBE);
};

var addConeBtn = document.getElementById('add-cone');
addConeBtn.onclick = function(evt) {
  addShape(CONE);
};

var addTorusBtn = document.getElementById('add-torus');
addTorusBtn.onclick = function(evt) {
  addShape(TORUS);
};

var torusKandiBtn = document.getElementById('torus-kandi');
torusKandiBtn.onclick = function(evt) {
  for (var i = 0; i < torusPositions.length; i++) {
    var position = torusPositions[i];
    addShape(TORUS, position[0], position[1], position[2]);
  }
};

// Handle clicking on meshes in the scene.
var raycaster = new THREE.Raycaster();
var mouse = null;
var handleMousedown = function(evt) {
  mouse = new THREE.Vector2();
  mouse.x = (evt.clientX / sceneCanvas.clientWidth) * 2 - 1;
  mouse.y = -(evt.clientY / sceneCanvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(shapes); 

  if (intersects.length > 0) {
    var id = intersects[0].object.uuid;
    for (var i = 0; i < shapes.length; i++) {
      if (shapes[i].uuid == id) {
        selectShapeByIndex(i);
        break;
      }
    }
  }
};
window.addEventListener('mousedown', handleMousedown.bind(this));

(function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
})();