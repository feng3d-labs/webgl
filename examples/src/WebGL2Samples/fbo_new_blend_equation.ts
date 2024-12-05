import { IGLCanvasContext, IGLRenderObject, IGLRenderPass, IGLRenderPipeline, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexBuffer, IGLViewport, WebGL } from "@feng3d/webgl";

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

const program: IGLRenderPipeline = {
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
const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

// -- Initilize vertex array
const vertexArray: { vertices?: IGLVertexAttributes } = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

// -- Load texture then render
const sampler: IGLSampler = {
    minFilter: "LINEAR",
    magFilter: "LINEAR"
};
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
    const matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const renderObject: IGLRenderObject = {
        pipeline: program,
        vertices: vertexArray.vertices,
        uniforms: { mvp: matrix, diffuse: { texture, sampler } },
        drawVertex: { vertexCount: 6 },
    };

    const renderPass: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.5, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
    };

    for (let i = 0; i < Corners.MAX; ++i)
    {
        const viewport0: IGLViewport = { __type: "Viewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w };

        if (i === Corners.TOP_LEFT)
        {
            //pass
        }
        else if (i === Corners.TOP_RIGHT)
        {
            renderPass.renderObjects.push(
                viewport0,
                {
                    ...renderObject,
                });
        }
        else if (i === Corners.BOTTOM_RIGHT)
        {
            renderPass.renderObjects.push(
                viewport0,
                {
                    ...renderObject,
                    pipeline: {
                        ...program, fragment: {
                            ...program.fragment,
                            targets: [{
                                ...program.fragment.targets[0],
                                blend: {
                                    ...program.fragment.targets[0].blend,
                                    color: { ...program.fragment.targets[0].blend.color, operation: "MIN" },
                                    alpha: { ...program.fragment.targets[0].blend.alpha, operation: "MIN" },
                                },
                            }]
                        }
                    },
                });
        }
        else if (i === Corners.BOTTOM_LEFT)
        {
            renderPass.renderObjects.push(
                viewport0,
                {
                    ...renderObject,
                    pipeline: {
                        ...program, fragment: {
                            ...program.fragment,
                            targets: [{
                                ...program.fragment.targets[0],
                                blend: {
                                    ...program.fragment.targets[0].blend,
                                    color: { ...program.fragment.targets[0].blend.color, operation: "MAX" },
                                    alpha: { ...program.fragment.targets[0].blend.alpha, operation: "MAX" },
                                },
                            }]
                        }
                    },
                });
        }
    }

    webgl.submit({ commandEncoders: [{ passEncoders: [renderPass] }] });


    // -- Clean up
    webgl.deleteBuffer(vertexPosBuffer);
    webgl.deleteBuffer(vertexTexBuffer);
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
}