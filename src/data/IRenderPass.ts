import { IRenderPass } from "@feng3d/renderer-common";
import { IPassDescriptor } from "./IPassDescriptor";
import { IQueryAction } from "./IQueryAction";
import { IRenderObject } from "./IRenderObject";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export interface IGLRenderPass extends IRenderPass
{
    /**
     * WebGL渲染通道描述
     */
    descriptor?: IPassDescriptor;

    /**
     * 渲染对象列表，默认为 []。
     */
    renderObjects?: (IRenderObject | IQueryAction)[];
}
