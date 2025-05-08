import { CanvasContext, RenderPassObject, RenderObject, RenderPass, RenderPassDescriptor, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: CanvasContext = { canvasId: "glcanvas" };
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
const multipleOutputProgram: RenderPipeline = {
    vertex: { code: getShaderSource("vs-multiple-output") }, fragment: { code: getShaderSource("fs-multiple-output") },
};

// Layer shaders
const layerProgram: RenderPipeline = {
    vertex: { code: getShaderSource("vs-layer") }, fragment: { code: getShaderSource("fs-layer") },
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

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);

// -- Initialize vertex array

const multipleOutputVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: "float32x2" },
    }
};

const layerVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: "float32x2" },
        textureCoordinates: { data: texcoords, format: "float32x2" },
    }
};

// -- Initialize texture

const w = 16;
const h = 16;

const texture: Texture = {
    dimension: "2d-array",
    format: "rgba8unorm",
    size: [w, h, 3],
};
const sampler: Sampler = { minFilter: "nearest", magFilter: "nearest", lodMinClamp: 0, lodMaxClamp: 0 };

// -- Initialize frame buffer

const frameBuffer: RenderPassDescriptor = {
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

const renderPass1: RenderPass = {
    descriptor: frameBuffer,
    renderObjects: [
        {
            viewport: { x: 0, y: 0, width: w, height: h },
            pipeline: multipleOutputProgram,
            bindingResources: { mvp: matrix },
            geometry: {
                primitive: { topology: "triangle-list" },
                vertices: multipleOutputVertexArray.vertices,
                draw: { __type__: "DrawVertex", vertexCount: 6 },
            }
        }]
};

// Pass 2
const renderObjects: RenderPassObject[] = [];
const renderPass: RenderPass = {
    descriptor: {
        colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
    },
    renderObjects,
};

const renderObject: RenderObject = {
    pipeline: layerProgram,
    bindingResources: { mvp: matrix, diffuse: { texture, sampler } },
    geometry: {
        primitive: { topology: "triangle-list" },
        vertices: layerVertexArray.vertices,
        draw: { __type__: "DrawVertex", vertexCount: 6 },
    }
};

//
for (let i = 0; i < Textures.MAX; ++i)
{
    renderObjects.push(
        {
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            ...renderObject,
            bindingResources: { ...renderObject.bindingResources, layer: i },
            geometry: {
                ...renderObject.geometry,
                draw: { __type__: "DrawVertex", vertexCount: 6 },
            }
        }
    );
}

webgl.submit({ commandEncoders: [{ passEncoders: [renderPass1, renderPass] }] });

// Clean up
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(texture);
webgl.deleteProgram(multipleOutputProgram);
webgl.deleteProgram(layerProgram);