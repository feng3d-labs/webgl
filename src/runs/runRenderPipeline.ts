import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IDepthStencilState } from "../data/IDepthStencilState";
import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

const defaultDepthStencilState: IDepthStencilState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS" };

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    const shaderResult = getCompileShaderResult(gl, renderPipeline);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);

    const { depthtest, depthCompare, depthWriteEnabled } = { ...defaultDepthStencilState, ...renderPipeline.depthStencil };
    if (depthtest)
    {
        gl.enable(gl.DEPTH_TEST);
        //
        gl.depthFunc(gl[depthCompare]);
        gl.depthMask(depthWriteEnabled);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
}
