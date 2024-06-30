import { FrameBuffer } from "../FrameBuffer";
import { getWebGLTexture } from "../caches/getWebGLTexture";

declare global
{
    /**
     * WebGLFramebuffer 接口时 WebGL API 的一部分，它提供了一个缓冲区的集合，这些缓冲区可以作为一个整体用作渲染操作的目标缓冲区。
     *
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLFramebuffer
     */
    interface WebGLFramebuffer
    {
        /**
         * 附加到帧缓冲的0号颜色缓冲上的纹理。
         *
         * Attaches the texture to the framebuffer's color buffer.
         */
        texture: WebGLTexture;

        /**
         * 附加到帧缓冲上的深度缓冲。
         *
         * Attaches the texture to the framebuffer's depth buffer.
         */
        depthBuffer: WebGLRenderbuffer;
    }
}

declare global
{
    interface WebGLRenderingContextExt
    {
        _framebuffers: WebGLFramebuffers;
    }
}

/**
 * WebGLFramebuffer管理器。
 *
 * 负责
 */
export class WebGLFramebuffers
{
    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    private _cache = new Map<FrameBuffer, WebGLFramebuffer>();

    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._framebuffers = this;
    }

    active(frameBuffer: FrameBuffer)
    {
        const gl = this.gl;
        const { _renderbuffers } = this.gl;

        const target: FramebufferTarget = "FRAMEBUFFER";

        if (!frameBuffer)
        {
            gl.bindFramebuffer(gl[target], null);

            return;
        }

        const webGLFramebuffer = this.get(frameBuffer);

        // 绑定帧缓冲区对象
        gl.bindFramebuffer(gl[target], webGLFramebuffer);

        let needCheck = false;

        // 设置颜色关联对象
        const texture = getWebGLTexture(gl, frameBuffer.texture);
        if (webGLFramebuffer.texture !== texture)
        {
            gl.framebufferTexture2D(gl[target], gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            webGLFramebuffer.texture = texture;

            needCheck = true;
        }

        // 设置深度关联对象
        const depthBuffer = _renderbuffers.get(frameBuffer.depthBuffer);
        if (webGLFramebuffer.depthBuffer !== depthBuffer)
        {
            gl.framebufferRenderbuffer(gl[target], gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
            webGLFramebuffer.depthBuffer = depthBuffer;

            needCheck = true;
        }

        if (needCheck)
        {
            // 检查Framebuffer状态
            const e = gl.checkFramebufferStatus(gl[target]);
            if (gl.FRAMEBUFFER_COMPLETE !== e)
            {
                console.warn(`Frame buffer object is incomplete: ${e.toString()}`);

                return null;
            }
        }

        return webGLFramebuffer;
    }

    private get(frameBuffer: FrameBuffer)
    {
        const { gl } = this;
        const { _cache: frameBuffers } = this;

        // Create a framebuffer object (FBO)
        let buffer = frameBuffers.get(frameBuffer);
        if (!buffer)
        {
            buffer = gl.createFramebuffer();
            if (!buffer)
            {
                console.warn("Failed to create frame buffer object");

                return null;
            }
            frameBuffers.set(frameBuffer, buffer);
        }

        return buffer;
    }

    /**
     * 清理缓存
     */
    private clear(frameBuffer: FrameBuffer)
    {
        const { gl } = this;
        const { _cache: frameBuffers } = this;

        const buffer = frameBuffers.get(frameBuffer);
        if (buffer)
        {
            gl.deleteFramebuffer(buffer);
            frameBuffers.delete(frameBuffer);
        }
    }
}

/**
 * A GLenum specifying the binding point (target). Possible values:
 *
 * gl.FRAMEBUFFER   Collection buffer data storage of color, alpha, depth and stencil buffers used as both a destination for drawing and as a source for reading (see below).
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * gl.DRAW_FRAMEBUFFER  Used as a destination for drawing operations such as gl.draw*, gl.clear* and gl.blitFramebuffer.
 * gl.READ_FRAMEBUFFER  Used as a source for reading operations such as gl.readPixels and gl.blitFramebuffer.
 */
export type FramebufferTarget = "FRAMEBUFFER" | "DRAW_FRAMEBUFFER" | "READ_FRAMEBUFFER";