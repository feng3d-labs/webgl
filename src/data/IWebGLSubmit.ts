import { IWebGLCanvasContext } from "./IWebGLCanvasContext";
import { IWebGLRenderPass } from "./IWebGLRenderPass";

/**
 * 渲染数据。
 */
export interface IWebGLSubmit
{
    /**
     * WebGL上下文信息。
     */
    canvasContext: IWebGLCanvasContext;

    /**
     * WebGL渲染通道列表
     */
    renderPasss: IWebGLRenderPass[];
}