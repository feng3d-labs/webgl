import { IRenderObject, IRenderPass, IRenderPassObject, IRenderPipeline, ISampler, ITexture, IVertexAttributes, IViewport } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
const webgl = new WebGL(renderingContext);

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

const viewport = new Array(Corners.MAX);

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

const program: IRenderPipeline = {
    vertex: { code: getShaderSource("vs") },
    fragment: { code: getShaderSource("fs"), targets: [{ blend: {} }] },
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

// -- Initilize vertex array
const vertexArray: { vertices?: IVertexAttributes } = {
    vertices: {
        position: { data: positions, format: "float32x2" },
        textureCoordinates: { data: texcoords, format: "float32x2" },
    }
};

// -- Load texture then render
const sampler: ISampler = {
    minFilter: "linear",
    magFilter: "linear"
};
const imageUrl = "../../assets/img/Di-3d.png";
let texture: ITexture;
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
    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const renderObject: IRenderObject = {
        pipeline: program,
        uniforms: { mvp: matrix, diffuse: { texture, sampler } },
        geometry:{
            vertices: vertexArray.vertices,
            draw: { __type: "DrawVertex", vertexCount: 6 },
        }
    };

    const renderObjects: IRenderPassObject[] = [];
    const renderPass: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.5, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects,
    };

    for (let i = 0; i < Corners.MAX; ++i)
    {
        const viewport0: IViewport = { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w };

        if (i === Corners.TOP_LEFT)
        {
            //pass
        }
        else if (i === Corners.TOP_RIGHT)
        {
            renderObjects.push(
                {
                    ...renderObject,
                    viewport: viewport0,
                });
        }
        else if (i === Corners.BOTTOM_RIGHT)
        {
            renderObjects.push(
                {
                    ...renderObject,
                    viewport: viewport0,
                    pipeline: {
                        ...program, fragment: {
                            ...program.fragment,
                            targets: [{
                                ...program.fragment.targets[0],
                                blend: {
                                    ...program.fragment.targets[0].blend,
                                    color: { ...program.fragment.targets[0].blend.color, operation: "min" },
                                    alpha: { ...program.fragment.targets[0].blend.alpha, operation: "min" },
                                },
                            }]
                        }
                    },
                });
        }
        else if (i === Corners.BOTTOM_LEFT)
        {
            renderObjects.push(
                {
                    ...renderObject,
                    viewport: viewport0,
                    pipeline: {
                        ...program, fragment: {
                            ...program.fragment,
                            targets: [{
                                ...program.fragment.targets[0],
                                blend: {
                                    ...program.fragment.targets[0].blend,
                                    color: { ...program.fragment.targets[0].blend.color, operation: "max" },
                                    alpha: { ...program.fragment.targets[0].blend.alpha, operation: "max" },
                                },
                            }]
                        }
                    },
                });
        }
    }

    webgl.submit({ commandEncoders: [{ passEncoders: [renderPass] }] });

    // -- Clean up
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}