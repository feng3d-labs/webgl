import { IBlitFramebuffer, IBlitFramebufferItem, IFramebuffer, IRenderObject, IRenderbuffer, ITexture, IVertexAttributes, IWebGLRenderPass, IWebGLRenderPipeline, WebGL } from "../../../src";
import { IWebGLCanvasContext } from "../../../src/data/IWebGLCanvasContext";
import { getShaderSource } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const canvasContext: IWebGLCanvasContext = { canvasId: "glcanvas" };

    const pipeline: IWebGLRenderPipeline = {
        primitive: { topology: "TRIANGLES", cullMode: "NONE" },
        vertex: {
            code: getShaderSource("vs")
        },
        fragment: {
            code: getShaderSource("fs"),
            targets: [{ blend: {} }]
        },
    };

    const vertices: IVertexAttributes = {
        position: {
            buffer: {
                data: new Float32Array([
                    -1.0, -1.0,
                    1.0, -1.0,
                    1.0, 1.0,
                    1.0, 1.0,
                    -1.0, 1.0,
                    -1.0, -1.0
                ]),
                type: "FLOAT",
                usage: "STATIC_DRAW",
            }, numComponents: 2
        },
        texcoord: {
            buffer: {
                data: new Float32Array([
                    0.0, 1.0,
                    1.0, 1.0,
                    1.0, 0.0,
                    1.0, 0.0,
                    0.0, 0.0,
                    0.0, 1.0
                ]),
                type: "FLOAT",
                usage: "STATIC_DRAW",
            }, numComponents: 2
        },
    };

    loadImage("../../assets/img/Di-3d.png", (image) =>
    {
        const FRAMEBUFFER_SIZE = {
            x: image.width,
            y: image.height
        };

        const textureDiffuse: ITexture = {
            flipY: true,
            internalformat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            sources: [{ source: image }],
            sampler: {
                minFilter: "LINEAR",
                magFilter: "LINEAR",
            }
        };

        const textureColorBuffer: ITexture = {
            internalformat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            sources: [{ width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0 }],
            sampler: {
                minFilter: "LINEAR",
                magFilter: "LINEAR",
            }
        };

        const colorRenderbuffer: IRenderbuffer = {
            internalformat: "RGBA4",
            width: FRAMEBUFFER_SIZE.x,
            height: FRAMEBUFFER_SIZE.y,
        };

        const framebufferRender: IFramebuffer = {
            colorAttachments: [colorRenderbuffer],
        };

        const framebufferResolve: IFramebuffer = {
            colorAttachments: [textureColorBuffer],
        };

        // Render FBO
        const fboRenderPass: IWebGLRenderPass = {
            passDescriptor: {
                colorAttachments: [{
                    view: colorRenderbuffer,
                    clearValue: [0.3, 0.3, 0.3, 1.0]
                }]
            },
            renderObjects: [
                {
                    pipeline,
                    viewport: { x: 0, y: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y },
                    vertices,
                    uniforms: {
                        MVP: new Float32Array([
                            0.8, 0.0, 0.0, 0.0,
                            0.0, 0.8, 0.0, 0.0,
                            0.0, 0.0, 0.8, 0.0,
                            0.0, 0.0, 0.0, 1.0
                        ]),
                        diffuse: textureDiffuse,
                    },
                    drawVertex: { firstVertex: 0, vertexCount: 6 }
                }
            ],
        };

        // 清理纹理背景颜色。
        const renderPassResolve: IWebGLRenderPass = {
            passDescriptor: {
                colorAttachments: [{
                    view: textureColorBuffer,
                    clearValue: [0.7, 0.0, 0.0, 1.0]
                }]
            },
        };

        const blitFramebuffers: IBlitFramebufferItem[] = [];
        const TILE = 4;
        const BORDER = 2;
        for (let j = 0; j < TILE; j++)
        {
            for (let i = 0; i < TILE; i++)
            {
                if ((i + j) % 2)
                {
                    continue;
                }

                blitFramebuffers.push(
                    [0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
                        FRAMEBUFFER_SIZE.x / TILE * (i + 0) + BORDER,
                        FRAMEBUFFER_SIZE.x / TILE * (j + 0) + BORDER,
                        FRAMEBUFFER_SIZE.y / TILE * (i + 1) - BORDER,
                        FRAMEBUFFER_SIZE.y / TILE * (j + 1) - BORDER,
                        "COLOR_BUFFER_BIT", "LINEAR"]
                );
            }
        }

        const blitFramebuffer: IBlitFramebuffer = {
            read: fboRenderPass.passDescriptor,
            draw: renderPassResolve.passDescriptor,
            blitFramebuffers,
        };

        const renderPass2: IWebGLRenderPass = {
            passDescriptor: {
                colorAttachments: [{
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: "clear",
                }],
            },
            renderObjects: [{
                viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
                vertices,
                uniforms: {
                    MVP: new Float32Array([
                        1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0
                    ]),
                    diffuse: textureColorBuffer,
                },
                drawVertex: { firstVertex: 0, vertexCount: 6 },
                pipeline,
            }]
        };
        function draw()
        {
            WebGL.renderPass(canvasContext, fboRenderPass);

            requestAnimationFrame(draw);
        }
        draw();
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
})();
