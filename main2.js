var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    //  'attribute vec4 a_Color;\n' + // Defined constant in main()
    'attribute vec4 a_Normal;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_MvMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
    'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_EyeVec;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 vertex = u_MvMatrix * a_Position;\n' +
    '  v_EyeVec = vec3(vertex.xyz);\n' +
    '  v_TexCoord = a_TexCoord;\n' +
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
    'uniform sampler2D u_Sampler;\n' +
    'uniform int u_Text;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_EyeVec;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
    '  vec4 color;\n' +
    '  if (normal_Visual == 1) {\n' +
    '    color = abs(vec4(v_Normal,1.0));\n' +
    '  }\n' +
    '  else if (normal_Visual == 0) {\n' +
    'if (u_Text == 1){ ' +
    '   color = texture2D(u_Sampler,v_TexCoord);}\n' +
    '   else{ color = vec4(u_Color,1.0);}\n' +
    '  }\n' +
    '  if (u_Shininess == 0.0) {\n' +
    '    gl_FragColor = color;\n' +
    '    return;\n' +
    '  }\n' +
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
    '  float spow = pow( max(dot(R, E), 0.0), u_Shininess);\n' +
    '  vec3 specular = u_LightColor * spow * nDotL;\n' +
    '  gl_FragColor = vec4(diffuse + ambient + specular, color.a);\n' +
    '}\n';


var modelMatrix;
var mvpMatrix;
var normalMatrix;
var mvMatrix;
var u_ModelMatrix;
var u_MvpMatrix;
var u_NormalMatrix;
var u_LightColor;
var u_LightPosition;
var u_AmbientLight;
let u_Sampler;
var u_Color;
var u_Shininess;
var u_MvMatrix;
var vpMatrix;
var normal_Visualization;
let lights = true;
let normals = false;
let gl;
let textNum = 0;
let canvas;


const G_ANGLE = .2;
const G_STEP = .1;
var currentAngle = 0.0;  // Current rotation angle
var currentLightAngle = 0.0;
let lightMatrix = new Matrix4();  // Light rotation matrix
let lightPos = new Vector3([0, 20, 0]);
let lastTexID;
let u_Text;


let bigArr = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //1
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //2
    [0, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 6, 1, 1, 1, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //3
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //4
    [0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //5
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 99, 0, 0, 3], //6
    [3, 1, 1, 1, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //7
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //8
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //9
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //11
    [3, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 5, 4, 4, 4, 4, 5, 6, 0, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 0, 0, 3], //12
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //13
    [3, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 4, 0, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //14
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 3], //15
    [3, 1, 1, 1, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //16
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //17
    [3, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], //18
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //19
    [3, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 5, 4, 4, 4, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //20
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 3], //21
    [3, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //22
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //23
    [3, 1, 1, 1, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //24
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //25
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3], //26
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //27
    [3, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //28
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 99, 0, 3], //29
    [3, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], //30
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3], //31
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 50, 0, 0, 0, 0, 0, 0, 0, 3], //32
];

function main2() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    document.onkeydown = function (ev) {
        keydown(ev);
    };


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
    u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    normal_Visualization = gl.getUniformLocation(gl.program, 'normal_Visual');
    u_Text = gl.getUniformLocation(gl.program, 'u_Text');

    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight
        || !u_Color || !u_Shininess || !u_MvMatrix || !normal_Visualization || !u_Sampler) {
        console.log('Failed to get the storage location');
        return;
    }


    vpMatrix = new Matrix4();   // View projection matrix
    vpMatrix.setPerspective(90, 1, 1, 100);
    vpMatrix.lookAt(eyeObj.x, eyeObj.y, eyeObj.z, eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ, 0, 1, 0);

    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3f(u_LightPosition, 0, 20, 0);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    gl.uniform1f(u_Shininess, 230);

    gl.uniform1i(normal_Visualization, 0);

    // var currentAngle = 0.0;  // Current rotation angle
    // var currentLightAngle = 0.0;


    modelMatrix = new Matrix4();  // Model matrix
    mvpMatrix = new Matrix4();    // Model view projection matrix
    normalMatrix = new Matrix4(); // Transformation matrix for normals
    mvMatrix = new Matrix4();


    if (!initTextures(gl, 36)) {
        console.log('Failed to intialize the texture.');
        return;
    }

}


