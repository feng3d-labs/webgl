import { IVertexBuffer, IBuffer, IProgram, IRenderPass, IRenderingContext, IUniformBuffer, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

// -- Init program
const program: IProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

// -- Init Buffer
const vertices = new Float32Array([
    -0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5
]);
const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

const transforms = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    -0.5, 0.0, 0.0, 1.0,

    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.0, 0.0, 1.0
]);
const uniformTransformBuffer: IUniformBuffer = { target: "UNIFORM_BUFFER", data: transforms, usage: "DYNAMIC_DRAW" };

const materials = new Float32Array([
    1.0, 0.5, 0.0, 1.0,
    0.0, 0.5, 1.0, 1.0
]);
const uniformMaterialBuffer: IUniformBuffer = { target: "UNIFORM_BUFFER", data: materials, usage: "STATIC_DRAW" };

// -- Render
const rp: IRenderPass = {
    passDescriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: program,
        vertexArray: {
            vertices: {
                pos: { buffer: vertexPosBuffer, numComponents: 2 },
            },
        },
        uniforms: {
            Transform: uniformTransformBuffer,
            Material: uniformMaterialBuffer,
        },
        drawArrays: { vertexCount: 3, instanceCount: 2 },
    }]
};
WebGL.runRenderPass(rc, rp);

// -- Delete WebGL resources
WebGL.deleteBuffer(rc, vertexPosBuffer);
WebGL.deleteBuffer(rc, uniformTransformBuffer);
WebGL.deleteBuffer(rc, uniformMaterialBuffer);
WebGL.deleteProgram(rc, program);
