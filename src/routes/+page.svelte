<script lang="ts">
    import { onMount } from "svelte";
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

    const clock = new THREE.Clock();

    let posData = [];
    let lookAtLock = false;
    let videoElement;
    let canvasBuffer;
    let canvasBufferCtx;
    let threeCanvas;
    let planeTexture;
    let planeMat;
    let plane;

    onMount(() => {

        /*
        canvasBufferCtx = canvasBuffer.getContext('2d', {willReadFrequently: true});

        canvasBufferCtx.fillStyle = "#FF0000";
        canvasBufferCtx.drawRect(0, 0, 10, 10);
        */

        // Check if the browser supports the MediaDevices API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Access the webcam
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    // Set the video source to the webcam stream
                    videoElement.srcObject = stream;
                    videoElement.play()
                    planeTexture = new THREE.VideoTexture( videoElement );
                    // planeTexture.needsUpdate = true;
                    planeMat = new THREE.MeshBasicMaterial({
                        map: planeTexture, 
                        side: THREE.DoubleSide, 
                        transparent: true
                    });
                    // planeTexture.minFilter = THREE.LinearFilter;
                    // planeTexture.magFilter = THREE.LinearFilter;
                    // planeTexture.format = THREE.RGBFormat;
                    

                })
                .catch(function(error) {
                    console.error('Error accessing webcam:', error);
                });
            } else {
                console.error('MediaDevices API not supported by the browser');
            }

        // drawVideoToCanvas();


        /* -- WebSocket stuff  */
        const ws = new WebSocket('ws://localhost:8080');
        setTimeout(() => {
            ws.send('hi');
        }, 1000);

        // == on Websocket message.. == 
        ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            posData = data;
        };

        document.addEventListener('keydown', (e) => {
            // console.log(e.key);
            switch(e.key){
                case 'z':
                    lookAt();
                    break;
            }
        });
        
        // == Camera ==
        const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.z = 3;
        camera.position.y = 1;

        const scene = new THREE.Scene();
        const helper = new THREE.GridHelper(10, 10, 'red', 'white');
        scene.add(helper);

        // == Capture plane ==
        const planeGeo = new THREE.PlaneGeometry(2 , 1);

        plane = new THREE.Mesh( planeGeo, planeMat );
        scene.add(plane);
        plane.position.y = .5;
        // == 3d Rotating Cube ==
        // const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        // const material = new THREE.MeshNormalMaterial();

        // const mesh = new THREE.Mesh( geometry, material );
        // scene.add( mesh );

        let alphaOn = false;
        const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: alphaOn } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setAnimationLoop( animation );
        threeCanvas.appendChild( renderer.domElement );
        

        /* -- Controls -- */
        // Orbit Controls
        const controls = new OrbitControls( camera, renderer.domElement );
        
        //First Person Controls
        const FPcontrols = new FirstPersonControls( camera, renderer.domElement );
        FPcontrols.lookSpeed = .3;
        FPcontrols.activeLook = false;

        // animation
        function animation( time ) {
            // mesh.rotation.x = time / 2000;
            // mesh.rotation.y = time / 1000;
            if(posData.length && lookAtLock){
                plane.position.x = posData[1] * 3;
                plane.position.z = (posData[3] * -2) + 2;
                FPcontrols.lookAt(posData[1], posData[2]-.8, posData[3]);
            }
            // camera.rotation.y += .01;

            FPcontrols.update(clock.getDelta());
            renderer.render( scene, camera );

        }
    });

    function lookAt(){
        lookAtLock = true;
    }

    function drawVideoToCanvas(){
        // canvasBufferCtx.drawImage(videoElement, 0, 0, 300, 200);
        // replaceGreenWithAlpha(canvasBuffer);
        window.requestAnimationFrame(drawVideoToCanvas);
    }

    function replaceGreenWithAlpha(canvas) {
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        
        for (var i = 0; i < data.length; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];
            
            // Check if the pixel is green (you can adjust the threshold as needed)
            if (green > 100 && red < 100 && blue < 100) {
            // Set the alpha channel to 0 (transparent)
            data[i + 3] = 0;
            }
        }
        
        context.putImageData(imageData, 0, 0);
    }


</script>

<div>
    <video bind:this={videoElement} />
    <!-- <canvas bind:this={canvasBuffer} /> -->
    <div bind:this={threeCanvas}></div>
</div>

<style>
body{
    padding: 0px;
    margin: 0px;
}

video{
    width: 300px;
}
</style>