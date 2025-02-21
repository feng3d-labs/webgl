import { IRenderObject, IRenderPass, IRenderPassObject, IRenderPipeline, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, IGLOcclusionQuery, WebGL } from "@feng3d/webgl";

import { watcher } from "@feng3d/watcher";

import { getShaderSource } from "./utility";

// -- Init Canvas
const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// -- Init WebGL Context
const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init Program
const program: IRenderPipeline = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    depthStencil: {},
    primitive: { topology: "triangle-list" },
};

// -- Init Buffer
const vertices = new Float32Array([
    -0.3, -0.5, 0.0,
    0.3, -0.5, 0.0,
    0.0, 0.5, 0.0,

    -0.3, -0.5, 0.5,
    0.3, -0.5, 0.5,
    0.0, 0.5, 0.5
]);

// -- Init Vertex Array
const vertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        pos: { data: vertices, format: "float32x3", arrayStride: 0, offset: 0 },
    }
};

const renderObjects: IRenderPassObject[] = [];
// -- Render
const rp: IRenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
        depthStencilAttachment: { depthLoadOp: "clear" },
    },
    renderObjects,
};

const ro: IRenderObject = {
    vertices: vertexArray.vertices,
    pipeline: program,
    draw: { __type: "DrawVertex", firstVertex: 0, vertexCount: 3 },
};
renderObjects.push(ro);

const occlusionQuery: IGLOcclusionQuery = {
    __type: "OcclusionQuery",
    renderObjects: [{
        ...ro,
        draw: { __type: "DrawVertex", firstVertex: 3, vertexCount: 3 },
    }]
};

renderObjects.push(occlusionQuery);

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

watcher.watch(occlusionQuery, "result", () =>
{
    document.getElementById("samplesPassed").innerHTML = `Any samples passed: ${Number(occlusionQuery.result.result)}`;
});

// -- Delete WebGL resources
webgl.deleteProgram(program);
