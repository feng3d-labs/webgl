import { CommandEncoder, RenderPass } from '@feng3d/render-api';
import { runRenderPass } from './runRenderPass';
import { runTransformFeedbackPass } from './runTransformFeedbackPass';
import { runBlitFramebuffer } from './runBlitFramebuffer';
import { runCopyTextureToTexture } from './runCopyTextureToTexture';
import { runCopyBufferToBuffer } from './runCopyBufferToBuffer';

export function runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: CommandEncoder)
{
    commandEncoder.passEncoders.forEach((passEncoder) =>
    {
        if (!passEncoder.__type__ || passEncoder.__type__ === 'RenderPass')
        {
            runRenderPass(gl, passEncoder as RenderPass);

            return;
        }
        if (passEncoder.__type__ === 'TransformFeedbackPass')
        {
            runTransformFeedbackPass(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === 'BlitFramebuffer')
        {
            runBlitFramebuffer(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === 'CopyTextureToTexture')
        {
            runCopyTextureToTexture(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === 'CopyBufferToBuffer')
        {
            runCopyBufferToBuffer(gl, passEncoder);

            return;
        }

        console.error(`未处理 passEncoder ${passEncoder}`);
    });
}