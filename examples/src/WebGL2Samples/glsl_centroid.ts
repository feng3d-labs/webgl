import { IGLBlitFramebuffer, IGLFramebuffer, IGLProgram, IGLRenderObject, IGLRenderPass, IGLRenderbuffer, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Divide viewport
const canvasSize = {
    x: canvas.width,
    y: canvas.height
};

const VIEWPORTS = {
    LEFT: 0,
    RIGHT: 1,
    MAX: 2
};

const viewport: { x: number, y: number, width: number, height: number }[] = new Array(VIEWPORTS.MAX);

viewport[VIEWPORTS.LEFT] = {
    x: 0,
    y: canvasSize.y - canvasSize.x / 2 - 50,
    width: canvasSize.x / 2,
    height: canvasSize.x / 2
};

viewport[VIEWPORTS.RIGHT] = {
    x: canvasSize.x / 2,
    y: canvasSize.y - canvasSize.x / 2 - 50,
    width: canvasSize.x / 2,
    height: canvasSize.x / 2
};

// -- Init program
const PROGRAM = {
    TEXTURE: 0,
    TEXTURE_CENTROID: 1,
    SPLASH: 2,
    MAX: 3
};

const programs: IGLProgram[] = [
    {
        vertex: { code: getShaderSource("vs-render") }, fragment: { code: getShaderSource("fs-render") },
        primitive: { topology: "TRIANGLES" },
    },
    {
        vertex: { code: getShaderSource("vs-render-centroid") }, fragment: { code: getShaderSource("fs-render-centroid") },
        primitive: { topology: "TRIANGLES" },
    },
    {
        vertex: { code: getShaderSource("vs-splash") }, fragment: { code: getShaderSource("fs-splash") },
        primitive: { topology: "TRIANGLES" },
    }
];

// -- Init primitive data
const vertexCount = 3;
const scaleFactor = 0.1;
const positions = new Float32Array([
    scaleFactor * 0.0, scaleFactor * 0.8,
    scaleFactor * -0.8, scaleFactor * -0.4,
    Number(scaleFactor), scaleFactor * -0.8,
]);

const data = new Float32Array([
    0.0, 0.0, 1.0
]);

// -- Init buffers
const vertexPositionBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const vertexDataBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data, usage: "STATIC_DRAW" };

// Draw the rect texture
// This can be discarded when gl_VertexID is available
const textureVertexPositions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const texVertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: textureVertexPositions, usage: "STATIC_DRAW" };

const textureVertexTexCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const texVertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: textureVertexTexCoords, usage: "STATIC_DRAW" };

// -- Init Texture
// used for draw framebuffer storage
const FRAMEBUFFER_SIZE = {
    x: canvas.width,
    y: canvas.height
};
const textures: IGLTexture[] = [];
const samplers: IGLSampler[] = [];

for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    textures[i] = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, level: 0 }]
    };
    samplers[i] = { minFilter: "NEAREST", magFilter: "NEAREST" };
}

// -- Init Frame Buffers

// non-centroid
const colorRenderbuffer: IGLRenderbuffer = { internalformat: "RGBA8", width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };
// centroid
const colorRenderbufferCentroid: IGLRenderbuffer = { internalformat: "RGBA8", width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };

const FRAMEBUFFER = {
    RENDERBUFFER: 0,
    RENDERBUFFER_CENTROID: 1,
    COLORBUFFER: 2,
    COLORBUFFER_CENTROID: 3
};

const framebuffers: IGLFramebuffer[] = [
    { colorAttachments: [{ view: colorRenderbuffer, clearValue: [0, 0, 0, 1], loadOp: "clear" }], multisample: 4 },
    { colorAttachments: [{ view: colorRenderbufferCentroid, clearValue: [0, 0, 0, 1], loadOp: "clear" }], multisample: 4 },
    { colorAttachments: [{ view: { texture: textures[0], level: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    { colorAttachments: [{ view: { texture: textures[1], level: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
];

// -- Init VertexArray
const vertexArrays: IGLVertexArrayObject[] = [
    {
        vertices: {
            position: { buffer: vertexPositionBuffer, numComponents: 2 },
            data: { buffer: vertexDataBuffer, numComponents: 1 },
        }
    },
    {
        vertices: {
            position: { buffer: vertexPositionBuffer, numComponents: 2 },
            data: { buffer: vertexDataBuffer, numComponents: 1 },
        }
    },
    {
        vertices: {
            position: { buffer: texVertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: texVertexTexBuffer, numComponents: 2 },
        }
    },
];

// -- Render

// Pass 1
const IDENTITY = mat4.create();
for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    // render buffers
    const rp: IGLRenderPass = {
        descriptor: framebuffers[i],
        renderObjects: [{
            pipeline: programs[i],
            vertexArray: vertexArrays[i],
            uniforms: { MVP: IDENTITY },
            drawArrays: { vertexCount },
        }]
    };
    webgl.runRenderPass(rp);

    // Blit framebuffers, no Multisample texture 2d in WebGL 2
    // centroid will only work with multisample
    const blit: IGLBlitFramebuffer = {
        read: framebuffers[i],
        draw: framebuffers[i + 2],
        blitFramebuffers: [[
            0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
            0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
            "COLOR_BUFFER_BIT", "NEAREST"
        ]],
    };
    webgl.runBlitFramebuffer(blit);
}

// Pass 2
const rp2: IGLRenderPass = {
    renderObjects: [],
};
const ro: IGLRenderObject = {
    pipeline: programs[PROGRAM.SPLASH],
    vertexArray: vertexArrays[PROGRAM.SPLASH],
};

const scaleVector3 = vec3.create();
const invScaleFactor = 0.8 / scaleFactor;
vec3.set(scaleVector3, invScaleFactor, invScaleFactor, invScaleFactor);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    rp2.renderObjects.push(
        {
            ...ro,
            uniforms: {
                MVP: mvp,
                diffuse: { texture: textures[i], sampler: samplers[i] },
            },
            viewport: viewport[i],
            drawArrays: { vertexCount: 6 },
        }
    );
}
webgl.runRenderPass(rp2);

// -- Delete WebGL resources
webgl.deleteBuffer(texVertexPosBuffer);
webgl.deleteBuffer(texVertexTexBuffer);
webgl.deleteBuffer(vertexPositionBuffer);
webgl.deleteBuffer(vertexDataBuffer);

webgl.deleteTexture(textures[PROGRAM.TEXTURE]);
webgl.deleteTexture(textures[PROGRAM.TEXTURE_CENTROID]);

webgl.deleteSampler(samplers[PROGRAM.TEXTURE]);
webgl.deleteSampler(samplers[PROGRAM.TEXTURE_CENTROID]);

webgl.deleteRenderbuffer(colorRenderbuffer);
webgl.deleteRenderbuffer(colorRenderbufferCentroid);

webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER]);
webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER]);

webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER_CENTROID]);
webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER_CENTROID]);

webgl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE]);
webgl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE_CENTROID]);
webgl.deleteVertexArray(vertexArrays[PROGRAM.SPLASH]);

webgl.deleteProgram(programs[PROGRAM.TEXTURE]);
webgl.deleteProgram(programs[PROGRAM.TEXTURE_CENTROID]);
webgl.deleteProgram(programs[PROGRAM.SPLASH]);
