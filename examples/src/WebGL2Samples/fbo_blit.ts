import { IRenderObject, IRenderPass, IRenderPassDescriptor, IRenderPipeline, ISampler, ITexture, ITextureView, IVertexAttributes } from "@feng3d/render-api";
import { IGLBlitFramebuffer, IGLBlitFramebufferItem, IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const renderingContext: IGLCanvasContext = { canvasId: "glcanvas" };
const webgl = new WebGL(renderingContext);

const program: IRenderPipeline = {
    primitive: { topology: "triangle-list" },
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

const vertices: IVertexAttributes = {
    position: { data: vertexPosBuffer, format: "float32x2" },
    texcoord: { data: vertexTexBuffer, format: "float32x2" },
};

loadImage("../../assets/img/Di-3d.png", (image) =>
{
    const FRAMEBUFFER_SIZE = {
        x: image.width,
        y: image.height
    };

    const textureDiffuse: ITexture = {
        size: [image.width, image.height],
        format: "rgba8unorm",
        sources: [{
            image, flipY: true
        }],
    };
    const samplerDiffuse: ISampler = {
        minFilter: "linear",
        magFilter: "linear",
    };

    const textureColorBuffer: ITexture = {
        format: "rgba8unorm",
        size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y],
    };
    const samplerColorBuffer: ISampler = {
        minFilter: "linear",
        magFilter: "linear",
    };

    // 此处 Renderbuffer 直接使用 IGLTextureView 替代。
    const colorRenderbuffer: ITextureView = { texture: { format: "rgba8unorm", size: [FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y] } };

    const vertexArray: { vertices?: IVertexAttributes } = {
        vertices,
    };

    const renderObject: IRenderObject = {
        viewport: { x: 0, y: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y },
        pipeline: program,
        uniforms: {
            MVP: new Float32Array([
                0.8, 0.0, 0.0, 0.0,
                0.0, 0.8, 0.0, 0.0,
                0.0, 0.0, 0.8, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureDiffuse, sampler: samplerDiffuse },
        },
        geometry: {
            vertices: vertexArray.vertices,
            draw: { __type: "DrawVertex", firstVertex: 0, vertexCount: 6 }
        }
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

    const framebufferResolve: IRenderPassDescriptor = {
        colorAttachments: [{
            view: { texture: textureColorBuffer, baseMipLevel: 0 },
            clearValue: [0.7, 0.0, 0.0, 1.0]
        }]
    };

    //
    const renderPassResolve: IRenderPass = {
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

    const renderObject2: IRenderObject = {
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        uniforms: {
            MVP: new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]),
            diffuse: { texture: textureColorBuffer, sampler: samplerColorBuffer },
        },
        geometry: {
            vertices: vertexArray.vertices,
            draw: { __type: "DrawVertex", firstVertex: 0, vertexCount: 6 },
        },
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
