import { IRenderPass, IRenderPassDescriptor, IRenderPipeline, ISampler, ITexture, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
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
const drawBufferProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw-buffer") },
    fragment: { code: getShaderSource("fs-draw-buffer") },
    primitive: { topology: "triangle-list" },
};

// Draw shaders
const drawProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-draw") },
    fragment: { code: getShaderSource("fs-draw") },
    primitive: { topology: "triangle-list" },
};

// -- Initialize buffer

const triPositions = new Float32Array([
    -0.5, -0.5, -1.0,
    0.5, -0.5, -1.0,
    0.0, 0.5, 1.0
]);

const quadPositions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);

const quadTexcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);

// -- Initialize vertex array

const triVertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        position: { data: triPositions, format: "float32x3" }
    }
};

const quadVertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        position: { data: quadPositions, format: "float32x2" },
        textureCoordinates: { data: quadTexcoords, format: "float32x2" },
    }
};

// -- Initialize texture targets

const color1Texture: ITexture = {
    format: "rgba8unorm",
    size: [windowSize.x, windowSize.y],
};
const color1Sampler: ISampler = { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", minFilter: "nearest", magFilter: "nearest" };

const color2Texture: ITexture = {
    format: "rgba8unorm",
    size: [windowSize.x, windowSize.y],
};
const color2Sampler: ISampler = { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", minFilter: "nearest", magFilter: "nearest" };

// -- Initialize frame buffer

const frameBuffer: IRenderPassDescriptor = {
    colorAttachments: [
        { view: { texture: color1Texture, baseMipLevel: 0 } },
        { view: { texture: color2Texture, baseMipLevel: 0 } },
    ],
};

// -- Render

const renderPass: IRenderPass = {
    descriptor: frameBuffer,
    renderObjects: [{
        pipeline: drawBufferProgram,
        vertices: triVertexArray.vertices,
        drawVertex: { vertexCount: 3 },
    }],
};

// Pass 2: Draw to screen
const renderPass2: IRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [{
        pipeline: drawProgram,
        uniforms: {
            color1Map: { texture: color1Texture, sampler: color1Sampler },
            color2Map: { texture: color2Texture, sampler: color2Sampler },
        },
        vertices: quadVertexArray.vertices,
        drawVertex: { vertexCount: 6 },
    }],
};

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass, renderPass2] }] });

// Clean up
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(color1Texture);
webgl.deleteTexture(color2Texture);
webgl.deleteProgram(drawBufferProgram);
webgl.deleteProgram(drawProgram);

