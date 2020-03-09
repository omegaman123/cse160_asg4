function drawTree(center, n,gl) {

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x,  center.y, center.z],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x,  center.y + 1,  center.z],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x, center.y + 2, center.z],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x,  center.y + 3,  center.z - 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [center.x - 1,  center.y + 3,  center.z - 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x - 1, center.y + 3, center.z],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x + 1,  center.y + 3,  center.z],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x + 1, center.y + 3, center.z + 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x - 1,  center.y + 3,  center.z + 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x, center.y + 3, center.z + 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [center.x + 1,center.y + 3,center.z - 1],[1,1,1],{});

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x, center.y + 4,  center.z],[1,1,1],{});
}

function drawAnimal(center,n,gRotation,animAngle){
    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":0,"green":0,"blue":1}},[center.x,center.y+.5,center.z], [1.5,.5,1],{}); //body);

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":0}},[center.x+.25,center.y,center.z],[.25,.5,.25],{"x":0,"y":0,"z":1,"angle":animAngle});

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":0}},[center.x+1.25,center.y,center.z],[.25,.5,.25],{"x":0,"y":0,"z":-1,"angle":animAngle});

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":0}},[center.x+.25,center.y,center.z+.75],[.25,.5,.25],{"x":0,"y":0,"z":-1,"angle":animAngle});

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":0}},[center.x+1.25,center.y,center.z+.75],[.25,.5,.25],{"x":0,"y":0,"z":1,"angle":animAngle});

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":1}},[center.x+1.25,center.y+.75,center.z+.25],[.5,.75,.5],{});

    drawCube(gl,gRotation,n,{"type":0,"shininess":230,"rgb":{"red":1,"green":0,"blue":1}},[center.x+1.5,center.y+1.125,center.z+.175],[.6,.4,.6],{})
}