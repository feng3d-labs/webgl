import { IBuffer, IProgram, IRenderPass, IRenderPipeline, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
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
    // gl.uniformMatrix4fv(uniformMvpLocation, false, matrix);
    // gl.uniform1i(uniformDiffuse0Location, 0);
    // gl.uniform1i(uniformDiffuse1Location, 1);

    // gl.bindVertexArray(vertexArray);

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.bindSampler(0, samplerA);

    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.bindSampler(1, samplerB);

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            vertexArray,
            uniforms: {
                mvp: matrix,
                material: {
                    diffuse: [
                        texture1,
                        texture,
                    ]
                },
            },
            drawArrays: { vertexCount: 6, instanceCount: 1 },
        }],
    };
    WebGL.runRenderPass(rc, rp);

    // // Cleanup
    // gl.deleteBuffer(vertexPosBuffer);
    // gl.deleteBuffer(vertexTexBuffer);
    // gl.deleteSampler(samplerA);
    // gl.deleteSampler(samplerB);
    // gl.deleteVertexArray(vertexArray);
    // gl.deleteTexture(texture);
    // gl.deleteProgram(program);
}