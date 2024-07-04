import { IBuffer, IIndexBuffer, IRenderObject, IRenderPipeline, IVertexArrayObject, WebGL } from "../../../src";
import { IRenderingContext } from "../../../src/data/IRenderingContext";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

// https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.18
// WebGL 2.0 behaves as though PRIMITIVE_RESTART_FIXED_INDEX were always enabled.
const MAX_UNSIGNED_SHORT = 65535;

const vertexPosBuffer: IBuffer = {
    data: new Float32Array([
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0,
    ])
};

const vertexElementBuffer: IIndexBuffer = {
    data: new Uint16Array([
        0, 1, 2, MAX_UNSIGNED_SHORT, 2, 3, 1
    ])
};

const program: IRenderPipeline = {
    primitive: { topology: "TRIANGLE_STRIP" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: IVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 2 },
    },
    index: vertexElementBuffer,
};

const renderObject: IRenderObject = {
    vertexArray,
    uniforms: {},
    drawArrays: { instanceCount: 2 },
    pipeline: program,
};

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

WebGL.runRenderPass(renderingContext, {
    passDescriptor: {
        colorAttachments: [{
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
        }],
    },
    renderObjects: [renderObject]
});

// -- Delete WebGL resources
WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteBuffer(renderingContext, vertexElementBuffer);
WebGL.deleteProgram(renderingContext, program);
WebGL.deleteVertexArray(renderingContext, vertexArray);
