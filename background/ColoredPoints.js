// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = 10.0;\n' +
    '}\n';

// fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +     // uniform variable
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n' + // Set the color
    '}\n';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // get the storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // get the storage location of u_FragColor variable
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    // register event handler to be called on a mouse press
    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, a_Position, u_FragColor);
    };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];      // array for mouse press
var g_colors = [];      // array to store the color of a poin
function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX;     // x coordinate
    var y = ev.clientY;     // y coordinate
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height/2) / (canvas.height / 2);
    y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
    // store the coordinate to g_points array
    g_points.push([x, y]);
    // store the color to g_colors array
    if (x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0]);    // red
    } else if (x < 0.0 && y < 0.0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0]);    // green
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0]);    // white
    }
    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i = 0; i < len; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];

        // pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw a point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
