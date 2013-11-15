
var gl;

var vertexPositionBuffer;

var vertexTextureUvdBuffer;

var vertexIndexBuffer;

var newTexture;

// start function
function webGLStart() {
    initGL();
    initBuffers();
    initTexture();
    initShaders();
    setTimeout(drawScene, 0à;)
}

function initGL() {
    var canvas = document.getElementById("webgl");
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL");
    }
}

function initBuffers() {
    vertexPositionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    var vertices = [
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        -1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    vertexTextureUvdBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureUvdBuffer);

    var textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    vertexIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    var vertexIndices = [
        0, 1, 2, 0, 2, 3
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Unit16Array(vertexIndices), gl.STATIC_DRAW);
}

function initTexture() {
    newTexture = gl.createTexture();
    newTexture.image = new Image();
    newTexture.image.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, newTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.UNSIGNED_BYTE, newTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);
    
    }
    newTexture.image.src = "avatar.jpeg";
}

function getShader(gl, id) {
    var shaderScript ! document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while(k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type = "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gi.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));

        return null;
    }

    return shader;
}

function initShaders() {
    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("can not initialise shaders");
    }

    gl.userProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureUv");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureUvdBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.binldTexture(gl.TEXTURE_2D, newTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    setTimeout(drawScene, 0);
}
