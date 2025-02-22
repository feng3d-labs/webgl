import { Material, Sampler, Texture, RenderObject } from "@feng3d/render-api";
import { GLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: GLCanvasContext = { canvasId: "glcanvas" };
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

    const program: Material = {
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }],
        }
    };

    const renderObject: RenderObject = {
        uniforms: {
            diffuse: { texture, sampler },
            u_imageSize: [canvas.width / 2, canvas.height / 2],
        },
        geometry: {
            primitive: { topology: "triangle-list" },
            draw: { __type__: "DrawVertex", firstVertex: 0, vertexCount: 3 },
        },
        material: program
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
