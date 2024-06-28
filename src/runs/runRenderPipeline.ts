import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    const shaderResult = getCompileShaderResult(gl, renderPipeline);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);

    const depthStencil = renderPipeline.depthStencil;
    if (depthStencil)
    {
        gl.enable(gl.DEPTH_TEST);
        //
        const depthCompare = depthStencil.depthCompare || "LESS";
        gl.depthFunc(gl[depthCompare]);
        const depthWriteEnabled = depthStencil.depthWriteEnabled || true;
        gl.depthMask(depthWriteEnabled);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
}
