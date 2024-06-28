import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

export function runShader(gl: WebGLRenderingContext, shader: IWebGLRenderPipeline)
{
    const shaderResult = getCompileShaderResult(gl, shader);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);
}
