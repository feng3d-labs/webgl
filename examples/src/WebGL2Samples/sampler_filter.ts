import { IGLCanvasContext, IGLProgram, IGLRenderObject, IGLRenderPass, IGLRenderPassObject, IGLSampler, IGLTexture, IGLVertexAttributes, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
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
    w: windowSize.y / 2
};

viewport[Corners.TOP_LEFT] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
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
    }
};

// -- Initialize samplers

const samplers: IGLSampler[] = new Array(Corners.MAX);
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
let texture: IGLTexture;
loadImage(imageUrl, function (image)
{
    texture = {
        size: [image.width, image.height],
        format: "rgba8unorm",
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

    const renderObjects: IGLRenderPassObject[] = [];
    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: renderObjects
    };

    const ro: IGLRenderObject = {
        pipeline: program,
        uniforms: { mvp: matrix },
        vertices: vertexArray.vertices,
        drawVertex: { vertexCount: 6, instanceCount: 1 },
    };

    // Bind samplers
    for (let i = 0; i < Corners.MAX; ++i)
    {
        renderObjects.push(
            { __type: "Viewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
            {
                ...ro,
                uniforms: {
                    ...ro.uniforms,
                    diffuse: {
                        texture, sampler: samplers[i]
                    }
                }
            });
    }

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // Clean up
    for (let j = 0; j < samplers.length; ++j)
    {
        webgl.deleteSampler(samplers[(j + 1) % samplers.length]);
    }
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}
