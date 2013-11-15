//HTML5游戏开发者社区 AND 9TECH
//作者 白泽

//定义全局的GL句柄
var gl;

//定义顶点坐标缓存数组
var vertexPositionBuffer;

//定义纹理UV信息缓存
var vertexTextureUvdBuffer;

//定义顶点索引缓存
var vertexIndexBuffer;

//定义纹理
var newTexture;

//初始化纹理
function initTexture() {

    //申请一个纹理
    newTexture = gl.createTexture();

    //JS居然可以这样写,添加动态属性,这是我网上学的办法,嗯,先这么用着吧
    //创建一个图片
    newTexture.image = new Image();

    //如果图片读取完毕就执行初始化过程,在之后的操作里,你可以把这里优化到你的结构里,我现在写在一起方便你的查看
    newTexture.image.onload = function () {

        //开始WEBGL纹理功能,这是一个坑,如果你的程序没有报错,但是不显示图片看看这里有没有开启
        gl.activeTexture(gl.TEXTURE0);

        //和上传顶点的过程是一样一样的,把这个纹理对象上传到WEBGL的状态机里
        gl.bindTexture(gl.TEXTURE_2D,newTexture);

        //这个函数之前没见过,看样子你不这样子设置画面会反转,那就这样设置吧
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //核心函数,利用newTexture.image生成纹理,我们实际渲染的不是load进来的图片而是一个纹理,后面的0参数看起来是纹理等级
        //的意思,在3D中会有多级纹理,比如1024*1024 512*512 256*256 ...一直到最小,这个操作是方便在远处的贴图以小精度也就是
        //等级显示,这样就不需要利用大图缩放而损失画面质量了,不过我们的2D游戏不会用到这个功能,后面的参数看起来是设置图像
        //的一些颜色信息,默认吧,默认吧
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newTexture.image);

        //缩放的采样模式,这里是设置图像被放大时采样模式,为临近采样模式,这个参数很常用你最好把它封装起来,初始化时方便你
        //选择
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        //这里是设置缩小时的采样模式,原理同上,
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        //清空状态机里的纹理,这里只是清除引用而已,不是清楚纹理,纹理我们已经经过状态机加工过了
        gl.bindTexture(gl.TEXTURE_2D, null)
    }

    //读取的图片最好为2的次方,如果不是则会出现纹理UV错乱和报错的情况,如果非要上传任意尺寸的图像呢,可以在前端加工成最
    //接近的2的次方图片
    newTexture.image.src = "lufei.png";
}

//初始化WEBGL和画布
function initGL() {
    //获取画布myWebGL是自定义名称
    var canvas=document.getElementById("myWebGL");
    try {
        //获取WEBGL的句柄,这个骚气的名字ID不是我取的,你必须得用这个,我一开始也以为是自定义的
        gl = canvas.getContext("experimental-webgl");

        //设置WEBGL的画布,坐标为0,0,宽度和高度最好和原始画布的一样
        gl.viewport(0, 0, canvas.width, canvas.height);

    } catch (e) {
    }
    if (!gl) {

        //如果不支持,你可以回滚到canvas的渲染机制
        alert("Could not initialise WebGL, sorry :-(");
    }
}

