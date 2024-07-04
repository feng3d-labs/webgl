import { IVertexBuffer, IBuffer, IFramebuffer, IRenderObject, IRenderPass, IRenderPipeline, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

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
const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

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
    target: "TEXTURE_2D_ARRAY",
    sources: [{ width: w, height: h, level: 0, depth: 3 }],
    internalformat: "RGB8",
    format: "RGB",
    type: "UNSIGNED_BYTE",
};
const sampler: ISampler = { lodMinClamp: 0, lodMaxClamp: 0, minFilter: "NEAREST", magFilter: "NEAREST" };

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
const rp1: IRenderPass = {
    passDescriptor: frameBuffer,
    renderObjects: [{
        pipeline: multipleOutputProgram,
        uniforms: { mvp: matrix },
        vertexArray: multipleOutputVertexArray,
        viewport: { x: 0, y: 0, width: w, height: h },
        drawArrays: { vertexCount: 6 },
    }],
};
WebGL.runRenderPass(renderingContext, rp1);

// Pass 2
const rp: IRenderPass = {
    passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: []
};

const ro: IRenderObject = {
    pipeline: layerProgram,
    uniforms: {
        mvp: matrix,
        diffuse: { texture, sampler },
        layer: 0,
    },
    vertexArray: layerVertexArray,
    drawArrays: { vertexCount: 6 },
};

for (let i = 0; i < Textures.MAX; ++i)
{
    rp.renderObjects.push({
        ...ro,
        viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
        uniforms: { ...ro.uniforms, layer: i },
    });
}
WebGL.runRenderPass(renderingContext, rp);

const data = new Uint8Array(w * h * 4 * 3);

WebGL.runReadPixels(renderingContext, {
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT0",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: 0
});
WebGL.runReadPixels(renderingContext, {
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT1",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: w * h * 4
});
WebGL.runReadPixels(renderingContext, {
    frameBuffer, attachmentPoint: "COLOR_ATTACHMENT1",
    x: 0, y: 0, width: w, height: h, format: "RGBA", type: "UNSIGNED_BYTE", dstData: data, dstOffset: w * h * 4 * 2
});

console.log(data);

// Clean up
WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteBuffer(renderingContext, vertexTexBuffer);
WebGL.deleteVertexArray(renderingContext, multipleOutputVertexArray);
WebGL.deleteVertexArray(renderingContext, layerVertexArray);
WebGL.deleteFramebuffer(renderingContext, frameBuffer);
WebGL.deleteTexture(renderingContext, texture);
WebGL.deleteProgram(renderingContext, multipleOutputProgram);
WebGL.deleteProgram(renderingContext, layerProgram);

