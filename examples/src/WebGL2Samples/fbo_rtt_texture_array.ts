import { IBuffer, IFramebuffer, IRenderObject, IRenderPass, IRenderPipeline, IRenderingContext, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", { antialias: false });
const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

// -- Divide viewport

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

const Textures = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    MAX: 3
};

const viewport: { x: number, y: number, z: number, w: number }[] = new Array(Textures.MAX);

viewport[Textures.RED] = {
    x: windowSize.x / 2,
    y: 0,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Textures.GREEN] = {
    x: windowSize.x / 2,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Textures.BLUE] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

// -- Initialize program

// Multiple out shaders
const multipleOutputProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-multiple-output") }, fragment: { code: getShaderSource("fs-multiple-output") },
    primitive: { topology: "TRIANGLES" },
};

// Layer shaders
const layerProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-layer") }, fragment: { code: getShaderSource("fs-layer") },
    primitive: { topology: "TRIANGLES" },
};

// -- Initialize buffer

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer: IBuffer = { data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const vertexTexBuffer: IBuffer = { data: texcoords, usage: "STATIC_DRAW" };

// -- Initialize vertex array

const multipleOutputVertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
    }
};

const layerVertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

// -- Initialize texture

const w = 16;
const h = 16;

const texture: ITexture = {
    textureTarget: "TEXTURE_2D_ARRAY",
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ level: 0, width: w, height: h, depth: 3 }],
    sampler: { minFilter: "NEAREST", magFilter: "NEAREST", lodMinClamp: 0, lodMaxClamp: 0 }
};

// -- Initialize frame buffer

const frameBuffer: IFramebuffer = {
    colorAttachments: [
        { view: { texture, level: 0, layer: Textures.RED } },
        { view: { texture, level: 0, layer: Textures.GREEN } },
        { view: { texture, level: 0, layer: Textures.BLUE } },
    ]
};

// -- Render

// Pass 1

const matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

const renderPass1: IRenderPass = {
    passDescriptor: frameBuffer,
    renderObjects: [{
        pipeline: multipleOutputProgram,
        uniforms: { mvp: matrix },
        vertexArray: multipleOutputVertexArray,
        viewport: { x: 0, y: 0, width: w, height: h },
        drawArrays: { vertexCount: 6 },
    }]
};

// Pass 2

const renderPass: IRenderPass = {
    passDescriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
    },
    renderObjects: [],
};

const renderObject: IRenderObject = {
    pipeline: layerProgram,
    uniforms: { mvp: matrix, diffuse: texture },
    vertexArray: layerVertexArray,

};

//
for (let i = 0; i < Textures.MAX; ++i)
{
    renderPass.renderObjects.push(
        {
            ...renderObject,
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            uniforms: { ...renderObject.uniforms, layer: i },
            drawArrays: { vertexCount: 6 },
        }
    );
}

WebGL.runRenderPass(renderingContext, renderPass1);
WebGL.runRenderPass(renderingContext, renderPass);

// Clean up
WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteBuffer(renderingContext, vertexTexBuffer);
WebGL.deleteVertexArray(renderingContext, multipleOutputVertexArray);
WebGL.deleteVertexArray(renderingContext, layerVertexArray);
WebGL.deleteFramebuffer(renderingContext, frameBuffer);
WebGL.deleteTexture(renderingContext, texture);
WebGL.deleteProgram(renderingContext, multipleOutputProgram);
WebGL.deleteProgram(renderingContext, layerProgram);