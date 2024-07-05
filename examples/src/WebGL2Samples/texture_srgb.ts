(function ()
{
    const canvas = document.createElement("canvas");
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

    // -- Initialize program

    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));

    const uniformMvpLocation = gl.getUniformLocation(program, "mvp");
    const uniformDiffuseLocation = gl.getUniformLocation(program, "material.diffuse");

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
    let texture;
    loadImage(imageUrl, function (image)
    {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0, // Level of details
            gl.SRGB8, // Format
            gl.RGB,
            gl.UNSIGNED_BYTE, // Size of each channel
            image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

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
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        gl.uniformMatrix4fv(uniformMvpLocation, false, matrix);
        gl.uniform1i(uniformDiffuseLocation, 0);

        gl.bindVertexArray(vertexArray);

        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);

        // Cleanup
        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(vertexTexBuffer);
        gl.deleteVertexArray(vertexArray);
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
    }
})();
