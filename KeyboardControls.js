let eyeObj = {};
eyeObj = {"x": 9, "y": 2, "z": 9, "lookX": 0, "lookY": 0, "lookZ": 0};

function keydown(ev) {
    switch (ev.which) {
        case 87: // W
            // console.log("KeyW");
            moveForward();
            break;
        case 83: // S
            // console.log("KeyS");
            moveBackward();
            break;
        case 65: // A
            // console.log("KeyA");
            moveLeft();
            break;
        case 68: // D
            // console.log("KeyD");
            moveRight();
            break;
        case 69: // E
            rotateRight();
            break;
        case 81: // Q
            rotateLeft();
            break;
    }
    console.log("x: ", eyeObj.x, ", y: ", eyeObj.y, ", z: ", eyeObj.z);
    console.log("lookX: ", eyeObj.lookX, ", lookY: ", eyeObj.lookY, ", lookZ: ", eyeObj.lookZ);

}

function moveForward() {
    let at = new Vector3([eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ]);
    let eye = new Vector3([eyeObj.x, eyeObj.y, eyeObj.z]);
    let dir = at.sub(eye);
    let sdir = dir.mul(G_STEP / 2);
    let nEye = eye.add(sdir);
    let nAt = at.add(sdir);
    eyeObj.x = nEye.elements[0];
// eyeObj.y = nEye.y;
    eyeObj.z = nEye.elements[2];

    eyeObj.lookX = nAt.elements[0];
    // eyeObj.lookY = nAt.elements[1];
    eyeObj.lookZ = nAt.elements[2];
    // console.log(eyeObj);

}

function moveBackward() {
    let at = new Vector3([eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ]);
    let eye = new Vector3([eyeObj.x, eyeObj.y, eyeObj.z]);
    let dir = at.sub(eye);
    let sdir = dir.mul(G_STEP / 2);
    let nEye = eye.sub(sdir);
    let nAt = at.sub(sdir);
    eyeObj.x = nEye.elements[0];
// eyeObj.y = nEye.y;
    eyeObj.z = nEye.elements[2];

    eyeObj.lookX = nAt.elements[0];
    // eyeObj.lookY = nAt.elements[1];
    eyeObj.lookZ = nAt.elements[2];
    // console.log(eyeObj);
}

function getDeltasLR() {
    let dirX = eyeObj.x - eyeObj.lookX;
    let dirZ = eyeObj.z - eyeObj.lookZ;
    let dirH = Math.sqrt(dirX * dirX + dirZ * dirZ);
    let deltaX = G_STEP * dirZ / dirH;
    let deltaZ = G_STEP * dirX / dirH;
    return {deltaX, deltaZ};
}


function moveRight() {
    let {deltaX, deltaZ} = getDeltasLR();
    eyeObj.x = eyeObj.x + deltaX;
    eyeObj.z = eyeObj.z - deltaZ;
    eyeObj.lookX = eyeObj.lookX + deltaX;
    eyeObj.lookZ = eyeObj.lookZ - deltaZ;
}

function moveLeft() {
    let {deltaX, deltaZ} = getDeltasLR();
    eyeObj.x = eyeObj.x - deltaX;
    eyeObj.z = eyeObj.z + deltaZ;
    eyeObj.lookX = eyeObj.lookX - deltaX;
    eyeObj.lookZ = eyeObj.lookZ + deltaZ;
}


function rotateRight() {
    let at = new Vector3([eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ]);
    let eye = new Vector3([eyeObj.x, eyeObj.y, eyeObj.z]);
    let dir = eye.sub(at);
    let sin = Math.sin(G_ANGLE);
    let cos = Math.cos(G_ANGLE);

    let dX = cos * dir.elements[0] - sin * dir.elements[2];
    let dZ = sin * dir.elements[0] + cos * dir.elements[2];
    eyeObj.lookX = eyeObj.x - dX;
    eyeObj.lookZ = eyeObj.z - dZ;
}

function rotateLeft() {
    let at = new Vector3([eyeObj.lookX, eyeObj.lookY, eyeObj.lookZ]);
    let eye = new Vector3([eyeObj.x, eyeObj.y, eyeObj.z]);
    let dir = eye.sub(at);
    let sin = Math.sin(-G_ANGLE);
    let cos = Math.cos(-G_ANGLE);
    let dX = cos * dir.elements[0] - sin * dir.elements[2];
    let dZ = sin * dir.elements[0] + cos * dir.elements[2];
    eyeObj.lookX = eyeObj.x - dX;
    eyeObj.lookZ = eyeObj.z - dZ;
}
