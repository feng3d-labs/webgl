import { IRenderObject, IRenderPass, IRenderPipeline, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const vertexPosBuffer = new Float32Array([
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
]);

const pipeline: IRenderPipeline = {
    primitive: { topology: "triangle-strip" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        position: { data: vertexPosBuffer, format: "float32x2" },
    }
};

const vertexCount = 12;
const renderObject: IRenderObject = {
    vertices: vertexArray.vertices,
    pipeline,
};

const rp: IRenderPass = {
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

webgl.deleteProgram(pipeline);
