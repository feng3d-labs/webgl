import { ICopyBuffer, IRenderPass, IRenderPipeline, IRenderingContext, IVertexArrayObject, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
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
    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: IRenderPipeline = {
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
    const vertexPosBufferSrc: IVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

    const vertexPosBufferDst: IVertexBuffer = { target: "ARRAY_BUFFER", data: new Float32Array(vertices.length), usage: "STATIC_DRAW" };

    const cb: ICopyBuffer = {
        read: vertexPosBufferSrc,
        write: vertexPosBufferDst,
        readOffset: 0, writeOffset: 0, size: vertices.length * Float32Array.BYTES_PER_ELEMENT
    };
    webgl.runCopyBuffer(cb);

    // -- Init Vertex Array
    const vertexArray: IVertexArrayObject = {
        vertices: {
            pos: { buffer: vertexPosBufferDst, numComponents: 2 },
        }
    };

    // -- Render
    const rp: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            vertexArray,
            drawArrays: { vertexCount: 6 },
        }]
    };
    webgl.runRenderPass(rp);

    // -- Delete WebGL resources
    webgl.deleteBuffer(vertexPosBufferSrc);
    webgl.deleteBuffer(vertexPosBufferDst);
    webgl.deleteProgram(program);
    webgl.deleteVertexArray(vertexArray);
})();
