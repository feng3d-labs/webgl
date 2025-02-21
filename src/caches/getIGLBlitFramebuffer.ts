import { CopyTextureToTexture, ImageCopyTexture, RenderPassColorAttachment, RenderPassDepthStencilAttachment, TextureView } from "@feng3d/render-api";
import { GLBlitFramebuffer, IGLBlitFramebufferItem } from "../data/GLBlitFramebuffer";

/**
 * 通过 IGLBlitFramebuffer 实现纹理之间拷贝并不靠谱。
 *
 * @param copyTextureToTexture GL纹理之间拷贝。
 * @returns
 */
export function getIGLBlitFramebuffer(copyTextureToTexture: CopyTextureToTexture)
{
    const { source, destination, copySize } = copyTextureToTexture;

    const sourceAspect = source.aspect || "all";
    const destinationAspect = destination.aspect || "all";

    console.assert(sourceAspect === destinationAspect, `拷贝纹理时两个纹理的 aspect 必须相同！`);

    const sourceColorAttachments: RenderPassColorAttachment[] = [];
    let sourceDepthStencilAttachment: RenderPassDepthStencilAttachment;
    const destinationColorAttachments: RenderPassColorAttachment[] = [];
    let destinationDepthStencilAttachment: RenderPassDepthStencilAttachment;

    //
    let mask: "COLOR_BUFFER_BIT" | "DEPTH_BUFFER_BIT" | "STENCIL_BUFFER_BIT";
    if (sourceAspect === "all")
    {
        mask = "COLOR_BUFFER_BIT";
        sourceColorAttachments.push({ view: getIGLTextureView(source) });
        destinationColorAttachments.push({ view: getIGLTextureView(destination) });
    }
    else if (sourceAspect === "depth-only")
    {
        mask = "DEPTH_BUFFER_BIT";
        sourceDepthStencilAttachment = { view: getIGLTextureView(source) };
        destinationDepthStencilAttachment = { view: getIGLTextureView(destination) };
    }
    else if (sourceAspect === "stencil-only")
    {
        mask = "STENCIL_BUFFER_BIT";
        sourceDepthStencilAttachment = { view: getIGLTextureView(source) };
        destinationDepthStencilAttachment = { view: getIGLTextureView(destination) };
    }

    const sourceOrigin = source.origin || [0, 0];
    const destinationOrigin = destination.origin || [0, 0];
    //
    const blitFramebufferItem: IGLBlitFramebufferItem = [
        sourceOrigin[0], sourceOrigin[1], sourceOrigin[0] + copySize[0], sourceOrigin[1] + copySize[1],
        destinationOrigin[0], destinationOrigin[1], destinationOrigin[0] + copySize[0], destinationOrigin[1] + copySize[1],
        mask, "NEAREST",
    ];

    const blitFramebuffer: GLBlitFramebuffer = {
        __type: "BlitFramebuffer",
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

function getIGLTextureView(source: ImageCopyTexture)
{
    if (!source.texture) return undefined;

    const textureView: TextureView = {
        texture: source.texture,
        baseMipLevel: source.mipLevel,
        baseArrayLayer: source.origin?.[2],
    };

    return textureView;
}