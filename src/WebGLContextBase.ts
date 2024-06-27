import { VertexAttributeTypes } from './data/AttributeBuffer';
import { StencilFunc, StencilOp } from './data/RenderParams';
import { PixelStoreiParameter, PrecisionType, ProgramParameter, RenderbufferInternalformat, Renderbuffertarget, ShaderParameter, ShaderType, TexParameterf, TexParameteri, TextureTarget } from './gl/WebGLEnums';
import { WebGLRenderer } from './WebGLRenderer';

/**
 * 对应 lib.dom.d.ts 中 WebGLRenderingContextBase 接口。
 */
export class WebGLContextBase
{
    protected _webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this._webGLRenderer = webGLRenderer;
    }
}
