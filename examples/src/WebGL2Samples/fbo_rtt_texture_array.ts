import { IBuffer, IFramebuffer, IRenderPipeline, IRenderingContext, ITexture, IVertexArrayObject } from "../../../src";
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

const viewport = new Array(Textures.MAX);

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
const multipleOutputProgram: IRenderPipeline = { vertex: { code: getShaderSource("vs-multiple-output") }, fragment: { code: getShaderSource("fs-multiple-output") } };

// Layer shaders
const layerProgram: IRenderPipeline = { vertex: { code: getShaderSource("vs-layer") }, fragment: { code: getShaderSource("fs-layer") } };

const layerUniformMvpLocation = gl.getUniformLocation(layerProgram, "mvp");
const layerUniformDiffuseLocation = gl.getUniformLocation(layerProgram, "diffuse");
const layerUniformLayerLocation = gl.getUniformLocation(layerProgram, "layer");

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

const texture: ITexture = {
    textureTarget: "TEXTURE_2D_ARRAY",
    internalformat: "RGBA",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    sources: [{ width: 16, height: 16, level: 0 }],
    sampler: { minFilter: "NEAREST", magFilter: "NEAREST", lodMinClamp: 0, lodMaxClamp: 0 }
};

// -- Initialize frame buffer

const frameBuffer: IFramebuffer = {
    colorAttachments: [
        { view: { texture, level: 0 } },
        { view: { texture, level: 0 } },
        { view: { texture, level: 0 } },
    ]
};
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);

const drawBuffers = new Array(3);
drawBuffers[Textures.RED] = gl.COLOR_ATTACHMENT0;
drawBuffers[Textures.GREEN] = gl.COLOR_ATTACHMENT1;
drawBuffers[Textures.BLUE] = gl.COLOR_ATTACHMENT2;

gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture, 0, Textures.RED);
gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT1, texture, 0, Textures.GREEN);
gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT2, texture, 0, Textures.BLUE);

let status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
if (status != gl.FRAMEBUFFER_COMPLETE)
{
    console.log(`fb status: ${status.toString(16)}`);

    return;
}

gl.drawBuffers(drawBuffers);

gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

// -- Render

// Clear color buffer
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Pass 1
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);

// Bind program
gl.useProgram(multipleOutputProgram);

const matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);
gl.uniformMatrix4fv(multipleOutputUniformMvpLocation, false, matrix);
gl.bindVertexArray(multipleOutputVertexArray);
gl.viewport(0, 0, w, h);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// Pass 2
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

// Bind program
gl.useProgram(layerProgram);
gl.uniformMatrix4fv(layerUniformMvpLocation, false, matrix);
gl.uniform1i(layerUniformDiffuseLocation, 0);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
gl.bindVertexArray(layerVertexArray);

status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
if (status != gl.FRAMEBUFFER_COMPLETE)
{
    console.log(`fb status: ${status.toString(16)}`);

    return;
}

for (let i = 0; i < Textures.MAX; ++i)
{
    gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
    gl.uniform1i(layerUniformLayerLocation, i);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Clean up
gl.deleteBuffer(vertexPosBuffer);
gl.deleteBuffer(vertexTexBuffer);
gl.deleteVertexArray(multipleOutputVertexArray);
gl.deleteVertexArray(layerVertexArray);
gl.deleteFramebuffer(frameBuffer);
gl.deleteTexture(texture);
gl.deleteProgram(multipleOutputProgram);
gl.deleteProgram(layerProgram);