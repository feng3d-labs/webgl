import { RenderPipeline } from '@feng3d/render-api';
import { getGLProgram } from '../caches/getGLProgram';
import { runColorTargetStates } from './runColorTargetStates';

export function runProgram(gl: WebGLRenderingContext, material: RenderPipeline)
{
    const program = getGLProgram(gl, material);
    gl.useProgram(program);

    //
    runColorTargetStates(gl, material.fragment.targets);
}

