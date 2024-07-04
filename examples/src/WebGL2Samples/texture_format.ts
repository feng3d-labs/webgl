import { IRenderingContext } from "../../../src";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const gl = canvas.getContext("webgl2", { antialias: false });

    // -- Viewport

    const windowSize = {
        x: canvas.width,
        y: canvas.height
    };

    const Views = {
        BOTTOM_LEFT: 0,
        BOTTOM_CENTER: 1,
        BOTTOM_RIGHT: 2,
        MIDDLE_LEFT: 3,
        MIDDLE_CENTER: 4,
        MIDDLE_RIGHT: 5,
        TOP_LEFT: 6,
        TOP_CENTER: 7,
        TOP_RIGHT: 8,
        MAX: 9
    };

    const viewport = new Array(Views.MAX);

    for (let i = 0; i < Views.MAX; ++i)
    {
        const row = Math.floor(i / 3);
        const col = i % 3;
        viewport[i] = {
            x: windowSize.x * col / 3.0,
            y: windowSize.y * row / 3.0,
            z: windowSize.x / 3.0,
            w: windowSize.y / 3.0
        };
    }

    // -- Init program
    const programUint = createProgram(gl, getShaderSource("vs"), getShaderSource("fs-uint"));
    const mvpUintLocation = gl.getUniformLocation(programUint, "MVP");
    const diffuseUintLocation = gl.getUniformLocation(programUint, "diffuse");

    const programNormalized = createProgram(gl, getShaderSource("vs"), getShaderSource("fs-normalized"));
    const mvpNormalizedLocation = gl.getUniformLocation(programNormalized, "MVP");
    const diffuseNormalizedLocation = gl.getUniformLocation(programNormalized, "diffuse");

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

    loadImage("../assets/img/Di-3d.png", function (image)
    {
        const TextureTypes = {
            RGB: 0,
            RGB8: 1,
            RGBA: 2,
            RGB16F: 3,
            RGBA32F: 4,
            R16F: 5,
            RG16F: 6,
            RGB8UI: 7,
            RGBA8UI: 8,
            MAX: 9
        };

        const textureFormats = new Array(TextureTypes.MAX);

        textureFormats[TextureTypes.RGB] = {
            internalFormat: gl.RGB,
            format: gl.RGB,
            type: gl.UNSIGNED_BYTE
        };

        textureFormats[TextureTypes.RGB8] = {
            internalFormat: gl.RGB8,
            format: gl.RGB,
            type: gl.UNSIGNED_BYTE
        };

        textureFormats[TextureTypes.RGB16F] = {
            internalFormat: gl.RGB16F,
            format: gl.RGB,
            type: gl.HALF_FLOAT
        };

        textureFormats[TextureTypes.RGBA32F] = {
            internalFormat: gl.RGBA32F,
            format: gl.RGBA,
            type: gl.FLOAT
        };

        textureFormats[TextureTypes.R16F] = {
            internalFormat: gl.R16F,
            format: gl.RED,
            type: gl.HALF_FLOAT
        };

        textureFormats[TextureTypes.RG16F] = {
            internalFormat: gl.RG16F,
            format: gl.RG,
            type: gl.HALF_FLOAT
        };

        textureFormats[TextureTypes.RGBA] = {
            internalFormat: gl.RGBA,
            format: gl.RGBA,
            type: gl.UNSIGNED_BYTE
        };

        textureFormats[TextureTypes.RGB8UI] = {
            internalFormat: gl.RGB8UI,
            format: gl.RGB_INTEGER,
            type: gl.UNSIGNED_BYTE
        };

        textureFormats[TextureTypes.RGBA8UI] = {
            internalFormat: gl.RGBA8UI,
            format: gl.RGBA_INTEGER,
            type: gl.UNSIGNED_BYTE
        };

        // -- Init Texture

        gl.activeTexture(gl.TEXTURE0);

        const textures = new Array(TextureTypes.MAX);
        let i = 0;
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            textures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, textureFormats[i].internalFormat, textureFormats[i].format, textureFormats[i].type, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        }

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

        // Normalized textures
        gl.useProgram(programNormalized);
        gl.uniformMatrix4fv(mvpNormalizedLocation, false, matrix);
        gl.uniform1i(diffuseNormalizedLocation, 0);

        for (i = 0; i < TextureTypes.RGB8UI; ++i)
        {
            gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        // Unsigned int textures
        gl.useProgram(programUint);
        gl.uniformMatrix4fv(mvpUintLocation, false, matrix);
        gl.uniform1i(diffuseUintLocation, 0);

        for (i = TextureTypes.RGB8UI; i < TextureTypes.MAX; ++i)
        {
            gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        // Delete WebGL resources
        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(vertexTexBuffer);
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            gl.deleteTexture(textures[i]);
        }
        gl.deleteProgram(programUint);
        gl.deleteProgram(programNormalized);
        gl.deleteVertexArray(vertexArray);
    });
})();
