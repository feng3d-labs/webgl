import { IGLBlitFramebuffer, IGLBlitFramebufferItem, IGLRenderObject, IGLRenderPass, IGLRenderPassDescriptor, IGLRenderPipeline, IGLRenderbuffer, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexAttributes, IGLVertexBuffer, IGLViewport, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLRenderingContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const program: IGLRenderPipeline = {
    primitive: { topology: "TRIANGLES" },
    vertex: {
        code: getShaderSource("vs")
    },
    fragment: {
        code: getShaderSource("fs"),
        targets: [{ blend: {} }]
    },
};

const vertexPosBuffer: IGLVertexBuffer = {
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
const vertexTexBuffer: IGLVertexBuffer = {
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

const vertices: IGLVertexAttributes = {
    position: { buffer: vertexPosBuffer, numComponents: 2 },
    texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
};

loadImage("../../assets/img/Di-3d.png", (image) =>
{
    const FRAMEBUFFER_SIZE = {
        x: image.width,
        y: image.height
    };

    const textureDiffuse: IGLTexture = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        pixelStore: {
            unpackFlipY: true,
        },
        sources: [{ source: image }],
    };
    const samplerDiffuse: IGLSampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const textureColorBuffer: IGLTexture = {
        internalformat: "RGBA",
        format: "RGBA",
        type: "UNSIGNED_BYTE",
        sources: [{ width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0 }],
    };
    const samplerColorBuffer: IGLSampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const colorRenderbuffer: IGLRenderbuffer = {
        internalformat: "RGBA4",
        width: FRAMEBUFFER_SIZE.x,
        height: FRAMEBUFFER_SIZE.y,
    };

    const vertexArray: IGLVertexArrayObject = {
        vertices,
    };

    const viewport: IGLViewport = { __type: "IGLViewport", x: 0, y: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };
    const renderObject: IGLRenderObject = {
        pipeline: program,
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
    const fboRenderPass: IGLRenderPass = {
        descriptor: {
            colorAttachments: [{
                view: colorRenderbuffer,
                clearValue: [0.3, 0.3, 0.3, 1.0]
            }]
        },
        renderObjects: [viewport, renderObject],
    };

    const framebufferResolve: IGLRenderPassDescriptor = {
        colorAttachments: [{
            view: { texture: textureColorBuffer, level: 0 },
            clearValue: [0.7, 0.0, 0.0, 1.0]
        }]
    };

    //
    const renderPassResolve: IGLRenderPass = {
        descriptor: framebufferResolve,
    };

    const blitFramebuffers: IGLBlitFramebufferItem[] = [];
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

    const blitFramebuffer: IGLBlitFramebuffer = {
        __type: "IGLBlitFramebuffer",
        read: fboRenderPass.descriptor,
        draw: renderPassResolve.descriptor,
        blitFramebuffers,
    };

    const viewport2: IGLViewport = { __type: "IGLViewport", x: 0, y: 0, width: canvas.width, height: canvas.height };
    const renderObject2: IGLRenderObject = {
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

    const renderPass2: IGLRenderPass = {
        descriptor: {
            colorAttachments: [{
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: "clear",
            }],
        },
        renderObjects: [viewport2, renderObject2]
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
