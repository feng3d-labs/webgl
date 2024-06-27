import { IWebGLRenderPass } from "./IWebGLRenderPass";

/**
 * 渲染数据。
 */
export interface IWebGLSubmit
{
    /**
     * WebGL渲染通道列表
     */
    renderPasss: IWebGLRenderPass[];
}