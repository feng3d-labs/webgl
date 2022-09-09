import { Attribute } from '../data/Attribute';
import { FrameBuffer } from '../data/FrameBuffer';
import { BufferAttribute } from '../data/Index';
import { CompileShaderResult } from '../data/Shader';
import { Texture } from '../data/Texture';
import { RenderBuffer } from '../RenderBuffer';

declare global
{
    interface MixinsWebGLCache
    {

    }
}

export interface WebGLCache extends MixinsWebGLCache { }

/**
 * GL 缓存
 */
export class WebGLCache
{
    compileShaderResults: { [key: string]: CompileShaderResult } = {};

    private _gl: WebGLRenderingContext;

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    textures = new Map<Texture, WebGLTexture>();

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    attributes = new Map<Attribute, WebGLBuffer>();

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    indices = new Map<BufferAttribute, WebGLBuffer>();

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
