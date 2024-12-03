import { IGLFramebuffer, IGLRenderPass, IGLRenderPipeline, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
const webgl = new WebGL(renderingContext);

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

// -- Initialize program

// Depth shaders
const depthProgram: IGLRenderPipeline = {
    vertex: { code: getShaderSource("vs-depth") }, fragment: { code: getShaderSource("fs-depth") },
    depthStencil: { depth: { depthtest: true } },
    primitive: { topology: "TRIANGLES" },
};

// Draw shaders
const drawProgram: IGLRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw") }, fragment: { code: getShaderSource("fs-draw") },
    primitive: { topology: "TRIANGLES" },
};

// -- Initialize buffer

const triPositions = new Float32Array([
    -0.5, -0.5, -1.0,
    0.5, -0.5, -1.0,
    0.0, 0.5, 1.0
]);
const triVertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: triPositions, usage: "STATIC_DRAW" };

const quadPositions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const quadVertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: quadPositions, usage: "STATIC_DRAW" };

const quadTexcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const quadVertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: quadTexcoords, usage: "STATIC_DRAW" };

// -- Initialize vertex array

const triVertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: triVertexPosBuffer, numComponents: 3 },
    }
};

const quadVertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: quadVertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: quadVertexTexBuffer, numComponents: 2 },
    }
};

// -- Initialize depth texture

// the proper texture format combination can be found here
// https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
const depthTexture: IGLTexture = {
    sources: [{ width: windowSize.x, height: windowSize.y, level: 0 }],
    internalformat: "DEPTH_COMPONENT16",
    format: "DEPTH_COMPONENT",
    type: "UNSIGNED_SHORT",
};
const depthSampler: IGLSampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "NEAREST", magFilter: "NEAREST" };

// -- Initialize frame buffer

const frameBuffer: IGLFramebuffer = {
    colorAttachments: [],
    depthStencilAttachment: { view: { texture: depthTexture, level: 0 }, depthLoadOp: "clear" },
};

// -- Render

// Pass 1: Depth
const renderPass: IGLRenderPass = {
    descriptor: frameBuffer,
    renderObjects: [{
        pipeline: depthProgram,
        vertexArray: triVertexArray,
        drawArrays: { vertexCount: 3 },
    }],

};

// Pass 2: Draw
const rp2: IGLRenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
    },
    renderObjects: [{
        pipeline: drawProgram,
        uniforms: { depthMap: { texture: depthTexture, sampler: depthSampler } },
        vertexArray: quadVertexArray,
        drawArrays: { vertexCount: 6 },
    }],
};

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass, rp2] }] });

// Clean up
webgl.deleteBuffer(triVertexPosBuffer);
webgl.deleteBuffer(quadVertexPosBuffer);
webgl.deleteBuffer(quadVertexTexBuffer);
webgl.deleteVertexArray(triVertexArray);
webgl.deleteVertexArray(quadVertexArray);
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(depthTexture);
webgl.deleteProgram(depthProgram);
webgl.deleteProgram(drawProgram);

