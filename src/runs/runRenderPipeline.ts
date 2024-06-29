import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { IBlendComponent } from "../data/IBlendState";
import { IDepthBias, IDepthState, IDepthStencilState, IStencilFaceState, IStencilState } from "../data/IDepthStencilState";
import { IPrimitiveState } from "../data/IPrimitiveState";
import { IFragmentState, IVertexState, IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";

const defaultDepthBias: IDepthBias = { units: 0, factor: 0 };
const defaultDepthState: IDepthState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS", depthBias: defaultDepthBias };
const defaultStencilFaceState: IStencilFaceState = { stencilFunc: "ALWAYS", stencilFuncRef: 0, stencilFuncMask: 0b11111111, stencilOpFail: "KEEP", stencilOpZFail: "KEEP", stencilOpZPass: "KEEP", stencilMask: 0b11111111 };
const defaultStencilState: IStencilState = { useStencil: false, stencilFront: defaultStencilFaceState, stencilBack: defaultStencilFaceState };
const defaultDepthStencilState: IDepthStencilState = { depth: defaultDepthState, stencil: defaultStencilState };
const defaultPrimitiveState: IPrimitiveState = { topology: "TRIANGLES", cullMode: "BACK", frontFace: "CCW" };
const defaultBlendComponent: IBlendComponent = { operation: "FUNC_ADD", srcFactor: "SRC_ALPHA", dstFactor: "ONE_MINUS_SRC_ALPHA" };

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
    runDepthState(gl, depthStencil?.depth || defaultDepthStencilState.depth);
    runStencilState(gl, depthStencil?.stencil || defaultDepthStencilState.stencil);
}

function runDepthState(gl: WebGLRenderingContext, depth: IDepthState)
{
    const { depthtest, depthCompare, depthWriteEnabled, depthBias } = { ...defaultDepthState, ...depth };

    if (depthtest)
    {
        gl.enable(gl.DEPTH_TEST);
        //
        gl.depthFunc(gl[depthCompare]);
        gl.depthMask(depthWriteEnabled);

        //
        if (depthBias)
        {
            const { factor, units } = { ...defaultDepthBias, ...depthBias };

            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(factor, units);
        }
        else
        {
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
}

function runStencilState(gl: WebGLRenderingContext, stencil: IStencilState)
{
    //
    const {
        useStencil, stencilFront, stencilBack,
    } = { ...defaultStencilState, ...stencil };

    if (useStencil)
    {
        gl.enable(gl.STENCIL_TEST);
        {
            const { stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask } = { ...defaultStencilFaceState, ...stencilFront };
            gl.stencilFuncSeparate(gl.FRONT, gl[stencilFunc], stencilFuncRef, stencilFuncMask);
            gl.stencilOpSeparate(gl.FRONT, gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
            gl.stencilMaskSeparate(gl.FRONT, stencilMask);
        }
        {
            const { stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask } = { ...defaultStencilFaceState, ...stencilBack };
            gl.stencilFuncSeparate(gl.BACK, gl[stencilFunc], stencilFuncRef, stencilFuncMask);
            gl.stencilOpSeparate(gl.BACK, gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
            gl.stencilMaskSeparate(gl.BACK, stencilMask);
        }
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}