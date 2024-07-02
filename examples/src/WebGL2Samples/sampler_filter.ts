import { IBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

// -- Divide viewport

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

const Corners = {
    TOP_LEFT: 0,
    TOP_RIGHT: 1,
    BOTTOM_RIGHT: 2,
    BOTTOM_LEFT: 3,
    MAX: 4
};

const viewport: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

viewport[Corners.BOTTOM_LEFT] = {
    x: 0,
    y: 0,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Corners.BOTTOM_RIGHT] = {
    x: windowSize.x / 2,
    y: 0,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Corners.TOP_RIGHT] = {
    x: windowSize.x / 2,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Corners.TOP_LEFT] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

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
    }
};

// -- Initialize samplers

const samplers: ISampler[] = new Array(Corners.MAX);
for (let i = 0; i < Corners.MAX; ++i)
{
    samplers[i] = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", wrapR: "CLAMP_TO_EDGE" };
}

// Min filter
samplers[Corners.TOP_LEFT].minFilter = "NEAREST";
samplers[Corners.TOP_RIGHT].minFilter = "LINEAR";
samplers[Corners.BOTTOM_RIGHT].minFilter = "LINEAR_MIPMAP_NEAREST";
samplers[Corners.BOTTOM_LEFT].minFilter = "LINEAR_MIPMAP_LINEAR";

// Mag filter
samplers[Corners.TOP_LEFT].magFilter = "NEAREST";
samplers[Corners.TOP_RIGHT].magFilter = "LINEAR";
samplers[Corners.BOTTOM_RIGHT].magFilter = "LINEAR";
samplers[Corners.BOTTOM_LEFT].magFilter = "LINEAR";

// -- Load texture then render

const imageUrl = "../../assets/img/Di-3d.png";
let texture: ITexture;
loadImage(imageUrl, function (image)
{
    texture = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ source: image, level: 0 }],
        generateMipmap: true,
    };

    render();
});

function render()
{
    // Clear color buffer
    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: []
    };

    const ro: IRenderObject = {
        pipeline: program,
        uniforms: { mvp: matrix },
        vertexArray,
        drawArrays: { vertexCount: 6, instanceCount: 1 },
    };

    // Bind samplers
    for (let i = 0; i < Corners.MAX; ++i)
    {
        rp.renderObjects.push({
            ...ro,
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            uniforms: {
                ...ro.uniforms,
                diffuse: {
                    texture, sampler: samplers[i]
                }
            }
        });
    }

    WebGL.runRenderPass(rc, rp);

    // Clean up
    WebGL.deleteBuffer(rc, vertexPosBuffer);
    WebGL.deleteBuffer(rc, vertexTexBuffer);
    for (let j = 0; j < samplers.length; ++j)
    {
        WebGL.deleteSampler(rc, samplers[(j + 1) % samplers.length]);
    }
    WebGL.deleteVertexArray(rc, vertexArray);
    WebGL.deleteTexture(rc, texture);
    WebGL.deleteProgram(rc, program);
}
