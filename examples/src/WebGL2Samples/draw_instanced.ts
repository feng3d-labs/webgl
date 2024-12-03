import { IGLRenderingContext, IGLRenderObject, IGLRenderPipeline, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const vertexPosBuffer: IGLVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([-0.3, -0.5,
        0.3, -0.5,
        0.0, 0.5])
};
const vertexColorBuffer: IGLVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([
        1.0, 0.5, 0.0,
        0.0, 0.5, 1.0])
};

const program: IGLRenderPipeline = {
    primitive: { topology: "TRIANGLES" },
    vertex: { code: getShaderSource("vs") },
    fragment: { code: getShaderSource("fs"), targets: [{ blend: {} }] }
};

const vertexArray: IGLVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 2 },
        color: { buffer: vertexColorBuffer, numComponents: 3, divisor: 1 },
    },
};

const renderObject: IGLRenderObject = {
    vertexArray,
    uniforms: {},
    drawArrays: { instanceCount: 2 },
    pipeline: program
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

webgl.runRenderPass({
    descriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [renderObject]
});

// -- Delete WebGL resources
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(vertexColorBuffer);
webgl.deleteProgram(program);
webgl.deleteVertexArray(vertexArray);
