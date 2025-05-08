import { CanvasContext, RenderObject, RenderPipeline, Sampler, Texture } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: CanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

loadImage("../../assets/img/Di-3d.png", (img) =>
{
    const texture: Texture = {
        size: [img.width, img.height],
        sources: [{ image: img, flipY: false }],
        format: "rgba8unorm",
    };
    const sampler: Sampler = {
        minFilter: "linear",
        magFilter: "linear",
    };

    const program: RenderPipeline = {
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }],
        },
        primitive: { topology: "triangle-list" },
    };

    const renderObject: RenderObject = {
        bindingResources: {
            diffuse: { texture, sampler },
            u_imageSize: [canvas.width / 2, canvas.height / 2],
        },
        draw: { __type__: "DrawVertex", firstVertex: 0, vertexCount: 3 },
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
                    renderPassObjects: [renderObject]
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
