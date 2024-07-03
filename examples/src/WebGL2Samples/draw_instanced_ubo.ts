import { IBuffer, IProgram, IRenderPass, IRenderingContext, WebGL } from "../../../src";
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
const vertexPosBuffer: IBuffer = { data: vertices, usage: "STATIC_DRAW" };

// const uniformTransformLocation = gl.getUniformBlockIndex(program, "Transform");
// const uniformMaterialLocation = gl.getUniformBlockIndex(program, "Material");
// gl.uniformBlockBinding(program, uniformTransformLocation, 0);
// gl.uniformBlockBinding(program, uniformMaterialLocation, 1);

// const transforms = new Float32Array([
//     1.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 0.0, 0.0,
//     0.0, 0.0, 1.0, 0.0,
//     -0.5, 0.0, 0.0, 1.0,

//     1.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 0.0, 0.0,
//     0.0, 0.0, 1.0, 0.0,
//     0.5, 0.0, 0.0, 1.0
// ]);
// const uniformTransformBuffer: IBuffer = { data: transforms, usage: "DYNAMIC_DRAW" };

// const materials = new Float32Array([
//     1.0, 0.5, 0.0, 1.0,
//     0.0, 0.5, 1.0, 1.0
// ]);
// const uniformMaterialBuffer: IBuffer = { data: materials, usage: "STATIC_DRAW" };

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
            // Transform: {
            transform: {
                MVP: [
                    [1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        -0.5, 0.0, 0.0, 1.0
                    ],
                    [1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.5, 0.0, 0.0, 1.0
                    ]
                ]
            },
            // Material: {
            material: {
                Diffuse: [
                    [1.0, 0.5, 0.0, 1.0],
                    [0.0, 0.5, 1.0, 1.0]
                ]
            },
        },
        drawArrays: { vertexCount: 3, instanceCount: 2 },
    }]
};
WebGL.runRenderPass(rc, rp);

// gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uniformTransformBuffer);
// gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, uniformMaterialBuffer);

// -- Delete WebGL resources
// gl.deleteBuffer(vertexPosBuffer);
// gl.deleteBuffer(uniformTransformBuffer);
// gl.deleteBuffer(uniformMaterialBuffer);
// gl.deleteProgram(program);
