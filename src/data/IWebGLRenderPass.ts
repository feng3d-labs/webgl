import { IWebGLPassDescriptor } from "./IWebGLPassDescriptor";
import { RenderAtomic } from "./RenderAtomic";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export class IWebGLRenderPass
{
    /**
     * WebGL渲染通道描述
     */
    passDescriptor: IWebGLPassDescriptor;

    /**
     * 渲染对象列表，默认为 []。
     */
    renderObjects?: RenderAtomic[];
}