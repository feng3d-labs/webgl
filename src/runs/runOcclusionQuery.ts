import { getGLOcclusionQueryStep } from "../caches/getGLOcclusionQueryStep";
import { IGLOcclusionQuery } from "../data/IGLOcclusionQuery";
import { runRenderObject } from "./runRenderObject";

export function runOcclusionQuery(gl: WebGLRenderingContext, occlusionQuery: IGLOcclusionQuery)
{
    const setp = getGLOcclusionQueryStep(gl, occlusionQuery);

    // 开始查询
    setp.begin();

    // 正常渲染对象列表
    occlusionQuery.renderObjects.forEach((renderObject) =>
    {
        runRenderObject(gl, renderObject);
    });

    // 结束查询
    setp.end();

    // 获取查询结果
    return setp.resolve();
}
