import { RenderBuffer } from "../RenderBuffer";

declare global
{
    interface WebGLRenderbuffer
    {
        version: number;
    }
}

declare global
{
    interface WebGLRenderingContextExt
    {
        _renderbuffers: WebGLRenderbuffers;
    }
}

export class WebGLRenderbuffers
{
    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    private renderBuffers = new WeakMap<RenderBuffer, WebGLRenderbuffer>();

    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._renderbuffers = this;
    }

    /**
     * 激活
     */
    get(renderBuffer: RenderBuffer)
    {
        const { gl } = this;
        const { renderBuffers } = this;

        let webGLRenderbuffer = renderBuffers.get(renderBuffer);
        if (webGLRenderbuffer)
        {
            if (webGLRenderbuffer.version !== renderBuffer.version)
            {
                this.clear(renderBuffer);
                webGLRenderbuffer = null;
            }
        }

        if (!webGLRenderbuffer)
        {
            // Create a renderbuffer object and Set its size and parameters
            webGLRenderbuffer = gl.createRenderbuffer(); // Create a renderbuffer object
            if (!webGLRenderbuffer)
            {
                console.warn("Failed to create renderbuffer object");

                return;
            }
            gl.bindRenderbuffer(gl.RENDERBUFFER, webGLRenderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl[renderBuffer.internalformat], renderBuffer.width, renderBuffer.height);

            webGLRenderbuffer.version = renderBuffer.version;

            renderBuffers.set(renderBuffer, webGLRenderbuffer);
        }

        return webGLRenderbuffer;
    }

    /**
     * 清理纹理
     */
    private clear(renderBuffer: RenderBuffer)
    {
        const { gl } = this;
        const { renderBuffers } = this;

        const buffer = renderBuffers.get(renderBuffer);
        if (buffer)
        {
            gl.deleteRenderbuffer(buffer);
            renderBuffers.delete(renderBuffer);
        }
    }
}
