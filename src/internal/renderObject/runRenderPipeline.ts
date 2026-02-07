import { RenderPipeline } from '@feng3d/render-api';
import { runDepthState } from '../runDepthState';
import { runProgram } from '../runProgram';
import { runStencilState } from '../runStencilState';

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: RenderPipeline, hasDepthAttachment = true)
{
    runProgram(gl, renderPipeline);

    runDepthState(gl, renderPipeline.depthStencil, hasDepthAttachment);
    runStencilState(gl, renderPipeline.depthStencil);
}

