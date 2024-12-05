import { IGLOcclusionQuery, IGLProgram, IGLQuery, IGLRenderObject, IGLRenderPass, IGLCanvasContext, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";
import { watcher } from "@feng3d/watcher";

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
const program: IGLProgram = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    depthStencil: { depth: { depthtest: true } },
    primitive: { topology: "TRIANGLES" },
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
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

// -- Init Vertex Array
const vertexArray: { vertices?: IGLVertexAttributes } = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 3, normalized: false, vertexSize: 0, offset: 0 },
    }
};

// -- Render
const rp: IGLRenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
        depthStencilAttachment: { depthLoadOp: "clear" },
    },
    renderObjects: [],
};

const ro: IGLRenderObject = {
    vertices: vertexArray.vertices,
    pipeline: program,
    drawVertex: { firstVertex: 0, vertexCount: 3 },
};
rp.renderObjects.push(ro);

const occlusionQuery: IGLOcclusionQuery = {
    __type: "OcclusionQuery",
    renderObjects: [{
        ...ro,
        drawVertex: { firstVertex: 3, vertexCount: 3 },
    }]
};

rp.renderObjects.push(occlusionQuery);

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

watcher.watch(occlusionQuery, "result", () =>
{
    document.getElementById("samplesPassed").innerHTML = `Any samples passed: ${Number(occlusionQuery.result.result)}`;
});

// -- Delete WebGL resources
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteProgram(program);
