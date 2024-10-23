import { IBlitFramebuffer, IBlitFramebufferItem, IPassDescriptor, IRenderObject, IRenderPass, IRenderPipeline, IRenderbuffer, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexAttributes, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IRenderingContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const program: IRenderPipeline = {
    primitive: { topology: "TRIANGLES" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }]
    },
};

const vertexPosBuffer: IVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]),
    usage: "STATIC_DRAW",
};
const vertexTexBuffer: IVertexBuffer = {
    target: "ARRAY_BUFFER",
    data: new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]),
    usage: "STATIC_DRAW",
};

const vertices: IVertexAttributes = {
    position: { buffer: vertexPosBuffer, numComponents: 2 },
    texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
};

loadImage("../../assets/img/Di-3d.png", (image) =>
{
    const FRAMEBUFFER_SIZE = {
        x: image.width,
        y: image.height
    };

    const textureDiffuse: ITexture = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        pixelStore: {
            unpackFlipY: true,
        },
        sources: [{ source: image }],
    };
    const samplerDiffuse: ISampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const textureColorBuffer: ITexture = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0 }],
    };
    const samplerColorBuffer: ISampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const colorRenderbuffer: IRenderbuffer = {
        internalformat: "RGBA4",
        width: FRAMEBUFFER_SIZE.x,
        height: FRAMEBUFFER_SIZE.y,
    };

    const vertexArray: IVertexArrayObject = {
        vertices,
    };

    const renderObject: IRenderObject = {
        pipeline: program,
        viewport: { x: 0, y: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y },
        vertexArray,
        uniforms: {
            MVP: new Float32Array([
                0.8, 0.0, 0.0, 0.0,
                0.0, 0.8, 0.0, 0.0,
                0.0, 0.0, 0.8, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureDiffuse, sampler: samplerDiffuse },
        },
        drawArrays: { firstVertex: 0, vertexCount: 6 }
    };

    // Render FBO
    const fboRenderPass: IRenderPass = {
        descriptor: {
            colorAttachments: [{
                view: colorRenderbuffer,
                clearValue: [0.3, 0.3, 0.3, 1.0]
            }]
        },
        renderObjects: [renderObject],
    };

    const framebufferResolve: IPassDescriptor = {
        colorAttachments: [{
            view: { texture: textureColorBuffer, level: 0 },
            clearValue: [0.7, 0.0, 0.0, 1.0]
        }]
    };

    //
    const renderPassResolve: IRenderPass = {
        descriptor: framebufferResolve,
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
        read: fboRenderPass.descriptor,
        draw: renderPassResolve.descriptor,
        blitFramebuffers,
    };

    const renderObject2: IRenderObject = {
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        vertexArray,
        uniforms: {
            MVP: new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureColorBuffer, sampler: samplerColorBuffer },
        },
        drawArrays: { firstVertex: 0, vertexCount: 6 },
        pipeline: program,
    };

    const renderPass2: IRenderPass = {
        descriptor: {
            colorAttachments: [{
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: "clear",
            }],
        },
        renderObjects: [renderObject2]
    };

    // 执行
    webgl.runRenderPass(fboRenderPass);
    webgl.runBlitFramebuffer(blitFramebuffer);
    webgl.runRenderPass(renderPass2);

    // Delete WebGL resources
    webgl.deleteFramebuffer(fboRenderPass.descriptor);
    webgl.deleteFramebuffer(framebufferResolve);
    webgl.deleteRenderbuffer(colorRenderbuffer);
    webgl.deleteBuffer(vertexPosBuffer);
    webgl.deleteBuffer(vertexTexBuffer);
    webgl.deleteTexture(textureDiffuse);
    webgl.deleteTexture(textureColorBuffer);
    webgl.deleteProgram(program);
    webgl.deleteVertexArray(vertexArray);
});
