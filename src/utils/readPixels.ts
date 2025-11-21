import { ReadPixels, RenderPassDescriptor, Texture, TextureDescriptor } from '@feng3d/render-api';
import { deleteFramebuffer, getGLFramebuffer } from '../caches/getGLFramebuffer';
import { getGLTextureFormats } from '../caches/getGLTextureFormats';

export function readPixels(gl: WebGLRenderingContext, readPixels: ReadPixels)
{
    let bufferData: ArrayBufferView;

    if (gl instanceof WebGL2RenderingContext)
    {
        const { textureView, origin, copySize } = readPixels;
        const attachmentPoint: GLAttachmentPoint = 'COLOR_ATTACHMENT0';
        const [width, height] = copySize;
        //
        const descriptor = (textureView.texture as Texture).descriptor;
        const { format, type } = getGLTextureFormats(descriptor.format);
        const bytesPerPixel = Texture.getTextureBytesPerPixel(descriptor.format);
        const DataConstructor = Texture.getTextureDataConstructor(descriptor.format);
        //
        const bytesPerRow = width * bytesPerPixel;
        const bufferSize = bytesPerRow * height;
        bufferData = new DataConstructor(bufferSize / DataConstructor.BYTES_PER_ELEMENT);
        //
        const frameBuffer: RenderPassDescriptor = {
            colorAttachments: [
                { view: textureView },
            ],
        };
        //
        const webGLFramebuffer = getGLFramebuffer(gl, frameBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);

        //
        gl.readBuffer(gl[attachmentPoint]);
        gl.readPixels(origin[0], origin[1], width, height, gl[format], gl[type], bufferData, 0);

        // 释放
        deleteFramebuffer(gl, frameBuffer);
    }
    else
    {
        console.error(`WebGL1 不支持 readBuffer/readPixels ！`);
    }

    return bufferData;
}

/**
 * A GLenum specifying the attachment point for the texture. Possible values:
 *
 * gl.COLOR_ATTACHMENT0: Attaches the texture to the framebuffer's color buffer.
 * gl.DEPTH_ATTACHMENT: Attaches the texture to the framebuffer's depth buffer.
 * gl.STENCIL_ATTACHMENT: Attaches the texture to the framebuffer's stencil buffer.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * gl.DEPTH_STENCIL_ATTACHMENT: depth and stencil buffer.
 * gl.COLOR_ATTACHMENT1 gl.COLOR_ATTACHMENT2 gl.COLOR_ATTACHMENT3 gl.COLOR_ATTACHMENT4 gl.COLOR_ATTACHMENT5 gl.COLOR_ATTACHMENT6 gl.COLOR_ATTACHMENT7 gl.COLOR_ATTACHMENT8 gl.COLOR_ATTACHMENT9 gl.COLOR_ATTACHMENT10 gl.COLOR_ATTACHMENT11 gl.COLOR_ATTACHMENT12 gl.COLOR_ATTACHMENT13 gl.COLOR_ATTACHMENT14 gl.COLOR_ATTACHMENT15
 */
export type GLAttachmentPoint = 'COLOR_ATTACHMENT0' | 'DEPTH_ATTACHMENT' | 'STENCIL_ATTACHMENT'
    | 'DEPTH_STENCIL_ATTACHMENT'
    | 'COLOR_ATTACHMENT1' | 'COLOR_ATTACHMENT2' | 'COLOR_ATTACHMENT3' | 'COLOR_ATTACHMENT4' | 'COLOR_ATTACHMENT5'
    | 'COLOR_ATTACHMENT6' | 'COLOR_ATTACHMENT7' | 'COLOR_ATTACHMENT8' | 'COLOR_ATTACHMENT9' | 'COLOR_ATTACHMENT10'
    | 'COLOR_ATTACHMENT11' | 'COLOR_ATTACHMENT12' | 'COLOR_ATTACHMENT13' | 'COLOR_ATTACHMENT14' | 'COLOR_ATTACHMENT15'
    ;
