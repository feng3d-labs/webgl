import { IGLFramebuffer, IGLRenderObject, IGLRenderPass, IGLRenderPipeline, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

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
const multipleOutputProgram: IGLRenderPipeline = {
    vertex: { code: getShaderSource("vs-multiple-output") }, fragment: { code: getShaderSource("fs-multiple-output") },
    primitive: { topology: "TRIANGLES" },
};

// Layer shaders
const layerProgram: IGLRenderPipeline = {
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
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

// -- Initialize vertex array

const multipleOutputVertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
    }
};

const layerVertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

// -- Initialize texture

const w = 16;
const h = 16;

const texture: IGLTexture = {
    target: "TEXTURE_2D_ARRAY",
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ level: 0, width: w, height: h, depth: 3 }],
};
const sampler: IGLSampler = { minFilter: "NEAREST", magFilter: "NEAREST", lodMinClamp: 0, lodMaxClamp: 0 };

// -- Initialize frame buffer

const frameBuffer: IGLFramebuffer = {
    colorAttachments: [
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.RED } },
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.GREEN } },
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.BLUE } },
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

const renderPass1: IGLRenderPass = {
    descriptor: frameBuffer,
    renderObjects: [
        { __type: "IGLViewport", x: 0, y: 0, width: w, height: h },
        {
            pipeline: multipleOutputProgram,
            uniforms: { mvp: matrix },
            vertexArray: multipleOutputVertexArray,
            drawArrays: { vertexCount: 6 },
        }]
};

// Pass 2

const renderPass: IGLRenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
    },
    renderObjects: [],
};

const renderObject: IGLRenderObject = {
    pipeline: layerProgram,
    uniforms: { mvp: matrix, diffuse: { texture, sampler } },
    vertexArray: layerVertexArray,

};

//
for (let i = 0; i < Textures.MAX; ++i)
{
    renderPass.renderObjects.push(
        { __type: "IGLViewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
        {
            ...renderObject,
            uniforms: { ...renderObject.uniforms, layer: i },
            drawArrays: { vertexCount: 6 },
        }
    );
}

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass1, renderPass] }] });

// Clean up
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(vertexTexBuffer);
webgl.deleteVertexArray(multipleOutputVertexArray);
webgl.deleteVertexArray(layerVertexArray);
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(texture);
webgl.deleteProgram(multipleOutputProgram);
webgl.deleteProgram(layerProgram);