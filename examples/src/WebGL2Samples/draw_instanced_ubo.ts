import { IRenderPass, IRenderPipeline } from "@feng3d/render-api";
import { IGLCanvasContext, IGLUniformBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init program
const program: IRenderPipeline = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

// -- Init Buffer
const vertices = new Float32Array([
    -0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5
]);

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
const uniformTransformBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", size: transforms.byteLength, data: transforms, usage: "DYNAMIC_DRAW" };

const materials = new Float32Array([
    1.0, 0.5, 0.0, 1.0,
    0.0, 0.5, 1.0, 1.0
]);
const uniformMaterialBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", size: materials.byteLength, data: materials, usage: "STATIC_DRAW" };

// -- Render
const rp: IRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: program,
        vertices: {
            pos: { data: vertices, format: "float32x2" },
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
webgl.deleteBuffer(uniformTransformBuffer);
webgl.deleteBuffer(uniformMaterialBuffer);
webgl.deleteProgram(program);
