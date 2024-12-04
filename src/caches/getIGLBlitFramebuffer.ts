import { IGLBlitFramebuffer, IGLBlitFramebufferItem } from "../data/IGLBlitFramebuffer";
import { IGLCopyTextureToTexture, IGLImageCopyTexture } from "../data/IGLCopyTextureToTexture";
import { IGLRenderPassColorAttachment } from "../data/IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment } from "../data/IGLRenderPassDepthStencilAttachment";
import { IGLTextureView } from "../data/IGLTexture";

export function getIGLBlitFramebuffer(copyTextureToTexture: IGLCopyTextureToTexture)
{
    const { source, destination, copySize } = copyTextureToTexture;

    console.assert(source.aspect === destination.aspect, `拷贝纹理时两个纹理的 aspect 必须相同！`)

    const sourceColorAttachments: IGLRenderPassColorAttachment[] = [];
    let sourceDepthStencilAttachment: IGLRenderPassDepthStencilAttachment;
    const destinationColorAttachments: IGLRenderPassColorAttachment[] = [];
    let destinationDepthStencilAttachment: IGLRenderPassDepthStencilAttachment;

    //
    let mask: "COLOR_BUFFER_BIT" | "DEPTH_BUFFER_BIT" | "STENCIL_BUFFER_BIT";
    if (source.aspect === "all")
    {
        mask = "COLOR_BUFFER_BIT";
        sourceColorAttachments.push({ view: getIGLTextureView(source) });
        destinationColorAttachments.push({ view: getIGLTextureView(destination) });
    }
    else if (source.aspect === "depth-only")
    {
        mask = "DEPTH_BUFFER_BIT";
        sourceDepthStencilAttachment = { view: getIGLTextureView(source) };
        destinationDepthStencilAttachment = { view: getIGLTextureView(destination) };
    }
    else if (source.aspect === "stencil-only")
    {
        mask = "STENCIL_BUFFER_BIT";
        sourceDepthStencilAttachment = { view: getIGLTextureView(source) };
        destinationDepthStencilAttachment = { view: getIGLTextureView(destination) };
    }

    //
    const blitFramebufferItem: IGLBlitFramebufferItem = [
        source.origin[0], source.origin[1], source.origin[0] + copySize[0], source.origin[1] + copySize[1],
        destination.origin[0], destination.origin[1], destination.origin[0] + copySize[0], destination.origin[1] + copySize[1],
        mask, "NEAREST",
    ];

    const blitFramebuffer: IGLBlitFramebuffer = {
        __type: "IGLBlitFramebuffer",
        read: {
            colorAttachments: sourceColorAttachments,
            depthStencilAttachment: sourceDepthStencilAttachment,
        },
        draw: {
            colorAttachments: destinationColorAttachments,
            depthStencilAttachment: destinationDepthStencilAttachment,
        },
        blitFramebuffers: [blitFramebufferItem]
    };

    return blitFramebuffer;
}

function getIGLTextureView(source: IGLImageCopyTexture)
{
    const textureView: IGLTextureView = {
        texture: source.texture,
        baseMipLevel: source.mipLevel,
        baseArrayLayer: source.origin[2],
    };
    return textureView;
}