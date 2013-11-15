/** 
 * an auto-rotating cube
 * version: 0.1
 * 2/11/2013 by NIE Xin
 * reference: https://github.com/cedricpinson/osgjs/tree/develop/examples/cubemotion
 * ---------------------------------------------------------------------------------- 
 */

var main = function() {
    // setup container
    var canvas = document.getElementById("3DView");
    var w = window.innerWidth;
    var h = window.innerHeight;
    osg.log("size " + w + " x " + h );
    canvas.style.width = w;
    canvas.style.height = h;
    canvas.width = w;
    canvas.height = h;

    var stats = document.getElementById("Stats");

    var viewer;
    try {
        viewer = new osgViewer.Viewer(canvas, {antialias : true, alpha: true });
        viewer.init();
        var rotate = new osg.MatrixTransform();
        rotate.addChild(createScene());
        viewer.setSceneData(rotate);

        viewer.setupManipulator(new osgGA.OrbitManipulator());
        // set distance
        viewer.getManipulator().setDistance(20.0);

        viewer.run();

        var mousedown = function(ev) {
            ev.stopPropagation();
        };
        document.getElementById("explanation").addEventListener("mousedown", mousedown, false);

    } catch (er) {
        osg.log("exception in osgViewer " + er);
        alert("exception in osgViewer " + er);
    }
};

var SimpleUpdateCallback = function() {};

SimpleUpdateCallback.prototype = {
    // rotation angle
    angle: 0,

    update: function(node, nv) {
        var t = nv.getFrameStamp().getSimulationTime();
        var dt = t - node._lastUpdate;
        if (dt < 0) {
            return true;
        }
        node._lastUpdate = t;
        document.getElementById("update").innerHTML = node._lastUpdate;
        document.getElementById("angle").innerHTML = this.angle;

        // rotation
        var m = node.getMatrix();
        osg.Matrix.makeRotate(this.angle, 0.0, 0.0, 1.0, m);



        osg.Matrix.setTrans(m, 0, 0, 0);

        this.angle += 0.1;

        return true;
    }
};

function createScene() {
    var root = new osg.Node();
    var cube = new osg.MatrixTransform();

    // create a cube in center of the scene(0, 0, 0) and set it's size to 7
    var size = 7;
    var cubeModel = osg.createTexturedBox(0,0,0, size,size,size);
    cube.addChild(cubeModel);

    // add a stateSet of texture to cube
    var material = new osg.Material();
    material.setDiffuse([1.0, 1.0, 0.2, 1.0]);
    cube.getOrCreateStateSet().setAttributeAndMode(material);

    // attache updatecallback function to cube
    var cb = new SimpleUpdateCallback();;
    cube.addUpdateCallback(cb);

    // add to root and return
    root.addChild(cube);

    return root;
}

window.addEventListener("load", main ,true);
