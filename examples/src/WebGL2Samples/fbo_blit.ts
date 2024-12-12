import { IGLBlitFramebuffer, IGLBlitFramebufferItem, IGLCanvasContext, IGLRenderObject, IGLRenderPass, IGLRenderPassDescriptor, IGLRenderPipeline, IGLSampler, IGLTexture, IGLTextureView, IGLVertexAttributes, IGLViewport, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
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

const vertexPosBuffer = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexTexBuffer = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);

const vertices: IGLVertexAttributes = {
    position: { data: vertexPosBuffer, numComponents: 2 },
    texcoord: { data: vertexTexBuffer, numComponents: 2 },
};

loadImage("../../assets/img/Di-3d.png", (image) =>
{
    const FRAMEBUFFER_SIZE = {
        x: image.width,
        y: image.height
    };

    const textureDiffuse: IGLTexture = {
        size: [image.width, image.height],
        format: "rgba8unorm",
        sources: [{
            image: image, flipY: true
        }],
    };
    const samplerDiffuse: IGLSampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    const textureColorBuffer: IGLTexture = {
        format: "rgba8unorm",
        size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y],
    };
    const samplerColorBuffer: IGLSampler = {
        minFilter: "LINEAR",
        magFilter: "LINEAR",
    };

    // 此处 Renderbuffer 直接使用 IGLTextureView 替代。
    const colorRenderbuffer: IGLTextureView = { texture: { format: "rgba8unorm", size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y] } };

    const vertexArray: { vertices?: IGLVertexAttributes } = {
        vertices,
    };

    const viewport: IGLViewport = { __type: "Viewport", x: 0, y: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };
    const renderObject: IGLRenderObject = {
        pipeline: program,
        vertices: vertexArray.vertices,
        uniforms: {
            MVP: new Float32Array([
                0.8, 0.0, 0.0, 0.0,
                0.0, 0.8, 0.0, 0.0,
                0.0, 0.0, 0.8, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureDiffuse, sampler: samplerDiffuse },
        },
        drawVertex: { firstVertex: 0, vertexCount: 6 }
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
            view: { texture: textureColorBuffer, baseMipLevel: 0 },
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
        __type: "BlitFramebuffer",
        read: fboRenderPass.descriptor,
        draw: renderPassResolve.descriptor,
        blitFramebuffers,
    };

    const viewport2: IGLViewport = { __type: "Viewport", x: 0, y: 0, width: canvas.width, height: canvas.height };
    const renderObject2: IGLRenderObject = {
        vertices: vertexArray.vertices,
        uniforms: {
            MVP: new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureColorBuffer, sampler: samplerColorBuffer },
        },
        drawVertex: { firstVertex: 0, vertexCount: 6 },
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
    webgl.submit({
        commandEncoders: [{
            passEncoders: [
                fboRenderPass,
                blitFramebuffer,
                renderPass2,
            ]
        }]
    });

    // Delete WebGL resources
    webgl.deleteFramebuffer(fboRenderPass.descriptor);
    webgl.deleteFramebuffer(framebufferResolve);
    webgl.deleteTexture(textureDiffuse);
    webgl.deleteTexture(textureColorBuffer);
    webgl.deleteProgram(program);
});
