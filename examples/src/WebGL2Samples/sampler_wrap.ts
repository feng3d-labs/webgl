import { CanvasContext, RenderPassObject, RenderObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";
import { reactive } from "@feng3d/reactivity";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false } };
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

const program: RenderPipeline = {
    vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    primitive: { topology: "triangle-list" },
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

const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        position: { data: positions, format: "float32x2" },
        textureCoordinates: { data: texcoords, format: "float32x2" },
    }
};

// -- Initialize samplers

const samplers: Sampler[] = new Array(Corners.MAX);

for (let i = 0; i < Corners.MAX; ++i)
{
    samplers[i] = {
        minFilter: "linear",
        magFilter: "linear",
        mipmapFilter: "linear",
    };
}

reactive(samplers[Corners.TOP_LEFT]).addressModeU = "mirror-repeat";
reactive(samplers[Corners.TOP_RIGHT]).addressModeU = "clamp-to-edge";
reactive(samplers[Corners.BOTTOM_RIGHT]).addressModeU = "repeat";
reactive(samplers[Corners.BOTTOM_LEFT]).addressModeU = "clamp-to-edge";

reactive(samplers[Corners.TOP_LEFT]).addressModeV = "mirror-repeat";
reactive(samplers[Corners.TOP_RIGHT]).addressModeV = "mirror-repeat";
reactive(samplers[Corners.BOTTOM_RIGHT]).addressModeV = "repeat";
reactive(samplers[Corners.BOTTOM_LEFT]).addressModeV = "clamp-to-edge";

// -- Load texture then render

const imageUrl = "../../assets/img/Di-3d.png";
let texture: Texture;
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
    const renderObjects: RenderPassObject[] = [];
    // Clear color buffer
    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderPassObjects: renderObjects,
    };

    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const ro: RenderObject = {
        pipeline: program,
        bindingResources: { mvp: matrix },
        vertices: vertexArray.vertices,
        draw: { __type__: "DrawVertex", vertexCount: 6, instanceCount: 1 },
    };

    for (let i = 0; i < Corners.MAX; ++i)
    {
        renderObjects.push(
            {
                ...ro,
                viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                bindingResources: {
                    ...ro.bindingResources,
                    diffuse: { texture, sampler: samplers[i] },
                },
                draw: { __type__: "DrawVertex", vertexCount: 6, instanceCount: 1 },
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
