import { RenderPass, IRenderPassObject } from "@feng3d/render-api";
import { IGLOcclusionQuery } from "./IGLOcclusionQuery";

declare module "@feng3d/render-api"
{
    /**
     * WebGL渲染通道
     *
     * 包含渲染通道描述以及需要渲染的对象列表。
     */
    export interface RenderPass
    {
        /**
         * 渲染不被遮挡查询结果。具体数据保存在各子项的"result"属性中。
         *
         * 当提交WebGL后自动获取结果后填充该属性。
         */
        occlusionQueryResults?: IGLOcclusionQuery[];
    }

    export interface IRenderPassObjectMap
    {
        IGLOcclusionQuery: IGLOcclusionQuery
    }
}
