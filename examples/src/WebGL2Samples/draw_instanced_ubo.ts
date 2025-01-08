import { IRenderPass, IRenderPipeline } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
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

const transforms = {
    MVP: [
        new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -0.5, 0.0, 0.0, 1.0,
        ]),
        new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.5, 0.0, 0.0, 1.0
        ]),
    ]
};

const materials = {
    Diffuse: [
        [1.0, 0.5, 0.0, 1.0,],
        [0.0, 0.5, 1.0, 1.0],
    ]
};

// -- Render
const rp: IRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: program,
        vertices: {
            pos: { data: vertices, format: "float32x2" },
        },
        uniforms: {
            Transform: transforms,
            Material: materials,
        },
        drawVertex: { vertexCount: 3, instanceCount: 2 },
    }]
};

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

// -- Delete WebGL resources
// webgl.deleteBuffer(getIGLBuffer(transforms));
// webgl.deleteBuffer(getIGLBuffer(materials));
webgl.deleteProgram(program);
