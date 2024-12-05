import { IGLProgram, IGLRenderPass, IGLCanvasContext, IGLUniformBuffer, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init program
const program: IGLProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

// -- Init Buffer
const vertices = new Float32Array([
    -0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5
]);
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

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
const uniformTransformBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", data: transforms, usage: "DYNAMIC_DRAW" };

const materials = new Float32Array([
    1.0, 0.5, 0.0, 1.0,
    0.0, 0.5, 1.0, 1.0
]);
const uniformMaterialBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", data: materials, usage: "STATIC_DRAW" };

// -- Render
const rp: IGLRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: program,
        vertices: {
            pos: { buffer: vertexPosBuffer, numComponents: 2 },
        },
        uniforms: {
            Transform: uniformTransformBuffer,
            Material: uniformMaterialBuffer,
        },
        drawVertex: { vertexCount: 3, instanceCount: 2 },
    }]
};

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

// -- Delete WebGL resources
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(uniformTransformBuffer);
webgl.deleteBuffer(uniformMaterialBuffer);
webgl.deleteProgram(program);
