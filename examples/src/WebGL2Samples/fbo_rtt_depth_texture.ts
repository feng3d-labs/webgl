import { RenderPass, RenderPassDescriptor, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
const webgl = new WebGL(renderingContext);

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

// -- Initialize program

// Depth shaders
const depthProgram: RenderPipeline = {
    vertex: { code: getShaderSource("vs-depth") }, fragment: { code: getShaderSource("fs-depth") },
    depthStencil: {},
};

// Draw shaders
const drawProgram: RenderPipeline = {
    vertex: { code: getShaderSource("vs-draw") }, fragment: { code: getShaderSource("fs-draw") },
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

const triVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: triPositions, format: "float32x3" },
    }
};

const quadVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: quadPositions, format: "float32x2" },
        textureCoordinates: { data: quadTexcoords, format: "float32x2" },
    }
};

// -- Initialize depth texture

// the proper texture format combination can be found here
// https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
const depthTexture: Texture = {
    size: [windowSize.x, windowSize.y],
    format: "depth16unorm",
};
const depthSampler: Sampler = { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", minFilter: "nearest", magFilter: "nearest" };

// -- Initialize frame buffer

const frameBuffer: RenderPassDescriptor = {
    colorAttachments: [],
    depthStencilAttachment: { view: { texture: depthTexture, baseMipLevel: 0 }, depthLoadOp: "clear" },
};

// -- Render

// Pass 1: Depth
const renderPass: RenderPass = {
    descriptor: frameBuffer,
    renderObjects: [{
        pipeline: depthProgram,
        geometry:{
            primitive: { topology: "triangle-list" },
            vertices: triVertexArray.vertices,
            draw: { __type: "DrawVertex", vertexCount: 3 },
        }
    }],

};

// Pass 2: Draw
const rp2: RenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
    },
    renderObjects: [{
        pipeline: drawProgram,
        uniforms: { depthMap: { texture: depthTexture, sampler: depthSampler } },
        geometry:{
            primitive: { topology: "triangle-list" },
            vertices: quadVertexArray.vertices,
            draw: { __type: "DrawVertex", vertexCount: 6 },
        }
    }],
};

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass, rp2] }] });

// Clean up
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(depthTexture);
webgl.deleteProgram(depthProgram);
webgl.deleteProgram(drawProgram);

