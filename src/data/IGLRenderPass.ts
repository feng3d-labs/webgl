import { IGLRenderPassDescriptor } from "./IGLPassDescriptor";
import { IGLQueryAction } from "./IGLQueryAction";
import { IGLRenderObject } from "./IGLRenderObject";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export interface IGLRenderPass
{
    /**
     * WebGL渲染通道描述
     */
    descriptor?: IGLRenderPassDescriptor;

    /**
     * 渲染对象列表，默认为 []。
     */
    renderObjects?: (IGLRenderObject | IGLQueryAction)[];
}
