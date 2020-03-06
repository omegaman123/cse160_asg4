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
    'varying vec3 v_EyeVec;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 vertex = u_MvMatrix * a_Position;\n' +
    '  v_EyeVec = vec3(vertex.xyz);\n' +
    // Calculate the vertex position in the world coordinate
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightPosition;\n' +  // Position of the light source
    'uniform vec3 u_AmbientLight;\n' +
    'uniform vec3 u_Color;\n' +// Ambient light color
    'uniform float u_Shininess;\n' +
    'uniform int normal_Visual;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_EyeVec;\n' +
    'void main() {\n' +
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
    '  vec4 color;\n' +
    ' if (normal_Visual == 1) { color = vec4(v_Normal,1.0);}\n'+
    ' else if (normal_Visual == 0) { color = vec4(u_Color,1.0);}\n'+
    // Calculate the light direction and make it 1.0 in length
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    // The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * color.rgb;\n' +
    // Calculate the specular color
    '  vec3 E = normalize(v_EyeVec);\n' +
    '  vec3 R = u_LightColor * reflect(lightDirection, normal);\n' +
    '  float specular = pow( max(dot(R, E), 0.0), u_Shininess);\n' +
    '  gl_FragColor = vec4(diffuse + ambient + specular, color.a);\n' +
    '}\n';


var modelMatrix ;
var mvpMatrix ;
var normalMatrix ;
var mvMatrix ;
var u_ModelMatrix;
var u_MvpMatrix;
var u_NormalMatrix;
var u_LightColor;
var u_LightPosition;
var u_AmbientLight;
var u_Color;
var u_Shininess;
var u_MvMatrix;
var vpMatrix;
var normal_Visualization;
let lights = true;
let normals = false;
let gl;

function main2() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
     gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!createShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    makeSphere();

    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of uniform variables and so on
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    u_Color = gl.getUniformLocation(gl.program, 'u_Color');
    u_Shininess = gl.getUniformLocation(gl.program, 'u_Shininess');
    u_MvMatrix = gl.getUniformLocation(gl.program, 'u_MvMatrix');
    normal_Visualization = gl.getUniformLocation(gl.program,'normal_Visual');

    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight
        || !u_Color || !u_Shininess || !u_MvMatrix || !normal_Visualization) {
        console.log('Failed to get the storage location');
        return;
    }

    vpMatrix = new Matrix4();   // View projection matrix
    vpMatrix.setPerspective(60, canvas.width / canvas.height, 1, 1000);
    vpMatrix.lookAt(5, 3, 10, 1, 1, 1, 0, 1, 0);

    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3f(u_LightPosition, 0, 20, 0);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    gl.uniform1f(u_Shininess, 230);

    gl.uniform1i(normal_Visualization,0);

    var currentAngle = 0.0;  // Current rotation angle
    var currentLightAngle = 0.0;

    let lightPos = new Vector3([0, 10, 0]);

    modelMatrix = new Matrix4();  // Model matrix
    mvpMatrix = new Matrix4();    // Model view projection matrix
    normalMatrix = new Matrix4(); // Transformation matrix for normals
    mvMatrix = new Matrix4();
    let lightMatrix = new Matrix4();  // Light rotation matrix

    var tick = function () {
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        currentAngle = animate(currentAngle);  // Update the rotation angle
        currentLightAngle = animateLight(currentLightAngle);  // Update the rotation angle

        lightMatrix.setRotate(-currentLightAngle, 0, 0, 1);
        let lp = lightMatrix.multiplyVector3(lightPos);
        gl.uniform3f(u_LightPosition, lp.elements[0], lp.elements[1], lp.elements[2]);

        var n = initVertexBuffers(gl);
        if (n < 0) {
            console.log('Failed to set the vertex information');
            return;
        }
        drawCube(gl,currentAngle,n,[1,0,1], [0, 0, 0], [1, 1, 1]);
        drawCube(gl,currentAngle+90,n,[0,0,1], [0, 0, 0], [1, 1, 1]);
        drawCube(gl,0, n,[0.5, 1, 0.1], [-2, -2, -2], [32, 0, 32]);
        drawCube(gl,0, n,[0, 0, 1], [-2, -2, -2], [32, 10, 32]);



        var j = initSphereVertexBuffers(gl);
        if (j < 0) {
            console.log('Failed to set the vertex information');
            return;
        }

        drawSphere(gl,currentAngle+90,j,[1,0,0], [0, 0, 0], [1, 1, 1]);
        drawSphere(gl,currentAngle,j,[0,1,0], [1, 0, 0], [1, 1, 1]);

        requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
    };
    tick();
}

function drawCube(gl,currentAngle,n,color, pos, scale) {
    drawObject(gl,currentAngle,n,color, pos, scale);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function drawSphere(gl,currentAngle,n,color, pos, scale) {
    drawObject(gl,currentAngle,n,color, pos, scale);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function drawObject(gl,currentAngle,n,color, pos, scale) {
    mvMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvMatrix,false, mvMatrix.elements);

    if (!normals) {
        gl.uniform3f(u_Color, color[0], color[1], color[2]);
    }

    // Calculate the model matrix
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate
    modelMatrix.translate(pos[0], pos[1], pos[2]); // Move it to where we want to have it
    if (scale[0] != 1 || scale[1] != 1 || scale[2] != 1) {
        modelMatrix.scale(scale[0], scale[1], scale[2]); // Scale
    }
    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Pass the model view projection matrix to u_MvpMatrix
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
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

function initSphereVertexBuffers(gl) { // Create a sphere
    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
    if (!initBuffers(gl, 'a_Position', new Float32Array(g_sphereVertices), gl.FLOAT, 3)) return -1;
    if (!initBuffers(gl, 'a_Normal', new Float32Array(g_sphereVertices), gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(g_sphereIndices), gl.STATIC_DRAW);

    return g_sphereIndices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
    return initBuffers(gl, attribute, data, type, num);
}

function initBuffers(gl, attribute, data, type, num) {
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

var LIGHT_ANGLE_STEP = 10.2;
var g_lastLight = Date.now();

function animateLight(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_lastLight;
    g_lastLight = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (LIGHT_ANGLE_STEP * elapsed) / 1000.0;

    return newAngle %= 360;
}

let g_sphereVertices;
let g_sphereIndices;
function makeSphere() {
    var SPHERE_DIV = 52;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    g_sphereVertices = [];
    g_sphereIndices = [];

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            g_sphereVertices.push(si * sj);  // X
            g_sphereVertices.push(cj);       // Y
            g_sphereVertices.push(ci * sj);  // Z
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            g_sphereIndices.push(p1);
            g_sphereIndices.push(p2);
            g_sphereIndices.push(p1 + 1);

            g_sphereIndices.push(p1 + 1);
            g_sphereIndices.push(p2);
            g_sphereIndices.push(p2 + 1);
        }
    }
}

document.getElementById('lights').onclick = function () {
if (lights){
    lights = false;
    gl.uniform3f(u_LightColor, 0, 0, 0);
} else if (!lights){
    lights = true;
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

}
};
document.getElementById('normals').onclick = function () {
    if (normals){
        normals = false;
        gl.uniform1i(normal_Visualization,0)
    } else if (!normals){
        normals = true;
        gl.uniform1i(normal_Visualization,1)
    }
};