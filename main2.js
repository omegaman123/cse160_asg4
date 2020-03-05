// var VSHADER_SOURCE =
//     'attribute vec4 a_Position;\n' +
//     'attribute vec4 a_Color;\n' +
//     'attribute vec4 a_Normal;\n' +
//     'uniform mat4 u_MvpMatrix;\n' +
//     'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
//     'uniform mat4 u_NormalMatrix;\n' +   // Coordinate transformation matrix of the normal
//     'uniform vec3 u_LightColor;\n' +     // Light color
//     'uniform vec3 u_LightPosition;\n' +  // Position of the light source
//     'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
//     'varying vec4 v_Color;\n' +
//     'void main() {\n' +
//     '  gl_Position = u_MvpMatrix * a_Position;\n' +
//     // Recalculate the normal based on the model matrix and make its length 1.
//     '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
//     // Calculate world coordinate of vertex
//     '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
//     // Calculate the light direction and make it 1.0 in length
//     '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
//     // Calculate the dot product of the normal and light direction
//     '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
//     // Calculate the color due to diffuse reflection
//     '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
//     // Calculate the color due to ambient reflection
//     '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
//     // Add the surface colors due to diffuse reflection and ambient reflection
//     '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
//     '}\n';
//
// // Fragment shader program
// var FSHADER_SOURCE =
//     '#ifdef GL_ES\n' +
//     'precision mediump float;\n' +
//     '#endif\n' +
//     'varying vec4 v_Color;\n' +
//     'void main() {\n' +
//     '  gl_FragColor = v_Color;\n' +
//     '}\n';



var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    //  'attribute vec4 a_Color;\n' + // Defined constant in main()
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_MvMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
    'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_EyeVec;\n'+
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 vertex = u_MvMatrix * a_Position;\n' +
    '  v_EyeVec = vec3(vertex.xyz);\n' +
    // Calculate the vertex position in the world coordinate
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightPosition;\n' +  // Position of the light source
    'uniform vec3 u_AmbientLight;\n' +
    'uniform vec4 u_Color;\n'+// Ambient light color
    'uniform float u_Shininess;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_EyeVec;\n'+
    'void main() {\n' +
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
    // Calculate the light direction and make it 1.0 in length
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    // The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    '  vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * u_Color.rgb;\n' +
    // Calculate the specular color
    '  vec3 E = normalize(v_EyeVec);\n' +
    '  vec3 R = reflect(lightDirection, normal);\n' +
    '  float specular = pow( max(dot(R, E), 0.0), u_Shininess);\n' +
    '  gl_FragColor = vec4(diffuse + ambient + specular, u_Color);\n' +
    '}\n';

function main2() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!createShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex coordinates, the color and the normal
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of uniform variables and so on
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    var u_Color = gl.getUniformLocation(gl.program, 'u_Color');
    var u_Shininess = gl.getUniformLocation(gl.program,'u_Shininess');
    var u_MvMatrix = gl.getUniformLocation(gl.program,'u_MvMatrix');
    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight
        || !u_Color || !u_Shininess || !u_MvMatrix) {
        console.log('Failed to get the storage location');
        return;
    }

    var vpMatrix = new Matrix4();   // View projection matrix
    vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3f(u_LightPosition, 4, 1, 4);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    gl.uniform4f(u_Color,1,0,1,1);

    gl.uniform1f(u_Shininess,230);

    var currentAngle = 0.0;  // Current rotation angle
    var modelMatrix = new Matrix4();  // Model matrix
    var mvpMatrix = new Matrix4();    // Model view projection matrix
    var normalMatrix = new Matrix4(); // Transformation matrix for normals
    var mvMatrix = new Matrix4();


    var tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle

        mvMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        gl.uniformMatrix4fv(u_MvMatrix,false, mvMatrix.elements);
        // Calculate the model matrix
        modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Pass the model view projection matrix to u_MvpMatrix
        mvpMatrix.set(vpMatrix).multiply(modelMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

        // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the cube
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

        requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
    };
    tick();
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // Coordinates




    var vertices = new Float32Array([
        0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,     // Front face
        0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0,     // Back face
        0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,     // Top face
        0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1,     // Bottom face
        1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,     // Right face
        0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0,     // Left face
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,  // v4-v7-v6-v5 back
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);


    // Write the vertex property to buffers (coordinates, colors and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

// Rotation angle (degrees/second)
var ANGLE_STEP = 30.0;
// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}