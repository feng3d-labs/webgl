import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { Shader } from "../data/Shader";

export function runShader(gl: WebGLRenderingContext, shader: Shader)
{
    const shaderResult = getCompileShaderResult(gl, shader);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);

    return shaderResult;
}
