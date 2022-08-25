import '../styles/styles.css'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import Game from './game'

window.onload = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(renderer.domElement);

    // create an instance of our Game class
    // to initialise and manage the game itself
    const gameInstance = new Game(scene, camera);

    function animate() {
        requestAnimationFrame(animate);
        // directly call the game instance method to
        // be agnostic of all details
        gameInstance.update();
        renderer.render(scene, camera);
    }
    animate();
}












// const scene = new THREE.Scene()
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    


// const renderer = new THREE.WebGLRenderer({
//     canvas: document.querySelector('.webgl')
// })
// renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.setClearColor(0xffffff)
// document.body.appendChild(renderer.domElement);


// // Instantiate a loader
// const loader = new GLTFLoader();

// // Optional: Provide a DRACOLoader instance to decode compressed mesh data


// // Load a glTF resource
// loader.load(
// 	// resource URL
// 	'player.gltf',
// 	// called when the resource is loaded
// 	function ( gltf ) {

// 		scene.add( gltf.scene );

		
		
		
		
		

// 	},
// 	// called while loading is progressing
// 	function ( xhr ) {

// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// 	},
// 	// called when loading has errors
// 	function ( error ) {

// 		console.log( 'An error happened' );

// 	}
// );


// // Renderer
// camera.position.z = 6
// camera.position.y = 3
// camera.position.x = 1

// /**
//  * Loop
//  */
// const animate = () =>
// {
//     window.requestAnimationFrame(animate)
//     // Update
    

//     // Render
//     renderer.render(scene, camera)
// }
// animate()