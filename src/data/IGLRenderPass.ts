import { IGLOcclusionQuery } from "./IGLOcclusionQuery";
import { IGLRenderPassDescriptor } from "./IGLPassDescriptor";
import { IGLRenderObject } from "./IGLRenderObject";
import { IGLScissor } from "./IGLScissor";
import { IGLViewport } from "./IGLViewport";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export interface IGLRenderPass
{
    /**
     * 数据类型。
     */
    readonly __type?: "IGLRenderPass";

    /**
     * WebGL渲染通道描述
     */
    readonly descriptor?: IGLRenderPassDescriptor;

    /**
     * 渲染对象列表，默认为 []。
     */
    renderObjects?: IGLRenderPassObject[];

    /**
     * 渲染不被遮挡查询结果。具体数据保存在各子项的"result"属性中。
     *
     * 当提交WebGL后自动获取结果后填充该属性。
     */
    occlusionQueryResults?: IGLOcclusionQuery[];
}

export type IGLRenderPassObject = IGLRenderObject | IGLOcclusionQuery | IGLViewport | IGLScissor;