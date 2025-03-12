import { ReadPixels, RenderPassDescriptor, Texture } from "@feng3d/render-api";
import { deleteFramebuffer, getGLFramebuffer } from "../caches/getGLFramebuffer";
import { getIGLTextureFormats } from "../caches/getIGLTextureFormats";
import { GLAttachmentPoint } from "../gl/WebGLEnums";

export function readPixels(gl: WebGLRenderingContext, readPixels: ReadPixels)
{
    let bufferData:ArrayBufferView;

    if (gl instanceof WebGL2RenderingContext)
    {
        const { textureView, origin, copySize } = readPixels;
        const attachmentPoint: GLAttachmentPoint = "COLOR_ATTACHMENT0";
        const [width, height] = copySize;
        //
        const { format, type } = getIGLTextureFormats(textureView.texture.format);
        const bytesPerPixel = Texture.getTextureBytesPerPixel(textureView.texture.format);
        const dataConstructor = Texture.getTextureDataConstructor(textureView.texture.format);
        //
        const bytesPerRow = width * bytesPerPixel;
        const bufferSize = bytesPerRow * height;
        bufferData = new dataConstructor(bufferSize / dataConstructor.BYTES_PER_ELEMENT);
        //
        const frameBuffer: RenderPassDescriptor = {
            colorAttachments: [
                { view: textureView },
            ]
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
