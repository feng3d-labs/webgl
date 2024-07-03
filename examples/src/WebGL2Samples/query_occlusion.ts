import { IBuffer, IProgram, IRenderingContext, IVertexArrayObject } from "../../../src";
import { getShaderSource } from "./utility";

// -- Init Canvas
const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
// -- Init WebGL Context
const gl = canvas.getContext("webgl2", { antialias: false });
const isWebGL2 = !!gl;

// -- Init Program
const program: IProgram = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    depthStencil: { depth: { depthtest: true } },
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
gl.bindVertexArray(vertexArray);

// -- Init Query
const query = gl.createQuery();

// -- Render
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.bindVertexArray(vertexArray);

gl.drawArrays(gl.TRIANGLES, 0, 3);

gl.beginQuery(gl.ANY_SAMPLES_PASSED, query);
gl.drawArrays(gl.TRIANGLES, 3, 3);
gl.endQuery(gl.ANY_SAMPLES_PASSED);

(function tick()
{
    if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE))
    {
        // A query's result is never available in the same frame
        // the query was issued.  Try in the next frame.
        requestAnimationFrame(tick);

        return;
    }

    const samplesPassed = gl.getQueryParameter(query, gl.QUERY_RESULT);
    document.getElementById("samplesPassed").innerHTML = `Any samples passed: ${Number(samplesPassed)}`;
    gl.deleteQuery(query);
})();

// -- Delete WebGL resources
// gl.deleteBuffer(vertexPosBuffer);
// gl.deleteProgram(program);
gl.deleteVertexArray(vertexArray);
