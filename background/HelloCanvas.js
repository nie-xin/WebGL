// HelloCanvas.js
function main() {
    var canvas = document.getElementById('webgl');

    // get the rendering context for webgl
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for webgl');
        return;
    }

    gl.clearColor(0.5, 0.2, 0.8, 1.0);

    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}
