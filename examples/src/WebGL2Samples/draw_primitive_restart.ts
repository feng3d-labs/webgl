import { IGLIndexBuffer, IGLRenderingContext, IGLRenderObject, IGLRenderPipeline, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

// https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.18
// WebGL 2.0 behaves as though PRIMITIVE_RESTART_FIXED_INDEX were always enabled.
const MAX_UNSIGNED_SHORT = 65535;

const vertexPosBuffer: IGLVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0,
    ])
};

const vertexElementBuffer: IGLIndexBuffer = {
    target: "ELEMENT_ARRAY_BUFFER",
    data: new Uint16Array([
        0, 1, 2, MAX_UNSIGNED_SHORT, 2, 3, 1
    ])
};

const program: IGLRenderPipeline = {
    primitive: { topology: "TRIANGLE_STRIP" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const vertexArray: IGLVertexArrayObject = {
    vertices: {
        pos: { buffer: vertexPosBuffer, numComponents: 2 },
    },
    index: vertexElementBuffer,
};

const renderObject: IGLRenderObject = {
    vertexArray,
    uniforms: {},
    drawElements: { instanceCount: 2 },
    pipeline: program,
};

webgl.submit({
    commandEncoders: [{
        passEncoders: [{
            descriptor: {
                colorAttachments: [{
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: "clear",
                }],
            },
            renderObjects: [renderObject]
        }]
    }]
})

// -- Delete WebGL resources
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(vertexElementBuffer);
webgl.deleteProgram(program);
webgl.deleteVertexArray(vertexArray);
