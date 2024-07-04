(function ()
{
    // --Init Canvas
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    // --Init WebGL Context
    const gl = canvas.getContext("webgl2", { antialias: false });

    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    // -- Init Program
    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));
    gl.useProgram(program);

    const uniformPerDrawLocation = gl.getUniformBlockIndex(program, "PerDraw");
    const uniformPerPassLocation = gl.getUniformBlockIndex(program, "PerPass");
    const uniformPerSceneLocation = gl.getUniformBlockIndex(program, "PerScene");

    gl.uniformBlockBinding(program, uniformPerDrawLocation, 0);
    gl.uniformBlockBinding(program, uniformPerPassLocation, 1);
    gl.uniformBlockBinding(program, uniformPerSceneLocation, 2);

    // -- Init Buffer
    const elementData = new Uint16Array([
        0, 1, 2,
        2, 3, 0
    ]);
    const elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    //vec3 position, vec3 normal, vec4 color
    const vertices = new Float32Array([
        -1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //mat4 P, mat4 MV, mat3 Mnormal
    const transforms = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,

        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0,

        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const uniformPerDrawBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformPerDrawBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, transforms, gl.DYNAMIC_DRAW);

    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, transforms);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const lightPos = new Float32Array([
        0.0, 0.0, 0.0, 0.0,
    ]);
    const uniformPerPassBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformPerPassBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, lightPos, gl.DYNAMIC_DRAW);

    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, lightPos);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    //vec3 ambient, diffuse, specular, float shininess
    const material = new Float32Array([
        0.1, 0.0, 0.0, 0.0,
        0.5, 0.0, 0.0, 0.0,
        1.0, 1.0, 1.0, 4.0,
    ]);
    const uniformPerSceneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformPerSceneBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, material, gl.STATIC_DRAW);

    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, material);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    // -- Init Vertex Array
    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    const vertexPosLocation = 0;
    const vertexNorLocation = 1;
    const vertexColorLocation = 2;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.vertexAttribPointer(vertexPosLocation, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(vertexNorLocation);
    gl.vertexAttribPointer(vertexNorLocation, 3, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(vertexColorLocation);
    gl.vertexAttribPointer(vertexColorLocation, 4, gl.FLOAT, false, 40, 24);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);

    gl.bindVertexArray(null);

    gl.bindVertexArray(vertexArray);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uniformPerDrawBuffer);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, uniformPerPassBuffer);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, uniformPerSceneBuffer);

    let uTime = 0;
    function render()
    {
        uTime += 0.01;

        // -- update uniform buffer
        transforms[16] = 0.1 * Math.cos(uTime) + 0.4;
        gl.bindBuffer(gl.UNIFORM_BUFFER, uniformPerDrawBuffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, transforms);

        lightPos[0] = Math.cos(3 * uTime);
        lightPos[1] = Math.sin(6 * uTime);
        gl.bindBuffer(gl.UNIFORM_BUFFER, uniformPerPassBuffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, lightPos);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    render();

    // // -- Delete WebGL resources
    // gl.deleteBuffer(vertexBuffer);
    // gl.deleteBuffer(uniformPerSceneBuffer);
    // gl.deleteBuffer(uniformPerPassBuffer);
    // gl.deleteBuffer(uniformPerDrawBuffer);
    // gl.deleteBuffer(elementBuffer);
    // gl.deleteProgram(program);

    // gl.deleteVertexArray(vertexArray);
})();
