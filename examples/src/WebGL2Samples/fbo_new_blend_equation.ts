import { IVertexBuffer, IBuffer, IRenderObject, IRenderPass, IRenderPipeline, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "@feng3d/webgl-renderer";
import { IViewport } from "../../../src/data/IViewport";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

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
const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

const texcoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

// -- Initilize vertex array
const vertexArray: IVertexArrayObject = {
    vertices: {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    }
};

// -- Load texture then render
const sampler: ISampler = {
    minFilter: "LINEAR",
    magFilter: "LINEAR"
};
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
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const renderObject: IRenderObject = {
        pipeline: program,
        vertexArray,
        uniforms: { mvp: matrix, diffuse: { texture, sampler } },
        drawArrays: { vertexCount: 6 },
    };

    const renderPass: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.5, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
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
            renderPass.renderObjects.push({
                ...renderObject,
                viewport: viewport0,
            });
        }
        else if (i === Corners.BOTTOM_RIGHT)
        {
            renderPass.renderObjects.push({
                ...renderObject,
                viewport: viewport0,
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
            renderPass.renderObjects.push({
                ...renderObject,
                viewport: viewport0,
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

    WebGL.runRenderPass(renderingContext, renderPass);

    // -- Clean up
    WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
    WebGL.deleteBuffer(renderingContext, vertexTexBuffer);
    WebGL.deleteVertexArray(renderingContext, vertexArray);
    WebGL.deleteTexture(renderingContext, texture);
    WebGL.deleteProgram(renderingContext, program);
}