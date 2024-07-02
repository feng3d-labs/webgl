import { IBuffer, IProgram, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas" };

// -- Initialize program

const program: IProgram = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
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
const vertexPosBuffer: IBuffer = { data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IBuffer = { data: texcoords, usage: "STATIC_DRAW" };

// -- Initialize vertex array

const vertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    },
};

// -- Initialize samplers

const samplerA: ISampler = {
    minFilter: "NEAREST_MIPMAP_NEAREST", magFilter: "NEAREST",
    wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", wrapR: "CLAMP_TO_EDGE",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
    compareMode: "NONE", compare: "LEQUAL",
};
const samplerB: ISampler = {
    minFilter: "LINEAR_MIPMAP_LINEAR", magFilter: "LINEAR",
    wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", wrapR: "CLAMP_TO_EDGE",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
    compareMode: "NONE", compare: "LEQUAL",
};

// -- Load texture then render

const imageUrl = "../../assets/img/Di-3d.png";
let texture: ITexture;
loadImage(imageUrl, function (image)
{
    texture = {
        sources: [{ source: image, level: 0 }],
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
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
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            vertexArray,
            uniforms: {
                mvp: matrix,
                material: {
                    diffuse: [
                        { texture, sampler: samplerA },
                        { texture, sampler: samplerB },
                    ]
                },
            },
            drawArrays: { vertexCount: 6, instanceCount: 1 },
        }],
    };
    WebGL.runRenderPass(rc, rp);

    // Cleanup
    WebGL.deleteBuffer(rc, vertexPosBuffer);
    WebGL.deleteBuffer(rc, vertexTexBuffer);
    WebGL.deleteSampler(rc, samplerA);
    WebGL.deleteSampler(rc, samplerB);
    WebGL.deleteVertexArray(rc, vertexArray);
    WebGL.deleteTexture(rc, texture);
    WebGL.deleteProgram(rc, program);
}