import { CanvasContext, RenderObject, RenderPass, RenderPassDescriptor, RenderPassObject, RenderPipeline, Sampler, Texture, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { getShaderSource } from './utility';

const canvas = document.createElement('canvas');
canvas.id = 'glcanvas';
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2' };
const webgl = new WebGL(renderingContext, {
    clearColorValue: [0.0, 0.0, 0.0, 1.0],
    loadColorOp: 'clear',
});

// -- Divide viewport

const windowSize = {
    x: canvas.width,
    y: canvas.height,
};

const Textures = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    MAX: 3,
};

const viewport = new Array(Textures.MAX);

viewport[Textures.RED] = {
    x: windowSize.x / 2,
    y: 0,
    z: windowSize.x / 2,
    w: windowSize.y / 2,
};

viewport[Textures.GREEN] = {
    x: windowSize.x / 2,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2,
};

viewport[Textures.BLUE] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2,
};

// -- Initialize program

// Multiple out shaders
const multipleOutputProgram: RenderPipeline = {
    vertex: { code: getShaderSource('vs-multiple-output') }, fragment: { code: getShaderSource('fs-multiple-output') },
    primitive: { topology: 'triangle-list' },
};

// Layer shaders
const layerProgram: RenderPipeline = {
    vertex: { code: getShaderSource('vs-layer') }, fragment: { code: getShaderSource('fs-layer') },
};

// -- Initialize buffer

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0,
]);

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
]);

// -- Initialize vertex array

const multipleOutputVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: 'float32x2' },
    },
};

const layerVertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: 'float32x2' },
        textureCoordinates: { data: texcoords, format: 'float32x2' },
    },
};

// -- Initialize texture

const w = 16;
const h = 16;

const texture: Texture = {
    descriptor: {
        dimension: '2d-array',
        size: [w, h, 3],
        format: 'rgba8unorm',
    },
};
const sampler: Sampler = { lodMinClamp: 0, lodMaxClamp: 0, minFilter: 'nearest', magFilter: 'nearest' };

// -- Initialize frame buffer

const frameBuffer: RenderPassDescriptor = {
    colorAttachments: [
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.RED } },
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.GREEN } },
        { view: { texture, baseMipLevel: 0, baseArrayLayer: Textures.BLUE } },
    ],
};

// -- Render

// Pass 1
const matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]);
const rp1: RenderPass = {
    descriptor: frameBuffer,
    renderPassObjects: [
        {
            viewport: { x: 0, y: 0, width: w, height: h },
            pipeline: multipleOutputProgram,
            bindingResources: { mvp: { value: matrix } },
            vertices: multipleOutputVertexArray.vertices,
            draw: { __type__: 'DrawVertex', vertexCount: 6 },
        }],
};

const renderObjects: RenderPassObject[] = [];
// Pass 2
const rp: RenderPass = {
    renderPassObjects: renderObjects,
};

const ro: RenderObject = {
    pipeline: layerProgram,
    bindingResources: {
        mvp: { value: matrix },
        diffuse: { texture, sampler },
        layer: { value: 0 },
    },
    vertices: layerVertexArray.vertices,
    draw: { __type__: 'DrawVertex', vertexCount: 6 },
};

for (let i = 0; i < Textures.MAX; ++i)
{
    renderObjects.push(
        {
            ...ro,
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            bindingResources: { ...ro.bindingResources, layer: { value: i } },
        });
}

webgl.submit({ commandEncoders: [{ passEncoders: [rp1, rp] }] });

const data = new Uint8Array(w * h * 4 * 3);

let result = webgl.readPixels({
    textureView: frameBuffer.colorAttachments[0].view,
    origin: [0, 0],
    copySize: [w, h],
});
data.set(new Uint8Array(result.buffer), 0);
result = webgl.readPixels({
    textureView: frameBuffer.colorAttachments[1].view,
    origin: [0, 0],
    copySize: [w, h],
});
data.set(new Uint8Array(result.buffer), w * h * 4);
result = webgl.readPixels({
    textureView: frameBuffer.colorAttachments[2].view,
    origin: [0, 0],
    copySize: [w, h],
});
data.set(new Uint8Array(result.buffer), w * h * 4 * 2);

console.log(data);

// Clean up
webgl.deleteFramebuffer(frameBuffer);
webgl.deleteTexture(texture);
webgl.deleteProgram(multipleOutputProgram);
webgl.deleteProgram(layerProgram);

