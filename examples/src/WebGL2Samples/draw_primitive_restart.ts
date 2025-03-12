import { CanvasContext, RenderObject, RenderPipeline, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: CanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

// https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.18
// WebGL 2.0 behaves as though PRIMITIVE_RESTART_FIXED_INDEX were always enabled.
const MAX_UNSIGNED_SHORT = 65535;

const vertexPosBuffer = new Float32Array([
    -1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0,
]);

const program: RenderPipeline = {
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }],
    }
};

const indices = new Uint16Array([
    0, 1, 2, MAX_UNSIGNED_SHORT, 2, 3, 1
]);

const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        pos: { data: vertexPosBuffer, format: "float32x2" },
    },
};

const renderObject: RenderObject = {
    uniforms: {},
    geometry: {
        primitive: { topology: "triangle-strip" },
        vertices: vertexArray.vertices,
        indices,
        draw: { __type__: "DrawIndexed", indexCount: 7, instanceCount: 2 },
    },
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
});

// -- Delete WebGL resources
webgl.deleteProgram(program);
