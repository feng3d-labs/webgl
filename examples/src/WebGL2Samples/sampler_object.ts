import { CanvasContext, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';

import { getShaderSource, loadImage } from './utility';

const canvas = document.createElement('canvas');
canvas.id = 'glcanvas';
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2' };
const webgl = new WebGL(rc);

// -- Initialize program

const program: RenderPipeline = {
    vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs') },
    primitive: { topology: 'triangle-list' },
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
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,
]);

// -- Initialize vertex array

const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: 'float32x2' },
        textureCoordinates: { data: texcoords, format: 'float32x2' },
    },
};

// -- Initialize samplers

const samplerA: Sampler = {
    minFilter: 'nearest', magFilter: 'nearest', mipmapFilter: 'nearest',
    addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge', addressModeW: 'clamp-to-edge',
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
};
const samplerB: Sampler = {
    minFilter: 'linear', magFilter: 'linear', mipmapFilter: 'linear',
    addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge', addressModeW: 'clamp-to-edge',
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
};

// -- Load texture then render

const imageUrl = '../../assets/img/Di-3d.png';
let texture: Texture;
loadImage(imageUrl, function (image)
{
    texture = {
        descriptor: {
            size: [image.width, image.height],
            format: 'rgba8unorm',
            generateMipmap: true,
        },
        sources: [{ image, mipLevel: 0 }],
    };

    render();
});

function render()
{
    const matrix = new Float32Array([
        0.8, 0.0, 0.0, 0.0,
        0.0, 0.8, 0.0, 0.0,
        0.0, 0.0, 0.8, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);

    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: 'clear' }] },
        renderPassObjects: [{
            pipeline: program,
            bindingResources: {
                mvp: matrix,
                materialDiffuse0: { texture, sampler: samplerA },
                materialDiffuse1: { texture, sampler: samplerB },
            },
            vertices: vertexArray.vertices,
            draw: { __type__: 'DrawVertex', vertexCount: 6, instanceCount: 1 },
        }],
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // Cleanup
    webgl.deleteSampler(samplerA);
    webgl.deleteSampler(samplerB);
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}