//获取着色器
function getShader(gl, id) {

    //这里是一系列的JS解析过程,实际上你不这么做直接上传字符串也可以
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {

        //根据参数定义不同的着色器类型,这里定义的是像素着色器类型
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {

        //这里定义的是一个顶点着色器类型
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    //绑定着色器字符串到到着色器里
    gl.shaderSource(shader, str);

    //编译这个着色器,就是生成这段程序
    gl.compileShader(shader);

    //如果创建不成功,那就是你写错代码了
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    //最后返回出这个着色器
    return shader;
}

//初始化着色器
function initShaders() {

    //获取顶点着色器
    var vertexShader = getShader(gl, "shader-vs");

    //获取像素着色器
    var fragmentShader = getShader(gl, "shader-fs");

    //创建一个着色器程序
    shaderProgram = gl.createProgram();

    //把顶点着色器上传到这个着色器程序里
    gl.attachShader(shaderProgram, vertexShader);

    //把像素着色器上传到这个着色器程序里
    gl.attachShader(shaderProgram, fragmentShader);

    //链接这个着色器
    gl.linkProgram(shaderProgram);

    //如果你创建失败了,那你又写错代码了
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    //把这个着色器上传到GPU
    gl.useProgram(shaderProgram);

    //还记得aVertexPosition个寄存器的名称么,这是对应到顶点着色器的,getAttribLocation这句话的意思是,从这个着色器程序里
    //获得一个叫aVertexPosition的寄存器名称,然后赋值给shaderProgram.vertexPositionAttribute
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

    //绑定这个寄存器属性
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    //原理同上,名称级的要一一对饮
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureUv");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

}




//初始化顶点信息
function initBuffers() {

    /**********************************************初始化顶点坐标信息*******************************************/
    //先从GL申请一个缓存数组
    vertexPositionBuffer = gl.createBuffer();

    //把这个缓存丢入到GL的状态机里
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    //注意这里的坐标,在WEBGL中默认坐标点是在屏幕的中心点,和我们之前使用canvas不一样,X轴正号为右,Y轴正号为上,
    //我不太习惯这个坐标系,不过没有关系,我们先用默认的坐标来处理图像,后续我们可以利用矩阵
    //改变成自己的左上角坐标系,现在我们通过4个顶点坐标定义了一个四角形,所以我们的四角形的宽度和高度是2，这里
    //是重点,不要看成是1拉,因为-1和1表示的长度为2,之后我们需要这个2来算出实际的图像大小,所以,这里的顶点循序是
    //左下角,右下角,右上角,左上角
    var vertices = [
        -1.0, -1.0,//左下角
        1.0, -1.0,//右下角
        1.0,  1.0,//右上角
        -1.0,  1.0//左上角
    ];


    /**********************************************初始化UV信息*******************************************/

    //上传这个顶点数据到WEBGL的状态机里,这里有点难理解,WBEGL是过程式的,因为我们上面的操作是已经上传了顶点的缓存数
    // 组到状态机通过使用参数gl.STATIC_DRAW,告诉告诉状态机,现在上传的是这个缓存数组里的具体参数,参数是浮点数
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //申请一个UV的缓存数组
    vertexTextureUvdBuffer = gl.createBuffer();

    //又上传到WEBGL的状态机里,
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureUvdBuffer);

    //这里就是传说中的UV,还记得0和1吗,1代表原图的最大采样区域,如果我们要显示一个完整的原图,就需要设置各个顶点的UV坐标
    //它对应的是顶点坐标,通过设置UV信息着色器会帮我们计算插值坐标
    var textureCoords = [
       0, 0.0,//左下角
       1.0, 0.0,//右下角
       1.0, 1.0,//右上角
       0.0, 1.0//左上角
    ];

    //再一次上传到数据到状态机里,原理同上
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);


    /**********************************************初始化顶点索引*******************************************/

    //申请一个顶点索引的缓存数组
    vertexIndexBuffer = gl.createBuffer();

    //上传到WEBGL的状态机里
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    //设置顶点绘制的循序,WBEGL会根据你的这个循序去渲染你的图像,通常你可以利用这里改变你的图像的排序循序,这里渲染的是
    //两个三角形,因为我们是做2D,两个三角形是有两个共享点的
    var vertexIndices = [
        0, 1, 2, 0, 2, 3
    ];
    //这里的上传类型改变为长整形了,Uint16Array,这里是一个坑,在其他语言里你上传错误的数据类型不会报错,但是会显示很奇怪,
    //以前我就被这个坑了一个下午,因为索引ID没有小数
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);


}

//渲染函数,这里是循环调用的
function drawScene() {


    //清理画面
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //上传顶点数据到WEBGL的状态机
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    //设置顶点着色器接受缓存的数组并且上传到着色器,我们只用了二维,所以是2,类型为浮点数,flase是不需要转换为单位向量,这个
    //矩阵会用到,或者是法线贴图的数据,现在用不到,后面是开始位置和间隔位置,实际上你可以在一个缓存数组里放所有的信息
    //这样理论上会节省空间和提升效率,但我在其他平台上测试,分开的优势比较大,WEBGL的还没有测试过,现在默认是0,0
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,2, gl.FLOAT, false, 0, 0);


    //同上理,上传UV信息到WEBGL状态机
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureUvdBuffer);
    //同上理
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,2, gl.FLOAT, false, 0, 0);


    //上传纹理信息到WBEGL状态机
    gl.bindTexture(gl.TEXTURE_2D, newTexture);

    //这里是一个坑,因为是面向过程的,循序不能错,把纹理上传到WEBGL状态机后,要紧接着上传到着色器,uSampler是和像素着色器对应
    //好的寄存器名称,后面的参数,没见过,默认吧,默认吧,
    gl.uniform1i(gl.getUniformLocation(shaderProgram,"uSampler"), 0);

    //上传顶点索引到WBEGL状态机
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    //通过刚上传的顶点索引绘制三角形,一共有6个顶点,类型为整形,间隔为0
    gl.drawElements(gl.TRIANGLES,6, gl.UNSIGNED_SHORT, 0);

    //循环调用
    setTimeout(drawScene,0);
}

//启动函数
function webGLStart() {

    //初始化WEBGL和画布
    initGL();

    //初始化顶点数据缓存
    initBuffers();

    //初始化纹理
    initTexture();

    //初始化着色器
    initShaders();

    //游戏循环渲染
    setTimeout(drawScene,0);

}