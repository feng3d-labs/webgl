import { IBuffer, IRenderObject, IRenderPipeline, IVertexArrayObject, WebGL } from "../../../src";
import { IRenderingContext } from "../../../src/data/IRenderingContext";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const vertexPosBuffer: IBuffer = {
    data: new Float32Array([-0.3, -0.5,
        0.3, -0.5,
        0.0, 0.5])
};
const vertexColorBuffer: IBuffer = {
    data: new Float32Array([
        1.0, 0.5, 0.0,
        0.0, 0.5, 1.0])
};

const program: IRenderPipeline = {
    primitive: { topology: "TRIANGLES" },
    vertex: { code: getShaderSource("vs") },
    fragment: { code: getShaderSource("fs"), targets: [{ blend: {} }] }
};

const vertexArray: IVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 2 },
        color: { buffer: vertexColorBuffer, numComponents: 3, divisor: 1 },
    },
};

const renderObject: IRenderObject = {
    vertexArray,
    uniforms: {},
    drawArrays: { instanceCount: 2 },
    pipeline: program
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

WebGL.runRenderPass(renderingContext, {
    passDescriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [renderObject]
});

// -- Delete WebGL resources
WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteBuffer(renderingContext, vertexColorBuffer);
WebGL.deleteProgram(renderingContext, program);
WebGL.deleteVertexArray(renderingContext, vertexArray);
