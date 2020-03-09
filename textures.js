function initTextures(n) {
    // Clear <canvas>

    let images = ['resources/wall.jpg',
        'resources/sky.jpg',
        'resources/stone.jpg',
        'resources/bark.jpg',
        'resources/leaf.jpg',
        'resources/brick.png',
        'resources/sky-2.jpg'];
    let texArr = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7];


    images.forEach(function (source, idx, imgArray) {
        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return false;
        }

        var image = new Image();  // Create the image object
        if (!image) {
            console.log('Failed to create the image object');
            return false;
        }
        // Register the event handler to be called on loading an image
        image.onload = function () {
            loadTexture(gl, n, texture, u_Sampler, image, texArr[idx]);
        };
        // Tell the browser to load an image
        image.crossOrigin = "anonymous";
        image.src = source;
    });
    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image, texID) {
    textNum++;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(texID);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    if (textNum === 7) {
        document.onkeydown = function (ev) {
            keydown(ev, gl, n,);
        };
        var tick = function () {
            // Clear color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            lastTexID = -1;
            currentAngle = animate(currentAngle);  // Update the rotation angle
            currentLightAngle = animateLight(currentLightAngle);  // Update the rotation angle
            animalAngle = animateAnimal(animalAngle);

            lightMatrix.setRotate(-currentLightAngle, 0, 0, 1);
            let lp = lightMatrix.multiplyVector3(lightPos);
            gl.uniform3f(u_LightPosition, lp.elements[0], lp.elements[1], lp.elements[2]);

            var n = initVertexBuffers(gl);
            if (n < 0) {
                console.log('Failed to set the vertex information');
                return;
            }
            // drawCube(gl, currentAngle, n, {"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":1}}, [0, 0, 0], [1, 1, 1]);
            // drawCube(gl, currentAngle + 90, n, {"type":0,"shininess":230,"rgb":{"red":0,"green":0,"blue":1}}, [0, 1, 0], [1, 1, 1]);
            drawCube(gl, 0, n, {"type":0,"shininess":230,"rgb":{"red":.2,"green":.5,"blue":0}}, [-16, -1,-16 ], [32, 1, 32],{});
            // drawCube(gl, 0, n, {"type":1,"texID":1,"shininess":230,"rgb":{"red":0,"green":0,"blue":1}}, [-16, -1, -16], [32, 10, 32]);

            // drawCube(gl, 0, n, {"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":0}}, [0, 0, 0], [10, 0.05, 0.05]);
            // drawCube(gl, 0, n, {"type":0,"shininess":230,"rgb":{"red":0,"green":1,"blue":0}}, [0, 0, 0], [0.05, 10, 0.05]);
            // drawCube(gl, 0, n, {"type":0,"shininess":230,"rgb":{"red":0,"green":0,"blue":1}}, [0, 0, 0], [0.05, 0.05, 10]);

            draw(n);
            console.log(animalAngle);
            drawAnimal({"x":1,"y":0,"z":1},n,currentAngle+45,currentAngle);

            var j = initSphereVertexBuffers(gl);
            if (j < 0) {
                console.log('Failed to set the vertex information');
                return;
            }

            drawSphere(gl, 0.0, j, {"type":0,"shininess":1,"rgb":{"red":.6,"green":.6,"blue":1.0}}, [0, 0, 0], [32, 10, 32],{});

            // drawSphere(gl, currentAngle + 90, j, {"type":0,"shininess":230,"rgb":{"red":.7,"green":.5,"blue":0}}, [0, 1, 0], [1, 1, 1]);
            // drawSphere(gl, currentAngle, j, {"type":0,"shininess":230,"rgb":{"red":0,"green":.5,"blue":.7}}, [2, 1, 0], [1, 1, 1]);

            requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
        };
        tick();

    }
}