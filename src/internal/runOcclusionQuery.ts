import { OcclusionQuery } from '@feng3d/render-api';
import { runRenderObject } from './renderObject/runRenderObject';

export function runOcclusionQuery(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, occlusionQuery: OcclusionQuery, hasDepthAttachment = true)
{
    // 开始查询
    occlusionQuery._step.begin();

    // 正常渲染对象列表
    occlusionQuery.renderObjects.forEach((renderObject) =>
    {
        runRenderObject(gl, attachmentSize, renderObject, hasDepthAttachment);
    });

    // 结束查询
    occlusionQuery._step.end();
}

