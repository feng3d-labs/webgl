import { IRenderObject, IRenderPipeline } from "@feng3d/render-api";
import { IGLCanvasContext, IGLVertexAttributes, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const vertexPosBuffer = new Float32Array([-0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5]);
const vertexColorBuffer = new Float32Array([
    1.0, 0.5, 0.0,
    0.0, 0.5, 1.0]);

const program: IRenderPipeline = {
    primitive: { topology: "triangle-list" },
    vertex: { code: getShaderSource("vs") },
    fragment: { code: getShaderSource("fs"), targets: [{ blend: {} }] }
};

const vertexArray: { vertices?: IGLVertexAttributes } = {
    vertices: {
        pos: { data: vertexPosBuffer, numComponents: 2 },
        color: { data: vertexColorBuffer, numComponents: 3, divisor: 1 },
    },
};

const renderObject: IRenderObject = {
    vertices: vertexArray.vertices,
    uniforms: {},
    drawVertex: { instanceCount: 2 },
    pipeline: program
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

webgl.submit({
    commandEncoders: [{
        passEncoders: [
            {
                descriptor: {
                    colorAttachments: [{
                        clearValue: [0.0, 0.0, 0.0, 1.0],
                        loadOp: "clear",
                    }],
                },
                renderObjects: [renderObject]
            }
        ]
    }]
});

// -- Delete WebGL resources
webgl.deleteProgram(program);
