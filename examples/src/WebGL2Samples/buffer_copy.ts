import { CanvasContext, CopyBufferToBuffer, RenderPass, RenderPipeline, VertexAttributes } from "@feng3d/render-api";
import { GLVertexBuffer, WebGL, getIGLBuffer } from "@feng3d/webgl";
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
    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
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
    const vertexPosBufferSrc: GLVertexBuffer = { target: "ARRAY_BUFFER", size: vertices.byteLength, data: vertices, usage: "STATIC_DRAW" };

    const vertexPosBufferDst = new Float32Array(vertices.length);

    const cb: CopyBufferToBuffer = {
        __type__: "CopyBufferToBuffer",
        source: vertexPosBufferSrc,
        destination: getIGLBuffer(vertexPosBufferDst, "ARRAY_BUFFER"),
        sourceOffset: 0, destinationOffset: 0, size: vertices.length * Float32Array.BYTES_PER_ELEMENT
    };

    // -- Init Vertex Array
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            pos: { data: vertexPosBufferDst, format: "float32x2" },
        }
    };

    // -- Render
    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            geometry:{
                primitive: { topology: "triangle-list" },
                vertices: vertexArray.vertices,
                draw: { __type__: "DrawVertex", vertexCount: 6 },
            },
        }]
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [cb, rp] }] });

    // -- Delete WebGL resources
    webgl.deleteBuffer(vertexPosBufferSrc);
    webgl.deleteProgram(program);
})();
