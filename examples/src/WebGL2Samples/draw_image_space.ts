import { IRenderObject, IRenderPipeline, ISampler, ITexture, WebGL } from "@feng3d/webgl-renderer";
import { IRenderingContext } from "../../../src/data/IRenderingContext";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

loadImage("../../assets/img/Di-3d.png", (img) =>
{
    const texture: ITexture = {
        sources: [{ source: img }],
        pixelStore: {
            unpackFlipY: false,
        },
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
    };
    const sampler: ISampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const program: IRenderPipeline = {
        primitive: { topology: "TRIANGLES" },
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
        // drawVertex: { firstVertex: 0, vertexCount: 3 },
        pipeline: program
    };

    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;

    const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

    WebGL.runRenderPass(renderingContext, {
        passDescriptor: {
            colorAttachments: [{
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: "clear",
            }],
        },
        renderObjects: [renderObject]
    });

    // Delete WebGL resources
    WebGL.deleteTexture(renderingContext, texture);
    WebGL.deleteProgram(renderingContext, program);
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
