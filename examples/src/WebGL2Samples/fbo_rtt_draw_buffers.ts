import { IGLFramebuffer, IGLRenderPass, IGLRenderPipeline, IGLCanvasContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

// -- Initialize program

// Draw buffer shaders
const drawBufferProgram: IGLRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw-buffer") },
    fragment: { code: getShaderSource("fs-draw-buffer") },
    primitive: { topology: "TRIANGLES" },
};

// Draw shaders
const drawProgram: IGLRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw") },
    fragment: { code: getShaderSource("fs-draw") },
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
        position: { buffer: triVertexPosBuffer, numComponents: 3 }
    }
};

const quadVertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: quadVertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: quadVertexTexBuffer, numComponents: 2 },
    }
};

// -- Initialize texture targets

const color1Texture: IGLTexture = {
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ width: windowSize.x, height: windowSize.y }],
};
const color1Sampler: IGLSampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "NEAREST", magFilter: "NEAREST" };

const color2Texture: IGLTexture = {
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ width: windowSize.x, height: windowSize.y }],
};
const color2Sampler: IGLSampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "NEAREST", magFilter: "NEAREST" };

// -- Initialize frame buffer

const frameBuffer: IGLFramebuffer = {
    colorAttachments: [
        { view: { texture: color1Texture, baseMipLevel: 0 } },
        { view: { texture: color2Texture, baseMipLevel: 0 } },
    ],
};

// -- Render

const renderPass: IGLRenderPass = {
    descriptor: frameBuffer,
    renderObjects: [{
        pipeline: drawBufferProgram,
        vertexArray: triVertexArray,
        drawVertex: { vertexCount: 3 },
    }],
};

// Pass 2: Draw to screen
const renderPass2: IGLRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: drawProgram,
        uniforms: {
            color1Map: { texture: color1Texture, sampler: color1Sampler },
            color2Map: { texture: color2Texture, sampler: color2Sampler },
        },
        vertexArray: quadVertexArray,
        drawVertex: { vertexCount: 6 },
    }],
};

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass, renderPass2] }] });

// Clean up
webgl.deleteBuffer(triVertexPosBuffer);
webgl.deleteBuffer(quadVertexPosBuffer);
webgl.deleteBuffer(quadVertexTexBuffer);
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(color1Texture);
webgl.deleteTexture(color2Texture);
webgl.deleteProgram(drawBufferProgram);
webgl.deleteProgram(drawProgram);

