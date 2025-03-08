import { RenderObject, RenderPass, RenderPipeline, VertexAttributes } from "@feng3d/render-api";
import { GLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: GLCanvasContext = { canvasId: "glcanvas" };
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

const pipeline: RenderPipeline = {
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: vertexPosBuffer, format: "float32x2" },
    }
};

const vertexCount = 12;
const renderObject: RenderObject = {
    pipeline: pipeline,
    geometry: {
        primitive: { topology: "triangle-strip" },
        vertices: vertexArray.vertices,
        draw: undefined,
    }
};

const rp: RenderPass = {
    descriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [
        {
            ...renderObject,
            viewport: { x: 0, y: 0, width: canvas.width / 2, height: canvas.height },
            geometry: {
                ...renderObject.geometry,
                draw: { __type__: "DrawVertex", firstVertex: 0, vertexCount: vertexCount / 2 },
            }
        },
        {
            ...renderObject,
            viewport: { x: canvas.width / 2, y: 0, width: canvas.width / 2, height: canvas.height },
            geometry: {
                ...renderObject.geometry,
                draw: { __type__: "DrawVertex", firstVertex: 6, vertexCount: vertexCount / 2 },
            },
        },
    ],
};

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

webgl.deleteProgram(pipeline);
