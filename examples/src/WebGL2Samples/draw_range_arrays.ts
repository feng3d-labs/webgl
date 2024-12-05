import { IGLCanvasContext, IGLRenderObject, IGLRenderPass, IGLRenderPipeline, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const vertexPosBuffer: IGLVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([
        -0.8, -0.8,
        0.8, -0.8,
        0.8, 0.8,
        0.8, 0.8,
        -0.8, 0.8,
        -0.8, -0.8,
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        0.5, 0.5,
        -0.5, 0.5,
        -0.5, -0.5,
    ])
};

const pipeline: IGLRenderPipeline = {
    primitive: { topology: "TRIANGLE_STRIP" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
    }
};

const vertexCount = 12;
const renderObject: IGLRenderObject = {
    vertexArray,
    pipeline,
};

const rp: IGLRenderPass = {
    descriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [
        { __type: "Viewport", x: 0, y: 0, width: canvas.width / 2, height: canvas.height },
        {
            ...renderObject,
            drawVertex: { firstVertex: 0, vertexCount: vertexCount / 2 },
        },
        { __type: "Viewport", x: canvas.width / 2, y: 0, width: canvas.width / 2, height: canvas.height },
        {
            ...renderObject,
            drawVertex: { firstVertex: 6, vertexCount: vertexCount / 2 },
        },
    ],
};

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteProgram(pipeline);
webgl.deleteVertexArray(vertexArray);
