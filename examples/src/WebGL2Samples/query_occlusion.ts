import { IBuffer, IProgram, IQuery, IRenderObject, IRenderPass, IRenderingContext, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

// -- Init Canvas
const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// -- Init WebGL Context
const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

// -- Init Program
const program: IProgram = {
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
const vertexPosBuffer: IBuffer = { data: vertices, usage: "STATIC_DRAW" };

// -- Init Vertex Array
const vertexArray: IVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 3, normalized: false, vertexSize: 0, offset: 0 },
    }
};
// -- Init Query
const query: IQuery = {};

// -- Render
const rp: IRenderPass = {
    passDescriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
        depthStencilAttachment: { depthLoadOp: "clear" },
    },
    renderObjects: [],
};

const ro: IRenderObject = {
    vertexArray,
    pipeline: program,
    drawArrays: { firstVertex: 0, vertexCount: 3 },
};
rp.renderObjects.push(ro);

rp.renderObjects.push({ action: "beginQuery", target: "ANY_SAMPLES_PASSED", query });

rp.renderObjects.push({
    ...ro,
    drawArrays: { firstVertex: 3, vertexCount: 3 },
});

rp.renderObjects.push({ action: "endQuery", target: "ANY_SAMPLES_PASSED", query });

WebGL.runRenderPass(rc, rp);

WebGL.getQueryResult(rc, query).then((samplesPassed) =>
{
    document.getElementById("samplesPassed").innerHTML = `Any samples passed: ${Number(samplesPassed)}`;
});

// -- Delete WebGL resources
WebGL.deleteBuffer(rc, vertexPosBuffer);
WebGL.deleteProgram(rc, program);
WebGL.deleteVertexArray(rc, vertexArray);
