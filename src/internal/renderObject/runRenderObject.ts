import { RenderObject } from '@feng3d/render-api';
import { getGLDrawMode } from '../../caches/getGLDrawMode';
import { runDrawIndexed } from './runDrawIndexed';
import { runDrawVertex } from './runDrawVertex';
import { runPrimitiveState } from './runPrimitiveState';
import { runRenderPipeline } from './runRenderPipeline';
import { runScissor } from './runScissor';
import { runUniforms } from './runUniforms';
import { runVertexArray } from './runVertexArray';
import { runViewPort } from './runViewPort';

export function runRenderObject(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObject: RenderObject, hasDepthAttachment = true)
{
    const { viewport, scissorRect, pipeline, vertices, indices, draw, bindingResources: uniforms } = renderObject;
    const primitive = pipeline?.primitive;

    runViewPort(gl, attachmentSize, viewport);

    runScissor(gl, attachmentSize, scissorRect);

    runRenderPipeline(gl, pipeline, hasDepthAttachment);

    runUniforms(gl, pipeline, uniforms);

    runVertexArray(gl, pipeline, vertices, indices);

    runPrimitiveState(gl, primitive);

    const topology = primitive?.topology || 'triangle-list';
    const drawMode = getGLDrawMode(topology);

    if (draw.__type__ === 'DrawVertex')
    {
        runDrawVertex(gl, drawMode, draw);
    }
    else
    {
        runDrawIndexed(gl, drawMode, indices, draw);
    }
}

