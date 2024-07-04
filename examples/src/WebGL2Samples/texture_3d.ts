import { IRenderingContext } from "../../../src";
import { snoise } from "./third-party/noise3D";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const gl = canvas.getContext("webgl2", { antialias: false });

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

    const viewport: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

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

    // -- Initialize texture

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

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2(SIZE));
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage3D(
        gl.TEXTURE_3D, // target
        0, // level
        gl.R8, // internalformat
        SIZE, // width
        SIZE, // height
        SIZE, // depth
        0, // border
        gl.RED, // format
        gl.UNSIGNED_BYTE, // type
        data // pixel
    );

    gl.generateMipmap(gl.TEXTURE_3D);

    // -- Initialize program
    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));

    const uniformTextureMatrixLocation = gl.getUniformLocation(program, "orientation");
    const uniformDiffuseLocation = gl.getUniformLocation(program, "diffuse");

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

    // -- Initilize vertex array

    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    const vertexPosLocation = 0; // set with GLSL layout qualifier
    gl.enableVertexAttribArray(vertexPosLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const vertexTexLocation = 1; // set with GLSL layout qualifier
    gl.enableVertexAttribArray(vertexTexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    // -- Render

    const orientation = [0.0, 0.0, 0.0];

    requestAnimationFrame(render);

    function yawPitchRoll(yaw, pitch, roll)
    {
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        const cosRoll = Math.cos(roll);
        const sinRoll = Math.sin(roll);

        return [
            cosYaw * cosPitch,
            cosYaw * sinPitch * sinRoll - sinYaw * cosRoll,
            cosYaw * sinPitch * cosRoll + sinYaw * sinRoll,
            0.0,
            sinYaw * cosPitch,
            sinYaw * sinPitch * sinRoll + cosYaw * cosRoll,
            sinYaw * sinPitch * cosRoll - cosYaw * sinRoll,
            0.0,
            -sinPitch,
            cosPitch * sinRoll,
            cosPitch * cosRoll,
            0.0,
            0.0, 0.0, 0.0, 1.0
        ];
    }

    function render()
    {
        orientation[0] += 0.020; // yaw
        orientation[1] += 0.010; // pitch
        orientation[2] += 0.005; // roll

        const yawMatrix = new Float32Array(yawPitchRoll(orientation[0], 0.0, 0.0));
        const pitchMatrix = new Float32Array(yawPitchRoll(0.0, orientation[1], 0.0));
        const rollMatrix = new Float32Array(yawPitchRoll(0.0, 0.0, orientation[2]));
        const yawPitchRollMatrix = new Float32Array(yawPitchRoll(orientation[0], orientation[1], orientation[2]));
        const matrices = [yawMatrix, pitchMatrix, rollMatrix, yawPitchRollMatrix];

        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Bind program
        gl.useProgram(program);

        gl.uniform1i(uniformDiffuseLocation, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, texture);

        gl.bindVertexArray(vertexArray);

        for (let i = 0; i < Corners.MAX; ++i)
        {
            gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
            gl.uniformMatrix4fv(uniformTextureMatrixLocation, false, matrices[i]);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
        }

        requestAnimationFrame(render);
    }
})();
