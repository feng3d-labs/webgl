import { RenderPassColorAttachment, RenderPassDescriptor, TextureFormat, TextureView } from "@feng3d/render-api";
import { BlitFramebuffer } from "../data/BlitFramebuffer";
import { RenderbufferInternalformat, Renderbuffer } from "../data/Renderbuffer";
import { getGLTextureFormats } from "./getGLTextureFormats";

/**
 *
 * 当需要渲染到纹理并且开启多重采样时，就必须使用支持多重采样的渲染缓冲区来进行接受中间结果再拷贝到模板纹理上。
 *
 * 当`passDescriptor.multisample`值存在时，引擎将会自动创建支持`multisample`的`IGLRenderbuffer`用于接收颜色附件的结果。在渲染通道执行结束后在由`IGLRenderbuffer`拷贝到对应纹理上。
 *
 * @param sourcePassDescriptor 需要渲染到纹理并且开启多重采样的渲染通道描述。
 */
export function getGLRenderPassDescriptorWithMultisample(sourcePassDescriptor: RenderPassDescriptor): GLRenderPassDescriptorWithMultisample
{
    if (sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample]) return sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample];

    const texture = (sourcePassDescriptor.colorAttachments[0].view as TextureView).texture;

    const textureSize = texture.descriptor.size;

    const renderbuffers: Renderbuffer[] = [];

    // 创建支持 多重采样的 渲染通道
    const passDescriptor: RenderPassDescriptor = {
        colorAttachments: sourcePassDescriptor.colorAttachments.map((v) =>
        {
            const texture = v.view.texture;

            const renderbuffer: Renderbuffer = {
                internalformat: getGLRenderbufferInternalformat(texture.descriptor.format),
                width: textureSize[0],
                height: textureSize[1],
            };
            renderbuffers.push(renderbuffer);

            const colorAttachment: RenderPassColorAttachment = {
                ...v,
                view: renderbuffer as any,
            };

            return colorAttachment;
        }),
        depthStencilAttachment: sourcePassDescriptor.depthStencilAttachment,
        sampleCount: sourcePassDescriptor.sampleCount,
    };

    // 拷贝 渲染缓冲区到 IGLTexture
    const blitFramebuffer: BlitFramebuffer = {
        __type__: "BlitFramebuffer",
        read: passDescriptor,
        draw: sourcePassDescriptor,
        blitFramebuffers: [[0, 0, textureSize[0], textureSize[1],
            0, 0, textureSize[0], textureSize[1],
            "COLOR_BUFFER_BIT", "NEAREST"]],
    };

    sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample] = { passDescriptor, blitFramebuffer, renderbuffers } as GLRenderPassDescriptorWithMultisample;

    return sourcePassDescriptor[_IGLRenderPassDescriptorWithMultisample];
}

function getGLRenderbufferInternalformat(format?: TextureFormat)
{
    const { internalformat } = getGLTextureFormats(format);

    return internalformat as RenderbufferInternalformat;
}

export const _IGLRenderPassDescriptorWithMultisample = "_IGLRenderPassDescriptorWithMultisample";

/**
 * 由`passDescriptor.multisample`值存在的IGLRenderPassDescriptor生成。
 */
export interface GLRenderPassDescriptorWithMultisample
{
    /**
     * 渲染到渲染缓冲区上。
     */
    passDescriptor: RenderPassDescriptor;
    /**
     * 拷贝渲染缓冲区到目标纹理中。
     */
    blitFramebuffer: BlitFramebuffer;
    /**
     * 需要销毁的临时渲染缓冲区。
     */
    renderbuffers: Renderbuffer[];
}