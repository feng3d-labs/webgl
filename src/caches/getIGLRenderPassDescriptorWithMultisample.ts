import { ITextureFormat } from "@feng3d/render-api";
import { IGLBlitFramebuffer } from "../data/IGLBlitFramebuffer";
import { GLRenderbufferInternalformat, IGLRenderbuffer } from "../data/IGLRenderbuffer";
import { IGLRenderPassColorAttachment } from "../data/IGLRenderPassColorAttachment";
import { IGLRenderPassDescriptor } from "../data/IGLRenderPassDescriptor";
import { IGLTextureView } from "../data/IGLTextureView";
import { getIGLTextureFormats } from "./getIGLTextureFormats";
import { getIGLTextureSize } from "./getIGLTextureSize";

/**
 * 
 * 当需要渲染到纹理并且开启多重采样时，就必须使用支持多重采样的渲染缓冲区来进行接受中间结果再拷贝到模板纹理上。
 * 
 * 当`passDescriptor.multisample`值存在时，引擎将会自动创建支持`multisample`的`IGLRenderbuffer`用于接收颜色附件的结果。在渲染通道执行结束后在由`IGLRenderbuffer`拷贝到对应纹理上。
 * 
 * @param sourcePassDescriptor 需要渲染到纹理并且开启多重采样的渲染通道描述。
 */
export function getIGLRenderPassDescriptorWithMultisample(sourcePassDescriptor: IGLRenderPassDescriptor): IGLRenderPassDescriptorWithMultisample
{
    if (sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample]) return sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample];

    const textureSize = getIGLTextureSize((sourcePassDescriptor.colorAttachments[0].view as IGLTextureView).texture);

    const renderbuffers: IGLRenderbuffer[] = [];

    const passDescriptor: IGLRenderPassDescriptor = {
        colorAttachments: sourcePassDescriptor.colorAttachments.map((v) =>
        {
            const renderbuffer: IGLRenderbuffer = {
                internalformat: getGLRenderbufferInternalformat((v.view as IGLTextureView).texture.format),
                width: textureSize[0],
                height: textureSize[1],
            };
            renderbuffers.push(renderbuffer);

            const colorAttachment: IGLRenderPassColorAttachment = {
                ...v,
                view: renderbuffer,
            };
            return colorAttachment;
        }),
        depthStencilAttachment: sourcePassDescriptor.depthStencilAttachment,
        sampleCount: sourcePassDescriptor.sampleCount,
    };

    // 拷贝 渲染缓冲区到 IGLTexture
    const blitFramebuffer: IGLBlitFramebuffer = {
        __type: "BlitFramebuffer",
        read: passDescriptor,
        draw: sourcePassDescriptor,
        blitFramebuffers: [[0, 0, textureSize[0], textureSize[1],
            0, 0, textureSize[0], textureSize[1],
            "COLOR_BUFFER_BIT", "NEAREST"]],
    };

    sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample] = { passDescriptor, blitFramebuffer, renderbuffers } as IGLRenderPassDescriptorWithMultisample;

    return sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample];
}

function getGLRenderbufferInternalformat(format?: ITextureFormat)
{
    const { internalformat } = getIGLTextureFormats(format);

    return internalformat as GLRenderbufferInternalformat;
}

export const _IGLRenderPassDescriptorWithMultisample = "_IGLRenderPassDescriptorWithMultisample";

/**
 * 由`passDescriptor.multisample`值存在的IGLRenderPassDescriptor生成。
 */
export interface IGLRenderPassDescriptorWithMultisample
{
    /**
     * 渲染到渲染缓冲区上。
     */
    passDescriptor: IGLRenderPassDescriptor;
    /**
     * 拷贝渲染缓冲区到目标纹理中。
     */
    blitFramebuffer: IGLBlitFramebuffer;
    /**
     * 需要销毁的临时渲染缓冲区。
     */
    renderbuffers: IGLRenderbuffer[];
}