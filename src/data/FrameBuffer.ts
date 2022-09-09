import { WebGLCache } from '../gl/WebGLCache';
import { WebGLRenderer } from '../WebGLRenderer';

export class FrameBuffer
{
    /**
     * 是否失效
     */
    private _invalid = true;

    static active(webGLRenderer: WebGLRenderer, frameBuffer: FrameBuffer)
    {
        const { gl, cache } = webGLRenderer;
        if (frameBuffer._invalid)
        {
            frameBuffer._invalid = false;
            this.clear(frameBuffer, gl, cache);
        }

        // Create a framebuffer object (FBO)
        let buffer = cache.frameBuffers.get(frameBuffer);
        if (!buffer)
        {
            buffer = gl.createFramebuffer();
            if (!buffer)
            {
                console.warn('Failed to create frame buffer object');

                return null;
            }
            cache.frameBuffers.set(frameBuffer, buffer);
        }

        return buffer;
    }

    /**
     * 清理缓存
     */
    static clear(frameBuffer: FrameBuffer, gl: WebGLRenderingContext, cache: WebGLCache)
    {
        const buffer = cache.frameBuffers.get(frameBuffer);
        if (buffer)
        {
            gl.deleteFramebuffer(buffer);
            cache.frameBuffers.delete(frameBuffer);
        }
    }
}
