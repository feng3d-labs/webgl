import { IRenderObject, IRenderPipeline, ISampler, ITexture } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

loadImage("../../assets/img/Di-3d.png", (img) =>
{
    const texture: ITexture = {
        size: [img.width, img.height],
        sources: [{ image: img, flipY: false }],
        format: "rgba8unorm",
    };
    const sampler: ISampler = {
        minFilter: "linear",
        magFilter: "linear",
    };

    const program: IRenderPipeline = {
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }],
        }
    };

    const renderObject: IRenderObject = {
        uniforms: {
            diffuse: { texture, sampler },
            u_imageSize: [canvas.width / 2, canvas.height / 2],
        },
        geometry: {
            primitive: { topology: "triangle-list" },
            draw: { __type: "DrawVertex", firstVertex: 0, vertexCount: 3 },
        },
        pipeline: program
    };

    webgl.submit({
        commandEncoders: [{
            passEncoders: [
                {
                    descriptor: {
                        colorAttachments: [{
                            clearValue: [0.0, 0.0, 0.0, 1.0],
                            loadOp: "clear",
                        }],
                    },
                    renderObjects: [renderObject]
                }
            ]
        }]
    });

    // Delete WebGL resources
    webgl.deleteTexture(texture);
    webgl.deleteProgram(program);
});

function loadImage(url: string, onload: (img: HTMLImageElement) => void)
{
    const img = new Image();
    img.src = url;
    img.onload = function ()
    {
        onload(img);
    };

    return img;
}
