import { IGLCanvasContext, IGLProgram, IGLRenderPass, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Initialize program

const program: IGLProgram = {
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

const texcoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);

// -- Initialize vertex array

const vertexArray: { vertices?: IGLVertexAttributes } = {
    vertices: {
        position: { data: positions, numComponents: 2 },
        textureCoordinates: { data: texcoords, numComponents: 2 },
    },
};

// -- Initialize samplers

const samplerA: IGLSampler = {
    minFilter: "NEAREST_MIPMAP_NEAREST", magFilter: "NEAREST",
    wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", wrapR: "CLAMP_TO_EDGE",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
    compareMode: "NONE", compare: "LEQUAL",
};
const samplerB: IGLSampler = {
    minFilter: "LINEAR_MIPMAP_LINEAR", magFilter: "LINEAR",
    wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", wrapR: "CLAMP_TO_EDGE",
    lodMinClamp: -1000.0, lodMaxClamp: 1000.0,
    compareMode: "NONE", compare: "LEQUAL",
};

// -- Load texture then render

const imageUrl = "../../assets/img/Di-3d.png";
let texture: IGLTexture;
loadImage(imageUrl, function (image)
{
    texture = {
        size: [image.width, image.height],
        sources: [{ image: image, level: 0 }],
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

    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            vertices: vertexArray.vertices,
            uniforms: {
                mvp: matrix,
                material: {
                    diffuse: [
                        { texture, sampler: samplerA },
                        { texture, sampler: samplerB },
                    ]
                },
            },
            drawVertex: { vertexCount: 6, instanceCount: 1 },
        }],
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // Cleanup
    webgl.deleteSampler(samplerA);
    webgl.deleteSampler(samplerB);
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}