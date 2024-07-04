import { IAttributeBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { snoise } from "./third-party/noise3D";
import { getShaderSource } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

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

    const texture: ITexture = {
        textureTarget: "TEXTURE_3D",
        internalformat: "R8",
        format: "RED",
        type: "UNSIGNED_BYTE",
        generateMipmap: true,
        sources: [{ level: 0, width: SIZE, height: SIZE, depth: SIZE, border: 0, pixels: data }],
    };
    const sampler: ISampler = {
        lodMinClamp: 0,
        lodMaxClamp: Math.log2(SIZE),
        minFilter: "LINEAR_MIPMAP_LINEAR",
        magFilter: "LINEAR",
    };

    // -- Initialize program
    const program: IProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

    // -- Initialize buffer
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IAttributeBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IAttributeBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Initilize vertex array

    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            in_texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

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

    const ro: IRenderObject = {
        pipeline: program,
        uniforms: {
            diffuse: { texture, sampler },
        },
        vertexArray,
        drawArrays: { vertexCount: 6 }
    };

    const renderObjects: IRenderObject[] = [];
    for (let i = 0; i < Corners.MAX; ++i)
    {
        renderObjects.push({
            ...ro,
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
        });
    }

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects,
    };

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

        for (let i = 0; i < Corners.MAX; ++i)
        {
            renderObjects[i].uniforms.orientation = matrices[i];
        }

        WebGL.runRenderPass(rc, rp);

        requestAnimationFrame(render);
    }
})();
