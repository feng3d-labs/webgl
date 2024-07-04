import { mat4, vec3 } from "gl-matrix";
import { IAttributeBuffer, IBlitFramebuffer, IBuffer, IPassDescriptor, IRenderPass, IRenderPipeline, IRenderbuffer, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

// -- Init program
const PROGRAM = {
    TEXTURE: 0,
    SPLASH: 1,
    MAX: 2
};

const programs: IRenderPipeline[] = [
    {
        vertex: { code: getShaderSource("vs-render") },
        fragment: { code: getShaderSource("fs-render") },
        primitive: { topology: "LINE_LOOP" },
    },
    {
        vertex: { code: getShaderSource("vs-splash") },
        fragment: { code: getShaderSource("fs-splash") },
        primitive: { topology: "TRIANGLES" },
    },
];

// -- Init primitive data
const vertexCount = 18;
const data = new Float32Array(vertexCount * 2);
let angle: number;
const radius = 0.1;
for (let i = 0; i < vertexCount; i++)
{
    angle = Math.PI * 2 * i / vertexCount;
    data[2 * i] = radius * Math.sin(angle);
    data[2 * i + 1] = radius * Math.cos(angle);
}

// -- Init buffers
const vertexDataBuffer: IAttributeBuffer = { target: "ARRAY_BUFFER", data, usage: "STATIC_DRAW" };

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer: IAttributeBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IAttributeBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

// -- Init Texture
// used for draw framebuffer storage
const FRAMEBUFFER_SIZE = {
    x: canvas.width,
    y: canvas.height
};
const texture: ITexture = {
    internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE",
    sources: [{ level: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0, pixels: null }],
};
const sampler: ISampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

// -- Init Frame Buffers
const FRAMEBUFFER = {
    RENDERBUFFER: 0,
    COLORBUFFER: 1
};
const colorRenderbuffer: IRenderbuffer = { samples: 4, internalformat: "RGBA8", width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };

const framebuffers: IPassDescriptor[] = [
    {
        colorAttachments: [{ view: colorRenderbuffer, clearValue: [0.0, 0.0, 0.0, 1.0] }],
    },
    {
        colorAttachments: [{ view: { texture, level: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0] }],
    },
];

// -- Init VertexArray
const vertexArrays: IVertexArrayObject[] = [
    {
        vertices: { position: { buffer: vertexDataBuffer, numComponents: 2 } }
    },
    {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    },
];

const IDENTITY = mat4.create();

// -- Render

// Pass 1
const renderPass1: IRenderPass = {
    passDescriptor: framebuffers[FRAMEBUFFER.RENDERBUFFER],
    renderObjects: [{
        pipeline: programs[PROGRAM.TEXTURE],
        vertexArray: vertexArrays[PROGRAM.TEXTURE],
        uniforms: { MVP: IDENTITY },
        drawArrays: { vertexCount },
    }]
};

WebGL.runRenderPass(renderingContext, renderPass1);

// Blit framebuffers, no Multisample texture 2d in WebGL 2
const blitFramebuffer: IBlitFramebuffer = {
    read: framebuffers[FRAMEBUFFER.RENDERBUFFER],
    draw: framebuffers[FRAMEBUFFER.COLORBUFFER],
    blitFramebuffers: [[0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
        0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
        "COLOR_BUFFER_BIT", "NEAREST"]],
};
WebGL.runBlitFramebuffer(renderingContext, blitFramebuffer);

// Pass 2

const scaleVector3 = vec3.create();
vec3.set(scaleVector3, 8.0, 8.0, 8.0);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

const renderPass2: IRenderPass = {
    passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [
        {
            pipeline: programs[PROGRAM.SPLASH],
            vertexArray: vertexArrays[PROGRAM.SPLASH],
            uniforms: { diffuse: { texture, sampler }, MVP: mvp },
            drawArrays: { vertexCount: 6 },
        }
    ],
};
WebGL.runRenderPass(renderingContext, renderPass2);

// -- Delete WebGL resources
WebGL.deleteBuffer(renderingContext, vertexDataBuffer);
WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
WebGL.deleteBuffer(renderingContext, vertexTexBuffer);
WebGL.deleteTexture(renderingContext, texture);
WebGL.deleteRenderbuffer(renderingContext, colorRenderbuffer);
WebGL.deleteFramebuffer(renderingContext, framebuffers[FRAMEBUFFER.RENDERBUFFER]);
WebGL.deleteFramebuffer(renderingContext, framebuffers[FRAMEBUFFER.COLORBUFFER]);
WebGL.deleteVertexArray(renderingContext, vertexArrays[PROGRAM.TEXTURE]);
WebGL.deleteVertexArray(renderingContext, vertexArrays[PROGRAM.SPLASH]);
WebGL.deleteProgram(renderingContext, programs[PROGRAM.TEXTURE]);
WebGL.deleteProgram(renderingContext, programs[PROGRAM.SPLASH]);
