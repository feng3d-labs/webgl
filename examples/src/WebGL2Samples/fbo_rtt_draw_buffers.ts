import { IVertexBuffer, IBuffer, IFramebuffer, IRenderPass, IRenderPipeline, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

// -- Initialize program

// Draw buffer shaders
const drawBufferProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw-buffer") },
    fragment: { code: getShaderSource("fs-draw-buffer") },
    primitive: { topology: "TRIANGLES" },
};

// Draw shaders
const drawProgram: IRenderPipeline = {
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
const triVertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: triPositions, usage: "STATIC_DRAW" };

const quadPositions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const quadVertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: quadPositions, usage: "STATIC_DRAW" };

const quadTexcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const quadVertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: quadTexcoords, usage: "STATIC_DRAW" };

// -- Initialize vertex array

const triVertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: triVertexPosBuffer, numComponents: 3 }
    }
};

const quadVertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: quadVertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: quadVertexTexBuffer, numComponents: 2 },
    }
};

// -- Initialize texture targets

const color1Texture: ITexture = {
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ width: windowSize.x, height: windowSize.y }],
};
const color1Sampler: ISampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "NEAREST", magFilter: "NEAREST" };

const color2Texture: ITexture = {
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ width: windowSize.x, height: windowSize.y }],
};
const color2Sampler: ISampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "NEAREST", magFilter: "NEAREST" };

// -- Initialize frame buffer

const frameBuffer: IFramebuffer = {
    colorAttachments: [
        { view: { texture: color1Texture, level: 0 } },
        { view: { texture: color2Texture, level: 0 } },
    ],
};

// -- Render

const renderPass: IRenderPass = {
    passDescriptor: frameBuffer,
    renderObjects: [{
        pipeline: drawBufferProgram,
        vertexArray: triVertexArray,
        drawArrays: { vertexCount: 3 },
    }],
};
WebGL.runRenderPass(renderingContext, renderPass);

// Pass 2: Draw to screen
const renderPass2: IRenderPass = {
    passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: drawProgram,
        uniforms: {
            color1Map: { texture: color1Texture, sampler: color1Sampler },
            color2Map: { texture: color2Texture, sampler: color2Sampler },
        },
        vertexArray: quadVertexArray,
        drawArrays: { vertexCount: 6 },
    }],
};
WebGL.runRenderPass(renderingContext, renderPass2);

// Clean up
WebGL.deleteBuffer(renderingContext, triVertexPosBuffer);
WebGL.deleteBuffer(renderingContext, quadVertexPosBuffer);
WebGL.deleteBuffer(renderingContext, quadVertexTexBuffer);
WebGL.deleteVertexArray(renderingContext, triVertexArray);
WebGL.deleteVertexArray(renderingContext, quadVertexArray);
WebGL.deleteFramebuffer(renderingContext, frameBuffer);
WebGL.deleteTexture(renderingContext, color1Texture);
WebGL.deleteTexture(renderingContext, color2Texture);
WebGL.deleteProgram(renderingContext, drawBufferProgram);
WebGL.deleteProgram(renderingContext, drawProgram);

