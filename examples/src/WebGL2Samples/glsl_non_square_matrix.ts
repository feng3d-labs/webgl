import { IGLProgram, IGLRenderPass, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Init program
const program: IGLProgram = {
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
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

// -- Init VertexArray
const vertexArray: IGLVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

loadImage("../../assets/img/Di-3d.png", function (image)
{
    // -- Init Texture
    const texture: IGLTexture = {
        target: "TEXTURE_2D",
        pixelStore: {
            unpackFlipY: false,
        },
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ source: image, level: 0 }]
    };
    const sampler: IGLSampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

    // -- Render
    const matrix = new Float32Array([
        0.5, 0.0, 0.0,
        0.0, 0.5, 0.0,
        0.0, 0.0, 0.5,
        0.2, -0.2, 0.0 //translation
    ]);

    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [{
            pipeline: program,
            uniforms: { MVP: matrix, diffuse: { texture, sampler } },
            vertexArray,
            drawArrays: { vertexCount: 6 },
        }]
    };
    webgl.runRenderPass(rp);

    // Delete WebGL resources
    webgl.deleteBuffer(vertexPosBuffer);
    webgl.deleteBuffer(vertexTexBuffer);
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
    webgl.deleteVertexArray(vertexArray);
});
