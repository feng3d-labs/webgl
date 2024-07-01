import { IRenderObject, IRenderPipeline, ITexture, WebGL } from "../../../src";
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
        flipY: false,
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sampler: {
            minFilter: "LINEAR",
            magFilter: "LINEAR",
        }
    };

    const program: IRenderPipeline = {
        primitive: { topology: "TRIANGLES", cullMode: "NONE" },
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }],
        }
    };

    const renderAtomic: IRenderObject = {
        vertices: {},
        uniforms: {
            diffuse: texture,
            u_imageSize: [canvas.width / 2, canvas.height / 2],
        },
        pipeline: program
    };

    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;

    //
    renderAtomic.uniforms["u_imageSize"] = [canvas.width / 2, canvas.height / 2];

    const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

    WebGL.runRenderPass(renderingContext, {
        passDescriptor: {
            colorAttachments: [{
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: "clear",
            }],
        },
        renderObjects: [renderAtomic]
    });

    // Delete WebGL resources
    WebGL.deleteTexture(renderingContext, texture);
    WebGL.deleteProgram(renderingContext, program);
    WebGL.deleteVertexArray(renderingContext, renderAtomic);
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
