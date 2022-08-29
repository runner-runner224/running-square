import * as THREE from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Game {

    OBSTACLE_PREFAB =   new THREE.BoxBufferGeometry(1, 1, 1)
    OBSTACLE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xccdeee })
    COLLISION_THRESHOLD = 0.2

    constructor(scene, camera) {
        this.distance = document.getElementById('distance-number')

        this.gameOverPage = document.getElementById('game-over-page')
        this.gameOverDistance = document.getElementById('total-distance')

      // bind event callbacks
        document.getElementById("start-button").onclick =() =>{
        this.running = true;
        document.getElementById('start-page').style.display = 'none';
        }

        document.getElementById("restart-button").onclick =() =>{
        this.running = true;
        this.gameOverPage.style.display = 'none'
        }

        this.scene = scene
        this.camera = camera
        this._reset(false)

        document.addEventListener('keydown', this._keydown.bind(this));
        document.addEventListener('keyup', this._keyup.bind(this));
    }
    
    update() {
        // recompute the game state
        if(!this.running)
        return;
        this.time += this.clock.getDelta()

        this.translateX += this.speedX * -0.1

        this._updateGrid();
        this._checkCollisions();
        this._updateInfoPanel();
    }
    
    _keydown(event) {
        let newSpeedX;
        switch (event.key) {
            case 'ArrowLeft':
                newSpeedX = -2.0;
                break;
            case 'a':
                newSpeedX = -2.0;
                break;
            case 'ArrowRight':
                newSpeedX = 2.0;
                break;
            case 'd':
                newSpeedX = 2.0;
                break;
            default:
                return;
        }

        this.speedX = newSpeedX
    }
    
    _keyup() {
        this.speedX = 0
    }

    _updateGrid() {
        this.grid.material.uniforms.time.value = this.time
        this.objectsParent.position.z = this.speedZ * this.time
        this.grid.material.uniforms.translateX.value = this.translateX
        this.objectsParent.position.x = this.translateX
        

        this.objectsParent.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // position in world space
                const childZPos = child.position.z + this.objectsParent.position.z
                if (childZPos > 0) {
                    // reset the object
                    this._setupObstacle(child, this.ship.position.x, - this.objectsParent.position.z)
                }
            }
        })
    }

    _checkCollisions() {
        this.objectsParent.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // position in world space
                const childZPos = child.position.z + this.objectsParent.position.z
                
                // threshold distances
                const thresholdX = this.COLLISION_THRESHOLD + child.scale.x /2
                const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z /2

                if ( childZPos > - thresholdZ && Math.abs(child.position.x + this.translateX) < thresholdX) {
                    // collision
                    this.health -= 1
                    console.log("health:" , this.health)
                    this._setupObstacle(child, this.ship.position.x, - this.objectsParent.position.z)
                    if (this.health < 1) 
                        this._gameOver()
                    
                }
            }
        })
    }

    _updateInfoPanel() {
        this.distance.innerText = this.objectsParent.position.z.toFixed(0)
    }

    _gameOver() {
        this.running = false
        this.gameOverDistance.innerText = this.objectsParent.position.z.toFixed(0)
        this.gameOverPage.style.display = 'grid'
        this._reset(true)
    }

    _reset(restart) {
        // initialize variables
        this.running = false;
        this.speedZ = 70
        this.speedX = 0
        this.translateX = 0

        this.health = 1

        this.distance.innerText = 0

        this.time =0
        this.clock = new THREE.Clock()

        // prepare 3D scene
        this._initializeScene(this.scene, this.camera, restart);
    }
    
    _createShip(scene) {
        const loader = new GLTFLoader();
        // called when the resource is loaded
        loader.load(
          // resource URL
        "Untitled.gltf",
          // called when the resource is loaded
        function (ship) {
            scene.add(ship.scene);
            
            
    
        
        
        })
        this.ship = new THREE.Group();
        
    }

    _createGrid(scene) {
        this.speedZ = 70;
    
        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(
            gridLimit * 2,
            divisions,
            0x000000,
            0x000000);

        const moveableX = [];
        const moveableZ = [];
        for (let i = 0; i <= divisions; i++) {
        moveableX.push(0, 0, 1, 1); // move vertical lines only (1 - point is moveable)
        moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }
        this.grid.geometry.setAttribute('moveableX', new THREE.BufferAttribute(new Uint8Array(moveableX), 1));
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));

        this.grid.material = new THREE.ShaderMaterial({
            uniforms: {
                speedZ: {
                    value: this.speedZ
                },
                translateX: {
                    value: this.translateX
                },
                gridLimits: {
                    value: new THREE.Vector2(-gridLimit, gridLimit)
                },
                time: {
                    value: 0
                }
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
            
        });

        scene.add(this.grid);
    }


    _initializeScene(scene, camera, restart) {
        if (!restart){
            this._createShip(scene);
            this._createGrid(scene);
    
            this.objectsParent = new THREE.Group()
            scene.add(this.objectsParent)
    
            for (let i = 0; i < 15; i++){
                this._obstacle()
            }
    
            camera.rotateX(-20 * Math.PI / 180);
            camera.position.set(0, 1.5, 2);
        }else {
            this.objectsParent.traverse((item) => {
                if(item instanceof THREE.Mesh) {
                    this._setupObstacle(item)
                } else {
                    item.position.set(0, 0, 0)
                }
            })
        }
    }

    _obstacle() {
        // create geometry
        const obj = new THREE.Mesh(
            this.OBSTACLE_PREFAB,
            this.OBSTACLE_MATERIAL
        )
        
        this._setupObstacle(obj)
        this.objectsParent.add(obj)
    }

    _setupObstacle(obj, refXPos = 0, refZPos = 0) {
        // random scale
        obj.scale.set(
            this._randomFloat(10, 10),
            this._randomFloat(30, 5),
            this._randomFloat(10, 10),
        )
        // random position
        obj.position.set(
            refXPos + this._randomFloat(-30, 30),
            obj.scale.y * 0.5,
            refZPos -100 - this._randomFloat(0, 100)
        )
    }

    _randomFloat(min, max) {
        return Math.random() * (max - min) + min
    }

}

export default Game