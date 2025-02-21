import { RenderPass, RenderPassDescriptor, Material, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(renderingContext);

// -- Init program
const PROGRAM = {
    TEXTURE: 0,
    SPLASH: 1,
    MAX: 2
};

const programs: Material[] = [
    {
        vertex: { code: getShaderSource("vs-render") },
        fragment: { code: getShaderSource("fs-render") },
    },
    {
        vertex: { code: getShaderSource("vs-splash") },
        fragment: { code: getShaderSource("fs-splash") },
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

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);

// -- Init Texture
// used for draw framebuffer storage
const FRAMEBUFFER_SIZE = {
    x: canvas.width,
    y: canvas.height
};
const texture: Texture = {
    format: "rgba8unorm",
    size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y]
};
const sampler: Sampler = { minFilter: "nearest", magFilter: "nearest" };

// -- Init Frame Buffers
const framebuffer: RenderPassDescriptor = {
    colorAttachments: [{ view: { texture, baseMipLevel: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0] }],
    sampleCount: 4 // 多重采样
};

// -- Init VertexArray
const vertexArrays: { vertices?: VertexAttributes }[] = [
    {
        vertices: { position: { data, format: "float32x2" } }
    },
    {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
        }
    },
];

const IDENTITY = mat4.create();

// -- Render

// Pass 1
const renderPass1: RenderPass = {
    descriptor: framebuffer,
    renderObjects: [{
        pipeline: programs[PROGRAM.TEXTURE],
        uniforms: { MVP: IDENTITY },
        geometry: {
            primitive: { topology: "LINE_LOOP" },
            vertices: vertexArrays[PROGRAM.TEXTURE].vertices,
            draw: { __type: "DrawVertex", vertexCount },
        }
    }]
};

// Pass 2

const scaleVector3 = vec3.create();
vec3.set(scaleVector3, 8.0, 8.0, 8.0);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

const renderPass2: RenderPass = {
    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
    renderObjects: [
        {
            pipeline: programs[PROGRAM.SPLASH],
            uniforms: { diffuse: { texture, sampler }, MVP: mvp },
            geometry: {
                primitive: { topology: "triangle-list" },
                vertices: vertexArrays[PROGRAM.SPLASH].vertices,
                draw: { __type: "DrawVertex", vertexCount: 6 },
            }
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
webgl.deleteTexture(texture);
webgl.deleteSampler(sampler);
webgl.deleteFramebuffer(framebuffer);
webgl.deleteProgram(programs[PROGRAM.TEXTURE]);
webgl.deleteProgram(programs[PROGRAM.SPLASH]);

webgl;