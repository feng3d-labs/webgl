import { IGLProgram, IGLQuery, IGLRenderObject, IGLRenderPass, IGLRenderingContext, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

// -- Init Canvas
const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// -- Init WebGL Context
const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
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
const vertexArray: IGLVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 3, normalized: false, vertexSize: 0, offset: 0 },
    }
};
// -- Init Query
const query: IGLQuery = {};

// -- Render
const rp: IGLRenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
        depthStencilAttachment: { depthLoadOp: "clear" },
    },
    renderObjects: [],
};

const ro: IGLRenderObject = {
    vertexArray,
    pipeline: program,
    drawArrays: { firstVertex: 0, vertexCount: 3 },
};
rp.renderObjects.push(ro);

rp.renderObjects.push({ __type: "IGLQueryAction", action: "beginQuery", target: "ANY_SAMPLES_PASSED", query });

rp.renderObjects.push({
    ...ro,
    drawArrays: { firstVertex: 3, vertexCount: 3 },
});

rp.renderObjects.push({ __type: "IGLQueryAction", action: "endQuery", target: "ANY_SAMPLES_PASSED", query });

webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

webgl.getQueryResult(query).then((samplesPassed) =>
{
    document.getElementById("samplesPassed").innerHTML = `Any samples passed: ${Number(samplesPassed)}`;
});

// -- Delete WebGL resources
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteProgram(program);
webgl.deleteVertexArray(vertexArray);
