import { FrameBuffer } from '../data/FrameBuffer';
import { RenderBuffer } from '../RenderBuffer';

declare global
{
    interface MixinsWebGLCache
    {

    }
}

export interface WebGLCache extends MixinsWebGLCache { }

/**
 * WebGL 缓存
 */
export class WebGLCache
{
    private _gl: WebGLRenderingContext;

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    renderBuffers = new Map<RenderBuffer, WebGLBuffer>();

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    frameBuffers = new Map<FrameBuffer, WebGLFramebuffer>();

    constructor(gl: WebGLRenderingContext)
    {
        this._gl = gl;
    }
}
