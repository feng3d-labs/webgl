import { CanvasContext, IRenderPassObject, OcclusionQuery, RenderObject, RenderPass, RenderPipeline, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { watcher } from "@feng3d/watcher";

import { getShaderSource } from "./utility";

// -- Init Canvas
const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// -- Init WebGL Context
const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init Program
const program: RenderPipeline = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    depthStencil: {},
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
const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        pos: { data: vertices, format: "float32x3", arrayStride: 0, offset: 0 },
    }
};

const renderObjects: IRenderPassObject[] = [];
// -- Render
const rp: RenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
        depthStencilAttachment: { depthLoadOp: "clear" },
    },
    renderObjects,
};

const ro: RenderObject = {
    pipeline: program,
    geometry: {
        primitive: { topology: "triangle-list" },
        vertices: vertexArray.vertices,
        draw: { __type__: "DrawVertex", firstVertex: 0, vertexCount: 3 },
    }
};
renderObjects.push(ro);

const occlusionQuery: OcclusionQuery = {
    __type__: "OcclusionQuery",
    renderObjects: [{
        ...ro,
        geometry: {
            ...ro.geometry,
            draw: { __type__: "DrawVertex", firstVertex: 3, vertexCount: 3 },
        }
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
