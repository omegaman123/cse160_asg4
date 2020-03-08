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

    var texCoords = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,   // Front
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,   // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,   // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,   // Bottom
        0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,   // Right
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,   // Left
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
    if (!initArrayBuffer(gl, 'a_TexCoord',texCoords,2,gl.FLOAT))
        return -1;

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
    gl.disableVertexAttribArray(2);


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