function draw(n) {
    for (let i = 0; i < bigArr.length; i++) {
        for (let j = 0; j < bigArr[i].length; j++) {
            switch (bigArr[i][j]) {
                case 3:
                case 2:
                    drawCube(gl, 0, n, {
                        "type": 1,
                        "texID": 2,
                        "shininess": 230,
                        "rgb": {"red": .8, "green": .8, "blue": .8}
                    }, [i - 16, 1, j - 16], [1, 1, 1],{});
                case 1:
                    drawCube(gl, 0, n, {
                        "type": 1,
                        "texID": 2,
                        "shininess": 230,
                        "rgb": {"red": .8, "green": .8, "blue": .8}
                    }, [i - 16, 0, j - 16], [1, 1, 1],{});
                    break;
                case 75:
                    drawTree({"x":i-16,"y":0,"z":j-16},n,gl);
                    break;
            }
        }
    }
    for (let i = 0; i < bigArr.length; i++) {
        for (let j = 0; j < bigArr[i].length; j++) {
            switch (bigArr[i][j]) {
                case 3:
                    drawCube(gl, 0, n, {
                        "type": 1,
                        "texID": 5,
                        "shininess": 230,
                        "rgb": {"red": .8, "green": .8, "blue": .8}
                    }, [i - 16, 2, j - 16], [1, 1, 1],{});
            }
        }
    }
}

function drawCube(gl, currentAngle, n, color, pos, scale, anim) {
    drawObject(gl, currentAngle, n, color, pos, scale, anim);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function drawSphere(gl, currentAngle, n, color, pos, scale,anim) {
    drawObject(gl, currentAngle, n, color, pos, scale,anim);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function drawObject(gl, currentAngle, n, color, pos, scale,anim) {
    mvMatrix.setLookAt(eyeObj.x, eyeObj.y, eyeObj.z, eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvMatrix, false, mvMatrix.elements);
    gl.uniform1i(u_Text, color.type);
    gl.uniform1f(u_Shininess, color.shininess);
    if (!normals) {
        if (color.type === 0) {
            gl.uniform3f(u_Color, color.rgb.red, color.rgb.green, color.rgb.blue);
        } else if (color.type === 1 && lastTexID !== color.texID) {
            lastTexID = color.texID;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.uniform1i(u_Sampler, color.texID);
        }
    }

    // Calculate the model matrix
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate
    modelMatrix.translate(pos[0], pos[1], pos[2]); // Move it to where we want to have it
    if (anim.x !== undefined || anim.y !== undefined || anim.z !== undefined){
        modelMatrix.rotate(anim.angle,anim.x,anim.y,anim.z);
    }
    if (scale[0] != 1 || scale[1] != 1 || scale[2] != 1) {
        modelMatrix.scale(scale[0], scale[1], scale[2]); // Scale
    }
    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Pass the model view projection matrix to u_MvpMatrix
    mvpMatrix.setPerspective(90, 1, 1, 100);
    mvpMatrix.lookAt(eyeObj.x, eyeObj.y, eyeObj.z, eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
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

let LEG_ANGLE_STEP = 45;
let g_ANGLE_STEP = LEG_ANGLE_STEP;
let animalAngle = 0;

var g_lastAnimal = Date.now();
function animateAnimal(angle) {
    var now = Date.now();
    var elapsed = now - g_lastAnimal;
    g_lastAnimal = now;
    if (angle > 25) {
        g_ANGLE_STEP = -LEG_ANGLE_STEP;
    } else if (angle < -25) {
        g_ANGLE_STEP = LEG_ANGLE_STEP;
    }
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (g_ANGLE_STEP * elapsed) / 1000.0;
    newAngle%= 360;

    return newAngle;
}

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

document.getElementById('lights').onclick = function () {
    if (lights) {
        lights = false;
        gl.uniform3f(u_LightColor, 0, 0, 0);
    } else if (!lights) {
        lights = true;
        gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

    }
};
document.getElementById('normals').onclick = function () {
    if (normals) {
        normals = false;
        gl.uniform1i(normal_Visualization, 0)
    } else if (!normals) {
        normals = true;
        gl.uniform1i(normal_Visualization, 1)
    }
};

