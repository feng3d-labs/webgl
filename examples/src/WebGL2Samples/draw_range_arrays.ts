import { IBuffer, IRenderObject, IRenderPass, IRenderPipeline, WebGL } from "../../../src";
import { IRenderingContext } from "../../../src/data/IRenderingContext";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const vertexPosBuffer: IBuffer = {
    data: [
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
    ]
};

const pipeline: IRenderPipeline = {
    primitive: { topology: "TRIANGLE_STRIP", cullMode: "NONE" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexCount = 12;
const renderAtomic: IRenderObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
    },
    pipeline,
};

const data: IRenderPass = {
    passDescriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [
        {
            ...renderAtomic,
            drawVertex: { firstVertex: 0, vertexCount: vertexCount / 2 },
            viewport: { x: 0, y: 0, width: canvas.width / 2, height: canvas.height },
        },
        {
            ...renderAtomic,
            drawVertex: { firstVertex: 6, vertexCount: vertexCount / 2 },
            viewport: { x: canvas.width / 2, y: 0, width: canvas.width / 2, height: canvas.height },
        },
    ],
};

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

WebGL.runRenderPass(renderingContext, data);

WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteProgram(renderingContext, pipeline);
WebGL.deleteVertexArray(renderingContext, renderAtomic);
