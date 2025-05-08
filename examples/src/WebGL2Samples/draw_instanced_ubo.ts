import { CanvasContext, RenderPass, RenderPipeline } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init program
const program: RenderPipeline = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

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
        [1.0, 0.5, 0.0, 1.0],
        [0.0, 0.5, 1.0, 1.0],
    ]
};

// -- Render
const rp: RenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1], loadOp: "clear" }] },
    renderPassObjects: [{
        pipeline: program,
        bindingResources: {
            Transform: transforms,
            Material: materials,
        },
        vertices: {
            pos: { data: vertices, format: "float32x2" },
        },
        draw: { __type__: "DrawVertex", vertexCount: 3, instanceCount: 2 },
    }]
};

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

// -- Delete WebGL resources
// webgl.deleteBuffer(getIGLBuffer(transforms));
// webgl.deleteBuffer(getIGLBuffer(materials));
webgl.deleteProgram(program);
