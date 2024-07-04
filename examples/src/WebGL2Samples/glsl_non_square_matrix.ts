import { IBuffer, IProgram, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

// -- Init program
const program: IProgram = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    primitive: { topology: "TRIANGLES" },
};

// -- Init buffers: vec2 Position, vec2 Texcoord
const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer: IBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

// -- Init VertexArray
const vertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

loadImage("../../assets/img/Di-3d.png", function (image)
{
    // -- Init Texture
    const texture: ITexture = {
        textureTarget: "TEXTURE_2D",
        flipY: false,
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ source: image, level: 0 }]
    };
    const sampler: ISampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

    // -- Render
    const matrix = new Float32Array([
        0.5, 0.0, 0.0,
        0.0, 0.5, 0.0,
        0.0, 0.0, 0.5,
        0.2, -0.2, 0.0 //translation
    ]);

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            uniforms: { MVP: matrix, diffuse: { texture, sampler } },
            vertexArray,
            drawArrays: { vertexCount: 6 },
        }]
    };
    WebGL.runRenderPass(rc, rp);

    // Delete WebGL resources
    WebGL.deleteBuffer(rc, vertexPosBuffer);
    WebGL.deleteBuffer(rc, vertexTexBuffer);
    WebGL.deleteTexture(rc, texture);
    WebGL.deleteProgram(rc, program);
    WebGL.deleteVertexArray(rc, vertexArray);
});
