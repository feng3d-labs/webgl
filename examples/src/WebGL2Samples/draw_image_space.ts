import { IGLCanvasContext, IGLRenderObject, IGLRenderPipeline, IGLSampler, IGLTexture, WebGL } from "@feng3d/webgl";
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
    const texture: IGLTexture = {
        // size: [img.width, img.height],
        sources: [
            // { width: img.width / 2, height: img.height/2 ,level:1}, 
            { source: img }],
        // writeTextures: [{ source: img }],
        pixelStore: {
            unpackFlipY: false,
        },
        format: "rgba8unorm",
    };
    const sampler: IGLSampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const program: IGLRenderPipeline = {
        primitive: { topology: "TRIANGLES" },
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }],
        }
    };

    const renderObject: IGLRenderObject = {
        uniforms: {
            diffuse: { texture, sampler },
            u_imageSize: [canvas.width / 2, canvas.height / 2],
        },
        drawVertex: { firstVertex: 0, vertexCount: 3 },
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
