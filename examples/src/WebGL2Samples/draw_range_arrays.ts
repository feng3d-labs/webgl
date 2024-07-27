import { IVertexBuffer, IBuffer, IRenderObject, IRenderPass, IRenderPipeline, IVertexArrayObject, WebGL } from "@feng3d/webgl-renderer";
import { IRenderingContext } from "../../../src/data/IRenderingContext";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const vertexPosBuffer: IVertexBuffer = {
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

const pipeline: IRenderPipeline = {
    primitive: { topology: "TRIANGLE_STRIP" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
    }
};

const vertexCount = 12;
const renderObject: IRenderObject = {
    vertexArray,
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
            ...renderObject,
            drawArrays: { firstVertex: 0, vertexCount: vertexCount / 2 },
            viewport: { x: 0, y: 0, width: canvas.width / 2, height: canvas.height },
        },
        {
            ...renderObject,
            drawArrays: { firstVertex: 6, vertexCount: vertexCount / 2 },
            viewport: { x: canvas.width / 2, y: 0, width: canvas.width / 2, height: canvas.height },
        },
    ],
};

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

WebGL.runRenderPass(renderingContext, data);

WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteProgram(renderingContext, pipeline);
WebGL.deleteVertexArray(renderingContext, vertexArray);
