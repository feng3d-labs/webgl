import { IGLProgram, IGLRenderObject, IGLRenderPass, IGLCanvasContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    const Corners = {
        LEFT: 0,
        RIGHT: 1,
        MAX: 2
    };

    const viewports: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

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
    const programBicubic: IGLProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-bicubic") } };

    const programOffsetBicubic: IGLProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-offset-bicubic") },
    };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IGLVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // -- Init Texture
        const texture: IGLTexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                unpackFlipY: false,
            },
            internalformat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            sources: [{ level: 0, source: image }],
        };
        const sampler: IGLSampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
        };

        // -- Render
        const rp: IGLRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: []
        };

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        // No offset
        rp.renderObjects.push(
            { __type: "Viewport", x: viewports[Corners.RIGHT].x, y: viewports[Corners.RIGHT].y, width: viewports[Corners.RIGHT].z, height: viewports[Corners.RIGHT].w },
            {
                vertexArray,
                pipeline: programBicubic,
                uniforms: {
                    MVP: matrix,
                    diffuse: { texture, sampler },
                },
                drawVertex: { vertexCount: 6 },
            });

        // Offset
        const offset = new Int32Array([100, -80]);

        rp.renderObjects.push(
            { __type: "Viewport", x: viewports[Corners.LEFT].x, y: viewports[Corners.LEFT].y, width: viewports[Corners.LEFT].z, height: viewports[Corners.LEFT].w },
            {
                vertexArray,
                pipeline: programOffsetBicubic,
                uniforms: {
                    MVP: matrix,
                    diffuse: { texture, sampler },
                    offset,
                },
                drawVertex: { vertexCount: 6 },
            });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteBuffer(vertexPosBuffer);
        webgl.deleteBuffer(vertexTexBuffer);
        webgl.deleteTexture(texture);
        webgl.deleteProgram(programOffsetBicubic);
        webgl.deleteProgram(programBicubic);
        webgl.deleteVertexArray(vertexArray);
    });
})();
