(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    // -- Mouse Behaviour
    let scale = 1.0;
    let mouseDown = false;
    let lastMouseY = 0;
    window.onmousedown = function (event)
    {
        mouseDown = true;
        lastMouseY = event.clientY;
    };
    window.onmouseup = function (event)
    {
        mouseDown = false;
    };
    window.onmousemove = function (event)
    {
        if (!mouseDown)
        {
            return;
        }
        const newY = event.clientY;

        const deltaY = newY - lastMouseY;

        scale += deltaY / 100;

        lastMouseY = newY;
    };

    // -- Divide viewport
    const windowSize = {
        x: canvas.width,
        y: canvas.height
    };

    const Corners = {
        TOP_LEFT: 0,
        TOP_RIGHT: 1,
        BOTTOM_RIGHT: 2,
        BOTTOM_LEFT: 3,
        MAX: 4
    };

    const viewport = new Array(Corners.MAX);

    viewport[Corners.BOTTOM_LEFT] = {
        x: 0,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.BOTTOM_RIGHT] = {
        x: windowSize.x / 2,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_RIGHT] = {
        x: windowSize.x / 2,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_LEFT] = {
        x: 0,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    // -- Initialize program
    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));

    const uniformMvpLocation = gl.getUniformLocation(program, "mvp");
    const uniformDiffuseLocation = gl.getUniformLocation(program, "diffuse");
    const uniformLodBiasLocation = gl.getUniformLocation(program, "lodBias");

    // -- Initialize buffer
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // -- Initialize vertex array
    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    const vertexPosLocation = 0; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexLocation = 4; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexTexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    // -- Load texture then render
    const imageUrl = "../assets/img/Di-3d.png";
    const textures = new Array(Corners.MAX);
    loadImage(imageUrl, function (image)
    {
        // -- Initialize Texture
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        textures[Corners.TOP_LEFT] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textures[Corners.TOP_LEFT]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        textures[Corners.TOP_RIGHT] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textures[Corners.TOP_RIGHT]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, 3.0);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, 3.0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        textures[Corners.BOTTOM_LEFT] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textures[Corners.BOTTOM_LEFT]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, 0.0);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, 10.0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        textures[Corners.BOTTOM_RIGHT] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textures[Corners.BOTTOM_RIGHT]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, 0.0);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, 10.0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        render();
    });

    function render()
    {
        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Bind program
        gl.useProgram(program);

        const matrix = new Float32Array([
            scale, 0.0, 0.0, 0.0,
            0.0, scale, 0.0, 0.0,
            0.0, 0.0, scale, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        gl.uniformMatrix4fv(uniformMvpLocation, false, matrix);
        gl.uniform1i(uniformDiffuseLocation, 0);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindVertexArray(vertexArray);

        const lodBiasArray = [0.0, 0.0, 0.0, 0.0];
        lodBiasArray[Corners.BOTTOM_LEFT] = 3.5;
        lodBiasArray[Corners.BOTTOM_RIGHT] = 4.0;
        for (let i = 0; i < Corners.MAX; ++i)
        {
            gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
            gl.uniform1f(uniformLodBiasLocation, lodBiasArray[i]);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
        }

        requestAnimationFrame(render);
    }

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteBuffer(vertexPosBuffer);
    // gl.deleteBuffer(vertexTexBuffer);
    // for (var j = 0; j < textures.length; ++j) {
    //     gl.deleteTexture(textures[j]);
    // }
    // gl.deleteVertexArray(vertexArray);
    // gl.deleteProgram(program);
})();
