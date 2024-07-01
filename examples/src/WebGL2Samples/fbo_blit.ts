import { IFramebuffer, IRenderObject, IRenderbuffer, ITexture, IWebGLPassDescriptor, WebGL } from "../../../src";
import { getShaderSource } from "./utility";

(function ()
{
    const div = document.createElement("div");
    div.innerHTML = `    <div id="info">WebGL 2 Samples - fbo_blit</div>
    <p id="description">
        This samples demonstrates blitting on frame buffer objects.
    </p>`;
    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.body.innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }
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

        const renderPass1: IWebGLPassDescriptor = {
            colorAttachments: [{
                view: colorRenderbuffer,
                clearValue: [0.3, 0.3, 0.3, 1.0]
            }]
        };
        // gl.viewport(0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y);

        const renderAtomic: IRenderObject = {
            vertices: {
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
            },
            uniforms: {
                MVP: [
                    0.8, 0.0, 0.0, 0.0,
                    0.0, 0.8, 0.0, 0.0,
                    0.0, 0.0, 0.8, 0.0,
                    0.0, 0.0, 0.0, 1.0
                ],
                diffuse: textureDiffuse,
            },
            drawVertex: { instanceCount: 2 },
            pipeline: {
                primitive: { topology: "TRIANGLE_STRIP", cullMode: "NONE" },
                vertex: {
                    code: getShaderSource("vs")
                },
                fragment: {
                    code: getShaderSource("fs"),
                    targets: [{ blend: {} }]
                },
            }
        };

        function draw()
        {
            WebGL.renderPass(
                { canvasId: "glcanvas" },
                {
                    passDescriptor: {
                        colorAttachments: [{
                            clearValue: [0.0, 0.0, 0.0, 1.0],
                            loadOp: "clear",
                        }],
                    },
                    renderObjects: [renderAtomic]
                }
            );

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

    // -- Init Frame Buffer
    const framebufferRender = gl.createFramebuffer();
    const framebufferResolve = gl.createFramebuffer();

    // Render FBO
    const SCALE = new Float32Array([
        0.8, 0.0, 0.0, 0.0,
        0.0, 0.8, 0.0, 0.0,
        0.0, 0.0, 0.8, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    gl.uniformMatrix4fv(mvpLocation, false, SCALE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureDiffuse);
    gl.bindVertexArray(vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Blit framebuffers
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebufferRender);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebufferResolve);
    gl.clearBufferfv(gl.COLOR, 0, [0.7, 0.0, 0.0, 1.0]);

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

            gl.blitFramebuffer(
                0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
                FRAMEBUFFER_SIZE.x / TILE * (i + 0) + BORDER,
                FRAMEBUFFER_SIZE.x / TILE * (j + 0) + BORDER,
                FRAMEBUFFER_SIZE.y / TILE * (i + 1) - BORDER,
                FRAMEBUFFER_SIZE.y / TILE * (j + 1) - BORDER,
                gl.COLOR_BUFFER_BIT, gl.LINEAR
            );
        }
    }

    // Pass 2
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);

    // Render FB
    const IDENTITY = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    gl.uniformMatrix4fv(mvpLocation, false, IDENTITY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureColorBuffer);
    gl.bindVertexArray(vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Delete WebGL resources
    gl.deleteFramebuffer(framebufferRender);
    gl.deleteFramebuffer(framebufferResolve);
    gl.deleteRenderbuffer(colorRenderbuffer);
    gl.deleteBuffer(vertexPosBuffer);
    gl.deleteBuffer(vertexTexBuffer);
    gl.deleteTexture(textureDiffuse);
    gl.deleteTexture(textureColorBuffer);
    gl.deleteProgram(program);
    gl.deleteVertexArray(vertexArray);
})();
