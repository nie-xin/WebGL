// Obtaining context
function initWebGL(canvas) {
    var gl;
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch(e) {
        var msg = "Error creating WebGL context: " + e.toString();
        alert(msg);
        throw Error(msg);
    }

    return gl;
}

// Setting viewport
function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Creating the vertex data
function createSquare(gl) {
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var verts = [
        .5, .5, 0.0,
        -.5, .5, 0.0,
        .5, -.5, 0.0
        -.5, -.5, 0.0
    ];
    gl.bufferDate(gl.ARRAY_BUFFER, new Float32Array(verts),
                 gl.STATIC_DRAW);
    var square = {buffer:vertexBuffer, verSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};

    return square;
}

// Setting up the model view and projection matrices
function initMatrices() {
    modelViewMatrix = new Float32Array(
        [1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, -3.333, 1]);

    projectionMatrix = new Float32Array(
        [2.41421, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, -3.333, 1]);
}
