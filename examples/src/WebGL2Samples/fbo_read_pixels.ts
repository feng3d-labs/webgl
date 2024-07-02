import { IBuffer, IFramebuffer, IRenderPass, IRenderPipeline, ITexture, IVertexArrayObject } from "../../../src";
import { max } from "../regl-examples/stackgl/gl-vec3";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", { antialias: false });

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
const multipleOutputProgram: IRenderPipeline = {
    vertex: { code: getShaderSource("vs-multiple-output") }, fragment: { code: getShaderSource("fs-multiple-output") },
};

const multipleOutputUniformMvpLocation = gl.getUniformLocation(multipleOutputProgram, "mvp");

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

const w = 16;
const h = 16;

gl.activeTexture(gl.TEXTURE0);
const texture: ITexture = {
    textureTarget: "TEXTURE_2D_ARRAY",
    sampler: { lodMinClamp: 0, lodMaxClamp: 0, minFilter: "NEAREST", magFilter: "NEAREST" },
    sources: [{ width: w, height: h, level: 0, depth: 3 }],
    internalformat: "RGB8",
    format: "RGB",
    type: "UNSIGNED_BYTE",
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
const rp: IRenderPass = {
    passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] }
};

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
const rp1: IRenderPass = {
    passDescriptor: frameBuffer,
    renderObjects: [{
        pipeline: multipleOutputProgram,
        uniforms: { mvp: max },
        vertexArray: multipleOutputVertexArray,
        viewport: { x: 0, y: 0, width: w, height: h },
        drawArrays: { vertexCount: 6 },
    }],
};

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

const data = new Uint8Array(w * h * 4 * 3);
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, frameBuffer);
gl.readBuffer(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, 0);
gl.readBuffer(gl.COLOR_ATTACHMENT1);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, w * h * 4);
gl.readBuffer(gl.COLOR_ATTACHMENT2);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, w * h * 4 * 2);
console.log(data);

// Clean up
gl.deleteBuffer(vertexPosBuffer);
gl.deleteBuffer(vertexTexBuffer);
gl.deleteVertexArray(multipleOutputVertexArray);
gl.deleteVertexArray(layerVertexArray);
gl.deleteFramebuffer(frameBuffer);
gl.deleteTexture(texture);
gl.deleteProgram(multipleOutputProgram);
gl.deleteProgram(layerProgram);

