import { IRenderPass } from "@feng3d/render-api";
import { IGLCanvasContext, IGLCopyBufferToBuffer, IGLRenderPipeline, IGLVertexAttributes, IGLVertexBuffer, WebGL, getIGLBuffer } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

(function ()
{
    // -- Init Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    // -- Init WebGL Context
    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: IGLRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        primitive: { topology: "TRIANGLES" },
    };

    // -- Init Buffer
    const vertices = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBufferSrc: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

    const vertexPosBufferDst = new Float32Array(vertices.length);

    const cb: IGLCopyBufferToBuffer = {
        __type: "CopyBufferToBuffer",
        source: vertexPosBufferSrc,
        destination: getIGLBuffer(vertexPosBufferDst, "ARRAY_BUFFER"),
        sourceOffset: 0, destinationOffset: 0, size: vertices.length * Float32Array.BYTES_PER_ELEMENT
    };

    // -- Init Vertex Array
    const vertexArray: { vertices?: IGLVertexAttributes } = {
        vertices: {
            pos: { data: vertexPosBufferDst, numComponents: 2 },
        }
    };

    // -- Render
    const rp: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            vertices: vertexArray.vertices,
            drawVertex: { vertexCount: 6 },
        }]
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [cb, rp] }] });

    // -- Delete WebGL resources
    webgl.deleteBuffer(vertexPosBufferSrc);
    webgl.deleteProgram(program);
})();
