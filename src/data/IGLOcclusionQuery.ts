import { RenderObject } from "@feng3d/render-api";
import { IGLOcclusionQueryStep } from "../caches/getGLRenderOcclusionQuery";

export interface IGLOcclusionQuery
{
    /**
     * 数据类型。
     */
    readonly __type__: "OcclusionQuery";

    /**
     * 渲染对象列表。
     */
    renderObjects: RenderObject[];

    /**
     * 临时变量, 执行过程中由引擎自动填充。
     *
     * @internal
     */
    _step?: IGLOcclusionQueryStep;

    /**
     * 渲染完成后由引擎自动填充。
     */
    result?: IGLQuery;
}

/**
 * 查询对象。
 *
 * 一次查询周期。
 *
 * 仅 WebGL2 支持。
 */
export interface IGLQuery
{
    /**
     * 查询结果。
     */
    result: number;
}