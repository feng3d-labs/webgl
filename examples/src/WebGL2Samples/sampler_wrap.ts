import { IGLCanvasContext, IGLProgram, IGLRenderObject, IGLRenderPass, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
const webgl = new WebGL(rc);

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
    -2.0, 2.0,
    2.0, 2.0,
    2.0, -2.0,
    2.0, -2.0,
    -2.0, -2.0,
    -2.0, 2.0
]);

// -- Initilize vertex array

const vertexArray: { vertices?: IGLVertexAttributes } = {
    vertices: {
        position: { data: positions, numComponents: 2 },
        textureCoordinates: { data: texcoords, numComponents: 2 },
    }
};

// -- Initialize samplers

const samplers: IGLSampler[] = new Array(Corners.MAX);

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
let texture: IGLTexture;
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
    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
    };

    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const ro: IGLRenderObject = {
        pipeline: program,
        uniforms: { mvp: matrix },
        vertices: vertexArray.vertices,
    };

    for (let i = 0; i < Corners.MAX; ++i)
    {
        rp.renderObjects.push(
            { __type: "Viewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            {
                ...ro,
                uniforms: {
                    ...ro.uniforms,
                    diffuse: { texture, sampler: samplers[i] },
                },
                drawVertex: { vertexCount: 6, instanceCount: 1 },
            });
    }

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // -- Clean up

    for (let j = 0; j < samplers.length; ++j)
    {
        webgl.deleteSampler(samplers[j]);
    }
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}
