import { CanvasTexture, ReadPixels, RenderPassDescriptor, Texture, TextureDescriptor, TextureFormat } from '@feng3d/render-api';
import { deleteFramebuffer, getGLFramebuffer } from '../caches/getGLFramebuffer';
import { getGLTextureFormats } from '../caches/getGLTextureFormats';

export function readPixels(gl: WebGLRenderingContext, readPixels: ReadPixels)
{
    let bufferData: ArrayBufferView;

    if (gl instanceof WebGL2RenderingContext)
    {
        const { textureView, origin, copySize } = readPixels;
        const [width, height] = copySize;
        const texture = textureView.texture;

        // 检查是否是 CanvasTexture
        if ('context' in texture)
        {
            // CanvasTexture: 从默认 framebuffer（画布）读取
            const canvasTexture = texture as CanvasTexture;
            const textureFormat: TextureFormat = 'rgba8unorm'; // 画布默认格式
            const { format, type } = getGLTextureFormats(textureFormat);
            const bytesPerPixel = Texture.getTextureBytesPerPixel(textureFormat);
            const DataConstructor = Texture.getTextureDataConstructor(textureFormat);

            const bytesPerRow = width * bytesPerPixel;
            const bufferSize = bytesPerRow * height;
            bufferData = new DataConstructor(bufferSize / DataConstructor.BYTES_PER_ELEMENT);

            // 绑定到默认 framebuffer（画布）
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.readBuffer(gl.BACK); // 默认 framebuffer 使用 BACK 缓冲区

            // 确保所有渲染命令都已完成
            gl.finish();

            // 读取像素（注意：WebGL 的坐标系是左下角为原点，需要翻转 y 坐标）
            // origin[1] 是从顶部计算的 y 坐标，需要转换为从底部计算的坐标
            // readPixels 的 y 参数是读取区域的左下角坐标
            // 如果 origin[1] 是从顶部计算的单个像素位置，那么：
            // glY = drawingBufferHeight - origin[1] - 1
            // 但为了支持读取多个像素，使用：
            // glY = drawingBufferHeight - origin[1] - height
            // 注意：当 height=1 时，这两种方式结果相同
            // 但是，如果 origin[1] 是单个像素的 y 坐标（从顶部），我们应该读取该像素本身
            // 所以对于单个像素，应该使用：glY = drawingBufferHeight - origin[1] - 1
            // 但是，readPixels 的 y 参数是读取区域的左下角坐标，所以对于单个像素：
            // 如果 origin[1] 是像素的 y 坐标（从顶部），那么该像素在 WebGL 坐标系中的 y 坐标是：
            // glY = drawingBufferHeight - origin[1] - 1
            const glY = gl.drawingBufferHeight - origin[1] - height;

            // 添加调试信息
            console.log(`readPixels CanvasTexture: origin=(${origin[0]}, ${origin[1]}), copySize=(${width}, ${height}), glY=${glY}, drawingBufferHeight=${gl.drawingBufferHeight}`);

            gl.readPixels(origin[0], glY, width, height, gl[format], gl[type], bufferData, 0);
        }
        else
        {
            // Texture: 从纹理 framebuffer 读取
            const attachmentPoint: GLAttachmentPoint = 'COLOR_ATTACHMENT0';
            const descriptor = (texture as Texture).descriptor;
            const { format, type } = getGLTextureFormats(descriptor.format);
            const bytesPerPixel = Texture.getTextureBytesPerPixel(descriptor.format);
            const DataConstructor = Texture.getTextureDataConstructor(descriptor.format);

            const bytesPerRow = width * bytesPerPixel;
            const bufferSize = bytesPerRow * height;
            bufferData = new DataConstructor(bufferSize / DataConstructor.BYTES_PER_ELEMENT);

            const frameBuffer: RenderPassDescriptor = {
                colorAttachments: [
                    { view: textureView },
                ],
            };

            const webGLFramebuffer = getGLFramebuffer(gl, frameBuffer);
            gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);

            gl.readBuffer(gl[attachmentPoint]);
            gl.readPixels(origin[0], origin[1], width, height, gl[format], gl[type], bufferData, 0);

            // 释放
            deleteFramebuffer(gl, frameBuffer);
        }
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
