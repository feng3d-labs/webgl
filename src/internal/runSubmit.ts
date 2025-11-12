import { Submit } from '@feng3d/render-api';
import { _GL_Submit_Times } from '../const/const';
import { runCommandEncoder } from './runCommandEncoder';

export function runSubmit(gl: WebGLRenderingContext, submit: Submit)
{
    const commandBuffers = submit.commandEncoders.map((v) =>
    {
        const commandBuffer = runCommandEncoder(gl, v);

        return commandBuffer;
    });

    // 派发提交WebGPU事件
    gl[_GL_Submit_Times] = ~~gl[_GL_Submit_Times] + 1;
}