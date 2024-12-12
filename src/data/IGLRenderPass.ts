import { IRenderPass } from "@feng3d/render-api";
import { IGLOcclusionQuery } from "./IGLOcclusionQuery";
import { IGLRenderObject } from "./IGLRenderObject";
import { IGLScissorRect } from "./IGLScissorRect";
import { IGLViewport } from "./IGLViewport";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export interface IGLRenderPass extends IRenderPass
{
    /**
     * 渲染对象列表，默认为 []。
     */
    readonly renderObjects?: readonly IGLRenderPassObject[];

    /**
     * 渲染不被遮挡查询结果。具体数据保存在各子项的"result"属性中。
     *
     * 当提交WebGL后自动获取结果后填充该属性。
     */
    occlusionQueryResults?: IGLOcclusionQuery[];
}

export type IGLRenderPassObject = IGLRenderObject | IGLViewport | IGLScissorRect | IGLOcclusionQuery;