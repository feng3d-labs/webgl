import { IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const gl = canvas.getContext("webgl2", { antialias: false });

    // -- Init program
    const program: IProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init buffers
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // -- Init Texture
        const texture: ITexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                unpackFlipY: false,
            },
            internalformat: "RGBA8UI",
            format: "RGBA_INTEGER",
            type: "UNSIGNED_BYTE",
            sources: [{ level: 0, source: image }],
        };
        const sampler: ISampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
        };

        // -- Render
        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: IRenderObject = {
            pipeline: program,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            vertexArray,
            drawArrays: { vertexCount: 6 },
        };

        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: [ro],
        };

        WebGL.runRenderPass(rc, rp);

        // Delete WebGL resources
        WebGL.deleteBuffer(rc, vertexPosBuffer);
        WebGL.deleteBuffer(rc, vertexTexBuffer);
        WebGL.deleteTexture(rc, texture);
        WebGL.deleteProgram(rc, program);
        WebGL.deleteVertexArray(rc, vertexArray);
    });
})();
