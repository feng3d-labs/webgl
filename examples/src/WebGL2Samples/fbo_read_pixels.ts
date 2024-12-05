import { IGLFramebuffer, IGLRenderObject, IGLRenderPass, IGLRenderPipeline, IGLCanvasContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
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
    sources: [{ width: w, height: h, level: 0, depth: 3 }],
    internalformat: "RGB8",
    format: "RGB",
    type: "UNSIGNED_BYTE",
};
const sampler: IGLSampler = { lodMinClamp: 0, lodMaxClamp: 0, minFilter: "NEAREST", magFilter: "NEAREST" };

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
const rp1: IGLRenderPass = {
    descriptor: frameBuffer,
    renderObjects: [
        { __type: "Viewport", x: 0, y: 0, width: w, height: h },
        {
            pipeline: multipleOutputProgram,
            uniforms: { mvp: matrix },
            vertexArray: multipleOutputVertexArray,
            drawVertex: { vertexCount: 6 },
        }],
};

// Pass 2
const rp: IGLRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: []
};

const ro: IGLRenderObject = {
    pipeline: layerProgram,
    uniforms: {
        mvp: matrix,
        diffuse: { texture, sampler },
        layer: 0,
    },
    vertexArray: layerVertexArray,
    drawVertex: { vertexCount: 6 },
};

for (let i = 0; i < Textures.MAX; ++i)
{
    rp.renderObjects.push(
        { __type: "Viewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
        {
            ...ro,
            uniforms: { ...ro.uniforms, layer: i },
        });
}

webgl.submit({ commandEncoders: [{ passEncoders: [rp1, rp] }] });

const data = new Uint8Array(w * h * 4 * 3);

webgl.runReadPixels({
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT0",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: 0
});
webgl.runReadPixels({
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT1",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: w * h * 4
});
webgl.runReadPixels({
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT1",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: w * h * 4 * 2
});

console.log(data);

// Clean up
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(vertexTexBuffer);
webgl.deleteVertexArray(multipleOutputVertexArray);
webgl.deleteVertexArray(layerVertexArray);
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(texture);
webgl.deleteProgram(multipleOutputProgram);
webgl.deleteProgram(layerProgram);

