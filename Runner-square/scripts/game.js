import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Game {
  OBSTACLE_PREFAB = new THREE.BoxBufferGeometry(1, 1, 1);
  OBSTACLE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xccdeee });

  constructor(scene, camera) {
    // initialize variables
    this.speedZ = 20;
    this.speedX = 0;
    this.translateX = 0;
    // prepare 3D scene
    this._initializeScene(scene, camera);
    // bind event callbacks
    document.addEventListener("keydown", this._keydown.bind(this));
    document.addEventListener("keyup", this._keyup.bind(this));
  }

  update() {
    // recompute the game state
    this.time += this.clock.getDelta();

    this.translateX += this.speedX * -0.1;

    this._updateGrid();
    this._checkCollisions();
    this._updateInfoPanel();
  }

  _keydown(event) {
    let newSpeedX;
    switch (event.key) {
      case "ArrowLeft":
        newSpeedX = -2.0;
        break;
      case "a":
        newSpeedX = -2.0;
        break;
      case "ArrowRight":
        newSpeedX = 2.0;
        break;
      case "d":
        newSpeedX = 2.0;
        break;
      default:
        return;
    }

    this.speedX = newSpeedX;
  }

  _keyup() {
    this.speedX = 0;
  }

  _updateGrid() {
    this.grid.material.uniforms.time.value = this.time;
    this.objectsParent.position.z = this.speedZ * this.time;
    this.grid.material.uniforms.translateX.value = this.translateX;
    this.objectsParent.position.x = this.translateX;

    this.objectsParent.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // position in world space
        const childZPos = child.position.z + this.objectsParent.position.z;
        if (childZPos > 0) {
          // reset the object
          this._setupObstacle(
            child,
            this.ship.position.x,
            -this.objectsParent.position.z
          );
        }
      }
    });
  }

  _checkCollisions() {
    // check obstacles
    // check bonuses
  }

  _updateInfoPanel() {
    // update DOM elements to show the
    // current state of the game
    // (traveled distance, score, lives...)
  }

  _gameOver() {
    // show "end state" UI
    // reset instance variables for a new game
  }

_createShip(scene) {
    const loader = new GLTFLoader();
    // called when the resource is loaded
    loader.load(
      // resource URL
    "player.gltf",
      // called when the resource is loaded
    function (ship) {
        scene.add(ship.scene);
        
    

    
	
    })
    this.ship = new THREE.Group();
}

  _createGrid(scene) {
    this.speedZ = 50;

    let divisions = 30;
    let gridLimit = 100;
    this.grid = new THREE.GridHelper(
      gridLimit * 2,
      divisions,
      0xccddee,
      0xccddee
    );

    const moveableX = [];
    const moveableZ = [];
    for (let i = 0; i <= divisions; i++) {
      moveableX.push(0, 0, 1, 1); // move vertical lines only (1 - point is moveable)
      moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
    }
    this.grid.geometry.setAttribute(
      "moveableX",
      new THREE.BufferAttribute(new Uint8Array(moveableX), 1)
    );
    this.grid.geometry.setAttribute(
      "moveableZ",
      new THREE.BufferAttribute(new Uint8Array(moveableZ), 1)
    );

    this.grid.material = new THREE.ShaderMaterial({
      uniforms: {
        speedZ: {
          value: this.speedZ,
        },
        translateX: {
          value: this.translateX,
        },
        gridLimits: {
          value: new THREE.Vector2(-gridLimit, gridLimit),
        },
        time: {
          value: 0,
        },
      },
      vertexShader: `
                uniform float time;
                uniform vec2 gridLimits;
                uniform float speedZ;
                uniform float translateX;
                
                attribute float moveableX;
                attribute float moveableZ;
                
                
            
                void main() {
               
                float limLen = gridLimits.y - gridLimits.x;
                vec3 pos = position;
                if (floor(moveableX + 0.5) > 0.5) { // if a point has "moveableX" attribute = 1 
                    float xDist = translateX;
                    float curXPos = mod((pos.x + xDist) - gridLimits.x, limLen) + gridLimits.x;
                    pos.x = curXPos;
                }
                if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
                    float zDist = speedZ * time;
                    float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
                    pos.z = curZPos;
                }
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            // `,
      // fragmentShader: `
      //     varying vec3 vColor;

      //     void main() {
      //     gl_FragColor = vec4(vColor, 1.); // r, g, b channels + alpha (transparency)
      //     }
      // `,
      // vertexColors: THREE.VertexColors
    });

    scene.add(this.grid);

    this.time = 0;
    this.clock = new THREE.Clock();
  }

  _initializeScene(scene, camera) {
    this._createShip(scene);
    this._createGrid(scene);

    this.objectsParent = new THREE.Group();
    scene.add(this.objectsParent);

    for (let i = 0; i < 10; i++) {
      this._obstacle();
    }

    camera.rotateX((-20 * Math.PI) / 180);
    camera.position.set(0, 1.5, 2);
  }

  _obstacle() {
    // create geometry
    const obj = new THREE.Mesh(this.OBSTACLE_PREFAB, this.OBSTACLE_MATERIAL);

    this._setupObstacle(obj);
    this.objectsParent.add(obj);
  }

  _setupObstacle(obj, refXPos = 0, refZPos = 0) {
    // random scale
    obj.scale.set(
      this._randomFloat(0.5, 2),
      this._randomFloat(0.5, 2),
      this._randomFloat(0.5, 2)
    );
    // random position
    obj.position.set(
      refXPos + this._randomFloat(-30, 30),
      obj.scale.y * 0.5,
      refZPos - 100 - this._randomFloat(0, 100)
    );
  }

  _randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
}

export default Game;
