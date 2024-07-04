(function ()
{
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });

    const Corners = {
        LEFT: 0,
        RIGHT: 1,
        MAX: 2
    };

    const viewports = new Array(Corners.MAX);

    viewports[Corners.LEFT] = {
        x: 0,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2
    };

    viewports[Corners.RIGHT] = {
        x: canvas.width / 2,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2
    };

    // -- Init program
    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));
    const mvpLocation = gl.getUniformLocation(program, "MVP");
    const diffuseLocation = gl.getUniformLocation(program, "diffuse");

    const program3D = createProgram(gl, getShaderSource("vs-3d"), getShaderSource("fs-3d"));
    const diffuseLocation3D = gl.getUniformLocation(program3D, "diffuse");

    // -- Init buffers: vec2 Position, vec2 Texcoord
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

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // -- Init VertexArray
    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    const vertexPosLocation = 0; // set with GLSL layout qualifier
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexLocation = 4; // set with GLSL layout qualifier
    gl.enableVertexAttribArray(vertexTexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    const texture3D = create3DTexture();

    const imageUrl = "../assets/img/Di-3d.png";
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        const texture2D = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture2D);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // -- Allocate storage for the texture
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 512, 512);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

        // -- Render
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindVertexArray(vertexArray);

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        // Immutable 2D texture
        gl.useProgram(program);
        gl.uniformMatrix4fv(mvpLocation, false, matrix);
        gl.uniform1i(diffuseLocation, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture2D);
        gl.viewport(viewports[Corners.LEFT].x, viewports[Corners.LEFT].y, viewports[Corners.LEFT].z, viewports[Corners.LEFT].w);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Immutable 3D texture
        gl.useProgram(program3D);
        gl.uniform1i(diffuseLocation3D, 1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, texture3D);
        gl.viewport(viewports[Corners.RIGHT].x, viewports[Corners.RIGHT].y, viewports[Corners.RIGHT].z, viewports[Corners.RIGHT].w);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Delete WebGL resources
        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(vertexTexBuffer);
        gl.deleteTexture(texture2D);
        gl.deleteTexture(texture3D);
        gl.deleteProgram(program);
        gl.deleteProgram(program3D);
        gl.deleteVertexArray(vertexArray);
    });

    function create3DTexture()
    {
        // Note By @kenrussel: The sample was changed from R32F to R8 for best portability.
        // not all devices can render to floating-point textures
        // (and, further, this functionality is in a WebGL extension: EXT_color_buffer_float),
        // and renderability is a requirement for generating mipmaps.

        const SIZE = 32;
        const data = new Uint8Array(SIZE * SIZE * SIZE);
        for (let k = 0; k < SIZE; ++k)
        {
            for (let j = 0; j < SIZE; ++j)
            {
                for (let i = 0; i < SIZE; ++i)
                {
                    data[i + j * SIZE + k * SIZE * SIZE] = snoise([i, j, k]) * 256;
                }
            }
        }

        const texture3D = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, texture3D);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2(SIZE));
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texStorage3D(
            gl.TEXTURE_3D, // target
            Math.log2(SIZE), // levels
            gl.R8, // internalformat
            SIZE, // width
            SIZE, // height
            SIZE // depth
        );

        gl.texSubImage3D(
            gl.TEXTURE_3D, // target
            0, // level
            0,
            0,
            0,
            SIZE, // width
            SIZE, // height
            SIZE, // depth
            gl.RED, // format
            gl.UNSIGNED_BYTE, // type
            data
        );

        gl.generateMipmap(gl.TEXTURE_3D);

        return texture3D;
    }
})();
