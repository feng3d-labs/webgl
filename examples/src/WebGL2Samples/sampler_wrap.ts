import { IBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

const gl = canvas.getContext("webgl2", { antialias: false });

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
    w: windowSize.y / 2 - 60
};

viewport[Corners.TOP_LEFT] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2 - 60
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
    -2.0, 2.0,
    2.0, 2.0,
    2.0, -2.0,
    2.0, -2.0,
    -2.0, -2.0,
    -2.0, 2.0
]);
const vertexTexBuffer: IBuffer = { data: texcoords, usage: "STATIC_DRAW" };

// -- Initilize vertex array

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
    samplers[i] = { minFilter: "LINEAR_MIPMAP_LINEAR", magFilter: "LINEAR" };
}

samplers[Corners.TOP_LEFT].wrapS = "MIRRORED_REPEAT";
samplers[Corners.TOP_RIGHT].wrapS = "CLAMP_TO_EDGE";
samplers[Corners.BOTTOM_RIGHT].wrapS = "REPEAT";
samplers[Corners.BOTTOM_LEFT].wrapS = "CLAMP_TO_EDGE";

samplers[Corners.TOP_LEFT].wrapT = "MIRRORED_REPEAT";
samplers[Corners.TOP_RIGHT].wrapT = "MIRRORED_REPEAT";
samplers[Corners.BOTTOM_RIGHT].wrapT = "REPEAT";
samplers[Corners.BOTTOM_LEFT].wrapT = "CLAMP_TO_EDGE";

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
    // Clear color buffer
    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
    };

    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const ro: IRenderObject = {
        pipeline: program,
        uniforms: { mvp: matrix },
        vertexArray,
    };

    for (let i = 0; i < Corners.MAX; ++i)
    {
        rp.renderObjects.push({
            ...ro,
            viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            uniforms: {
                ...ro.uniforms,
                diffuse: { texture, sampler: samplers[i] },
            },
            drawArrays: { vertexCount: 6, instanceCount: 1 },
        });
    }
    WebGL.runRenderPass(rc, rp);

    // -- Clean up

    WebGL.deleteBuffer(rc, vertexPosBuffer);
    WebGL.deleteBuffer(rc, vertexTexBuffer);
    for (let j = 0; j < samplers.length; ++j)
    {
        WebGL.deleteSampler(rc, samplers[j]);
    }
    WebGL.deleteVertexArray(rc, vertexArray);
    WebGL.deleteTexture(rc, texture);
    WebGL.deleteProgram(rc, program);
}
