import { CommandEncoder, RenderPass } from "@feng3d/render-api";
import { RunWebGL } from "../RunWebGL";
import { runRenderPass } from "./runRenderPass";

export function runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: CommandEncoder)
{
    commandEncoder.passEncoders.forEach((passEncoder) =>
    {
        if (!passEncoder.__type__ || passEncoder.__type__ === "RenderPass")
        {
            runRenderPass(gl, passEncoder as RenderPass);

            return;
        }
        if (passEncoder.__type__ === "TransformFeedbackPass")
        {
            RunWebGL.runTransformFeedbackPass(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === "BlitFramebuffer")
        {
            RunWebGL.runBlitFramebuffer(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === "CopyTextureToTexture")
        {
            RunWebGL.runCopyTextureToTexture(gl, passEncoder);

            return;
        }
        if (passEncoder.__type__ === "CopyBufferToBuffer")
        {
            RunWebGL.runCopyBuffer(gl, passEncoder);

            return;
        }

        console.error(`未处理 passEncoder ${passEncoder}`);
    });
}