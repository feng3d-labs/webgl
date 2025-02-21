import { IRenderPass, IRenderPipeline, ISampler, ITexture, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Initialize program

const program: IRenderPipeline = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
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
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);

// -- Initialize vertex array

const vertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        position: { data: positions, format: "float32x2" },
        textureCoordinates: { data: texcoords, format: "float32x2" },
    },
};

// -- Initialize samplers

const samplerA: ISampler = {
    minFilter: "nearest", magFilter: "nearest", mipmapFilter: "nearest",
    addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", addressModeW: "clamp-to-edge",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
};
const samplerB: ISampler = {
    minFilter: "linear", magFilter: "linear", mipmapFilter: "linear",
    addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", addressModeW: "clamp-to-edge",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
};

// -- Load texture then render

const imageUrl = "../../assets/img/Di-3d.png";
let texture: ITexture;
loadImage(imageUrl, function (image)
{
    texture = {
        size: [image.width, image.height],
        sources: [{ image, mipLevel: 0 }],
        format: "rgba8unorm",
        generateMipmap: true,
    };

    render();
});

function render()
{
    const matrix = new Float32Array([
        0.8, 0.0, 0.0, 0.0,
        0.0, 0.8, 0.0, 0.0,
        0.0, 0.0, 0.8, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const rp: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            uniforms: {
                mvp: matrix,
                materialDiffuse0: { texture, sampler: samplerA },
                materialDiffuse1: { texture, sampler: samplerB },
            },
            geometry:{
                primitive: { topology: "triangle-list" },
                vertices: vertexArray.vertices,
                draw: { __type: "DrawVertex", vertexCount: 6, instanceCount: 1 },
            }
        }],
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // Cleanup
    webgl.deleteSampler(samplerA);
    webgl.deleteSampler(samplerB);
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}