import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IFragmentState, IVertexState } from "../data/IWebGLRenderPipeline";
import { runColorTargetStates } from "./runColorTargetStates";

export function runProgram(gl: WebGLRenderingContext, vertex: IVertexState, fragment: IFragmentState)
{
    const shaderResult = getCompileShaderResult(gl, vertex.code, fragment.code);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);

    runColorTargetStates(gl, fragment.targets);
}
