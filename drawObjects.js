function drawTree(center, n,gl) {

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x,  center.y, center.z],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x,  center.y + 1,  center.z],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 3,"shininess":230}, [ center.x, center.y + 2, center.z],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x,  center.y + 3,  center.z - 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [center.x - 1,  center.y + 3,  center.z - 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x - 1, center.y + 3, center.z],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x + 1,  center.y + 3,  center.z],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x + 1, center.y + 3, center.z + 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x - 1,  center.y + 3,  center.z + 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x, center.y + 3, center.z + 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [center.x + 1,center.y + 3,center.z - 1],[1,1,1]);

    drawCube(gl, 0, n, {"type": 1, "texID": 4,"shininess":230}, [ center.x, center.y + 4,  center.z],[1,1,1]);
}

