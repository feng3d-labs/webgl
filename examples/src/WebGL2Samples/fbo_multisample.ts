import { IGLBlitFramebuffer, IGLRenderPass, IGLRenderPassDescriptor, IGLRenderPipeline, IGLRenderbuffer, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(renderingContext);

// -- Init program
const PROGRAM = {
    TEXTURE: 0,
    SPLASH: 1,
    MAX: 2
};

const programs: IGLRenderPipeline[] = [
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
const vertexDataBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data, usage: "STATIC_DRAW" };

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

// -- Init Texture
// used for draw framebuffer storage
const FRAMEBUFFER_SIZE = {
    x: canvas.width,
    y: canvas.height
};
const texture: IGLTexture = {
    internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE",
    sources: [{ level: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0, pixels: null }],
};
const sampler: IGLSampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

// -- Init Frame Buffers
const FRAMEBUFFER = {
    RENDERBUFFER: 0,
    COLORBUFFER: 1
};
const colorRenderbuffer: IGLRenderbuffer = { internalformat: "RGBA8", width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };

const framebuffer: IGLRenderPassDescriptor = {
    colorAttachments: [{ view: { texture, baseMipLevel: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0] }],
    multisample: 4 // 多重采样
};

// -- Init VertexArray
const vertexArrays: IGLVertexArrayObject[] = [
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
const renderPass1: IGLRenderPass = {
    descriptor: framebuffer,
    renderObjects: [{
        pipeline: programs[PROGRAM.TEXTURE],
        vertexArray: vertexArrays[PROGRAM.TEXTURE],
        uniforms: { MVP: IDENTITY },
        drawArrays: { vertexCount },
    }]
};

// Pass 2

const scaleVector3 = vec3.create();
vec3.set(scaleVector3, 8.0, 8.0, 8.0);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

const renderPass2: IGLRenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [
        {
            pipeline: programs[PROGRAM.SPLASH],
            vertexArray: vertexArrays[PROGRAM.SPLASH],
            uniforms: { diffuse: { texture, sampler }, MVP: mvp },
            drawArrays: { vertexCount: 6 },
        }
    ],
};

webgl.submit({
    commandEncoders: [{
        passEncoders: [renderPass1,
            // blitFramebuffer,
            renderPass2]
    }]
});

// -- Delete WebGL resources
webgl.deleteBuffer(vertexDataBuffer);
webgl.deleteBuffer(vertexPosBuffer);
webgl.deleteBuffer(vertexTexBuffer);
webgl.deleteTexture(texture);
webgl.deleteSampler(sampler);
webgl.deleteRenderbuffer(colorRenderbuffer);
webgl.deleteFramebuffer(framebuffer);
webgl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE]);
webgl.deleteVertexArray(vertexArrays[PROGRAM.SPLASH]);
webgl.deleteProgram(programs[PROGRAM.TEXTURE]);
webgl.deleteProgram(programs[PROGRAM.SPLASH]);

webgl;