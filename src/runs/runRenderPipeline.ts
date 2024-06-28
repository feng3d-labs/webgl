import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IDepthStencilState } from "../data/IDepthStencilState";
import { IPrimitiveState } from "../data/IPrimitiveState";
import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

const defaultDepthStencilState: IDepthStencilState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS" };
const defaultPrimitiveState: IPrimitiveState = { topology: "TRIANGLES", cullMode: "BACK", frontFace: "CCW" };

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    // 设置渲染程序
    runProgram(gl, renderPipeline);

    runPrimitiveState(gl, renderPipeline.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}

function runProgram(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    const shaderResult = getCompileShaderResult(gl, renderPipeline.vertex.code, renderPipeline.fragment.code);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);
}

function runPrimitiveState(gl: WebGLRenderingContext, primitive?: IPrimitiveState)
{
    //
    const cullMode = primitive?.cullMode || defaultPrimitiveState.cullMode;
    const frontFace = primitive?.frontFace || defaultPrimitiveState.frontFace;
    if (cullMode === "NONE")
    {
        gl.disable(gl.CULL_FACE);
    }
    else
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[cullMode]);
        gl.frontFace(gl[frontFace]);
    }
}

function runDepthStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    //
    const { depthtest, depthCompare, depthWriteEnabled } = { ...defaultDepthStencilState, ...depthStencil };
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