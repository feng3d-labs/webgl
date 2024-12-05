import { IGLOcclusionQueryStep } from "../caches/getGLRenderOcclusionQuery";
import { IGLRenderObject } from "./IGLRenderObject";

export interface IGLOcclusionQuery
{
    /**
     * 数据类型。
     */
    readonly __type: "OcclusionQuery";
    /**
     * 渲染对象列表。
     */
    renderObjects: IGLRenderObject[];

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