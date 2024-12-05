import { IGLOcclusionQuery } from "../data/IGLOcclusionQuery";
import { runRenderObject } from "./runRenderObject";

export function runOcclusionQuery(gl: WebGLRenderingContext, occlusionQuery: IGLOcclusionQuery)
{
    // 开始查询
    occlusionQuery._step.begin();

    // 正常渲染对象列表
    occlusionQuery.renderObjects.forEach((renderObject) =>
    {
        runRenderObject(gl, renderObject);
    });

    // 结束查询
    occlusionQuery._step.end();
}
