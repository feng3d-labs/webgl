import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IBlendComponent } from "../data/IBlendComponent";
import { IDepthStencilState } from "../data/IDepthStencilState";
import { IPrimitiveState } from "../data/IPrimitiveState";
import { IFragmentState, IVertexState, IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

const defaultDepthStencilState: IDepthStencilState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS" };
const defaultPrimitiveState: IPrimitiveState = { topology: "TRIANGLES", cullMode: "BACK", frontFace: "CCW" };

const defaultBlendComponent: IBlendComponent = {
    operation: "FUNC_ADD",
    srcFactor: "SRC_ALPHA",
    dstFactor: "ONE_MINUS_SRC_ALPHA",
};

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    runProgram(gl, renderPipeline.vertex, renderPipeline.fragment);

    runPrimitiveState(gl, renderPipeline.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}

function runProgram(gl: WebGLRenderingContext, vertex: IVertexState, fragment: IFragmentState)
{
    const shaderResult = getCompileShaderResult(gl, vertex.code, fragment.code);
    if (!shaderResult)
    {
        throw new Error(`缺少着色器，无法渲染!`);
    }
    //
    gl.useProgram(shaderResult.program);

    //
    const colorMask = fragment.targets?.[0]?.writeMask || [true, true, true, true];
    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    //
    let blend = fragment.targets?.[0]?.blend;
    if (blend)
    {
        blend = {
            color: { ...defaultBlendComponent, ...blend?.color },
            alpha: { ...defaultBlendComponent, ...blend?.color, ...blend?.alpha },
        };
        //
        gl.enable(gl.BLEND);
        gl.blendEquationSeparate(gl[blend.color.operation], gl[blend.alpha.operation]);
        gl.blendFuncSeparate(gl[blend.color.srcFactor], gl[blend.color.dstFactor], gl[blend.alpha.srcFactor], gl[blend.alpha.dstFactor]);
    }
    else
    {
        gl.disable(gl.BLEND);
    }
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