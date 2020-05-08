import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/GLTFLoader.js';
var mixer;
var model;
var action;

function main(){

    var boxId = 1;

    var loader = new THREE.TextureLoader();
    loader.setPath( './resources/' );

    var textureCube = loader.load( 'container.png' );

    var box = function(id){
        const box_data = {
            selected: false,
            id:id,
            select: function(){this.selected = true; this.colorHex =  this.boxMesh.material.color.getHex(); this.boxMesh.material.color.setHex(0xCA0000);},
            unselect: function(){this.selected = false; this.boxMesh.material.color.setHex(0xCA0000);},
        };
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial( { map: textureCube } );
        var box = new THREE.Mesh( geometry, material );
        box.position.set(0,0.5,0);
        box.userData = box_data;
        box_data.boxMesh = box;
        return box;
    }


    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z = -15;
    camera.position.y = 10;
    camera.lookAt(0,0,10);

    //------Renderer--------------------------------------
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#808080");
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);


    //-----Light---------------------------------------------
    var directLight = new THREE.DirectionalLight(0xffffff, 1);
    var ambientLight = new THREE.AmbientLight( 0x00B3C3, 1);
    directLight.position.set(0, 30, 10);
    directLight.target.position.set(0,0,0);
    scene.add(directLight);
    scene.add(ambientLight);


    //------------Environment---------------------------------
    var ground = new THREE.BoxGeometry(20, 0.01, 20);
    var rightWall = new THREE.BoxGeometry(0.01, 2, 20);
    var leftWall = new THREE.BoxGeometry(0.01, 2, 20);
    var frontWall = new THREE.BoxGeometry(20, 2, 0.01);

    var material = new THREE.MeshPhongMaterial( { color: "#C32200" } );
    var material2 = new THREE.MeshPhongMaterial( { color: "#00B3C3" } );
    var material3 = new THREE.MeshPhongMaterial( { color: "#009604" } );


    var groundMesh = new THREE.Mesh( ground, material );
    var rightWallMesh = new THREE.Mesh( rightWall, material2 );
    var leftWallMesh = new THREE.Mesh( leftWall, material2 );
    var frontWallMesh = new THREE.Mesh( frontWall, material3 );

    rightWallMesh.position.set(-9.5, 0 ,0)
    leftWallMesh.position.set(9.5, 0 ,0)
    frontWallMesh.position.set(0,0,9.5);
    //----------------------------------------------------------


    scene.add(groundMesh);
    scene.add(rightWallMesh);
    scene.add(leftWallMesh);
    scene.add(frontWallMesh);

    var mainbox = box(0);   
    scene.add(mainbox);

    var raycaster = new THREE.Raycaster();
    var selectedObject = null;
    var pickedObject = null;
    var mouseDown = false
    var newbox;
    var boxCreated = false;

    document.addEventListener("mousedown", function(event){

        mouseDown = true;

        var mousePos = getRelativePosition(event);
        raycaster.setFromCamera(mousePos, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if(intersects[0].object.userData.id > 0){
            pickedObject = intersects[0].object;
        }

    });

    document.addEventListener("mouseup", function(event){

        mouseDown = false;
        var mousePos = getRelativePosition(event);
        raycaster.setFromCamera(mousePos, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);

        for (var i = 0; i < intersects.length; i++) {
            var intersectsData = intersects[i].object.userData;
            if(intersectsData.selected){
                intersectsData.unselect();
            }
            
        }
        if(selectedObject){
            selectedObject.userData.unselect();
        }
        selectedObject = null;
        newbox = null;
        boxCreated = false;
    }); 

    
    document.addEventListener("mousemove", function(event){

        var mousePos = getRelativePosition(event);
        raycaster.setFromCamera(mousePos, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if(!boxCreated & mouseDown & intersects[0].object.userData.id == 0){

            newbox = box(boxId++);
            scene.add(newbox);
            boxCreated = true;
        }
        if(!boxCreated & mouseDown &  intersects[0].object.userData.id > 0){
            pickedObject.position.set(clamp(intersects[0].point.x, -9, 9) , 0.5, clamp(intersects[0].point.z, -9, 9));
        }
        if(mouseDown & boxCreated){
            newbox.position.set(clamp(intersects[0].point.x, -9, 9) , 0.5, clamp(intersects[0].point.z, -9, 9));
            selectedObject = pickedObject = newbox;
        }
        
    }        
    );
    document.addEventListener("keyup", function(event){
    
        action.stop();
    
    });

    document.addEventListener("keydown", function(event){

        if(mouseDown){
            switch(event.keyCode){
                case 37:    //Left
                    pickedObject.rotation.y -= 0.3;
                    break;
                case 38:    //Up
                    pickedObject.rotation.x += 0.3;
                    break;
                case 39:    //Right
                    pickedObject.rotation.y += 0.3;
                    break;
                case 40:    //Down
                    pickedObject.rotation.x -= 0.3;
                    break;
            }
        }
        action.play();

        if(!mouseDown){
            switch(event.keyCode){
                case 87:
                    model.rotation.z = 0;
                    model.position.z += 0.1;
                    break;
                case 83:
                    model.rotation.z = 3;
                    model.position.z -= 0.1;
                    break;
                case 68:
                    model.rotation.z = -1.5;
                    model.position.x -= 0.1;
                    break;
                case 65:
                    model.rotation.z = 1.5;
                    model.position.x += 0.1;
                    break;
                
            }
        }

    });

    var previousTime = 0;
   
    function loop(time) {
        time = time/1000;
        var deltaTime = time - previousTime;
        previousTime = time;

        requestAnimationFrame(loop);
        renderer.render(scene, camera);
        if(mixer) mixer.update( deltaTime );

    }
    model = loadModel(scene);

    loop(0);
    scene.background = getEnvMap();
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

function getBoxPosition(event){

    let position = {};
    position.x =- (event.clientX - window.innerWidth/2)/55;
    position.y = - (event.clientY - window.innerHeight/2)/38;

    return position;
    
}

function getEnvMap() {
    let path = './resources/skybox/';
    let format = '.jpg';
    let urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    let loader = new THREE.CubeTextureLoader();
    let envMap = loader.load( urls );
    envMap.format = THREE.RGBFormat;
    envMap.encoding = THREE.sRGBEncoding;
    return envMap;
  }

function getRelativePosition(event) {
    event.preventDefault();
    let mouse = {};
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    return mouse;
}

function loadModel(scene){
    let loader = new GLTFLoader();
    loader.load( './resources/models/man/CesiumMan.gltf', gltf => {
      model = gltf.scene.children[ 0 ];
      const animation = gltf.animations[ 0 ];
      mixer = new THREE.AnimationMixer( model );
      action = mixer.clipAction( animation );
      model.position.set(2,3,0);
      scene.add( model );
    });
  }
main();