import { IPassEncoder, IRenderPassObject, RenderObject, RenderPass, RenderPassDescriptor, Material, Sampler, Texture, VertexAttributes, Viewport } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
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

const viewport: Viewport[] = new Array(VIEWPORTS.MAX);

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

const programs: Material[] = [
    {
        vertex: { code: getShaderSource("vs-render") }, fragment: { code: getShaderSource("fs-render") },
    },
    {
        vertex: { code: getShaderSource("vs-render-centroid") }, fragment: { code: getShaderSource("fs-render-centroid") },
    },
    {
        vertex: { code: getShaderSource("vs-splash") }, fragment: { code: getShaderSource("fs-splash") },
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

const textureVertexTexCoords = new Float32Array([
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
const textures: Texture[] = [];
const samplers: Sampler[] = [];

for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    textures[i] = {
        format: "rgba8unorm",
        size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y],
    };
    samplers[i] = { minFilter: "nearest", magFilter: "nearest" };
}

// -- Init Frame Buffers

const FRAMEBUFFER = {
    RENDERBUFFER: 0,
    RENDERBUFFER_CENTROID: 1,
    COLORBUFFER: 2,
    COLORBUFFER_CENTROID: 3
};

const framebuffers: RenderPassDescriptor[] = [
    { colorAttachments: [{ view: { texture: textures[0], baseMipLevel: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }], sampleCount: 4 },
    { colorAttachments: [{ view: { texture: textures[1], baseMipLevel: 0 }, clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }], sampleCount: 4 },
];

// -- Init VertexArray
const vertexArrays: { vertices?: VertexAttributes }[] = [
    {
        vertices: {
            position: { data: positions, format: "float32x2" },
            data: { data, format: "float32" },
        }
    },
    {
        vertices: {
            position: { data: positions, format: "float32x2" },
            data: { data, format: "float32" },
        }
    },
    {
        vertices: {
            position: { data: textureVertexPositions, format: "float32x2" },
            texcoord: { data: textureVertexTexCoords, format: "float32x2" },
        }
    },
];

// -- Render
const passEncoders: IPassEncoder[] = [];

// Pass 1
const IDENTITY = mat4.create();
for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    // render buffers
    const rp: RenderPass = {
        descriptor: framebuffers[i],
        renderObjects: [{
            pipeline: programs[i],
            uniforms: { MVP: IDENTITY },
            geometry: {
                primitive: { topology: "triangle-list" },
                vertices: vertexArrays[i].vertices,
                draw: { __type: "DrawVertex", vertexCount },
            }
        }]
    };
    passEncoders.push(rp);
}

const renderObjects: IRenderPassObject[] = [];
// Pass 2
const rp2: RenderPass = {
    renderObjects,
};
const ro: RenderObject = {
    pipeline: programs[PROGRAM.SPLASH],
    geometry: {
        primitive: { topology: "triangle-list" },
        vertices: vertexArrays[PROGRAM.SPLASH].vertices,
        draw: { __type: "DrawVertex", vertexCount: 6 },
    },
};

const scaleVector3 = vec3.create();
const invScaleFactor = 0.8 / scaleFactor;
vec3.set(scaleVector3, invScaleFactor, invScaleFactor, invScaleFactor);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

for (let i = 0; i < VIEWPORTS.MAX; ++i)
{
    renderObjects.push(
        {
            ...ro,
            viewport: viewport[i],
            uniforms: {
                MVP: mvp,
                diffuse: { texture: textures[i], sampler: samplers[i] },
            },
            geometry: {
                draw: { __type: "DrawVertex", vertexCount: 6 },
            }
        }
    );
}
passEncoders.push(rp2);

webgl.submit({ commandEncoders: [{ passEncoders }] });

// -- Delete WebGL resources

webgl.deleteTexture(textures[PROGRAM.TEXTURE]);
webgl.deleteTexture(textures[PROGRAM.TEXTURE_CENTROID]);

webgl.deleteSampler(samplers[PROGRAM.TEXTURE]);
webgl.deleteSampler(samplers[PROGRAM.TEXTURE_CENTROID]);

webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER]);
webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER]);

webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER_CENTROID]);
webgl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER_CENTROID]);

webgl.deleteProgram(programs[PROGRAM.TEXTURE]);
webgl.deleteProgram(programs[PROGRAM.TEXTURE_CENTROID]);
webgl.deleteProgram(programs[PROGRAM.SPLASH]);
