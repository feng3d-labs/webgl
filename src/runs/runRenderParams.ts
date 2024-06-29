import { getRenderParams } from "../caches/getRenderParams";
import { RenderParams } from "../data/RenderParams";

export function runRenderParams(gl: WebGLRenderingContext, renderParams: RenderParams)
{
    renderParams = getRenderParams(renderParams);

    const {
        usePolygonOffset, polygonOffsetFactor, polygonOffsetUnits,
        useScissor, scissor,
        useStencil, stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask,
    } = renderParams;

    if (usePolygonOffset)
    {
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(polygonOffsetFactor, polygonOffsetUnits);
    }
    else
    {
        gl.disable(gl.POLYGON_OFFSET_FILL);
    }

    if (useScissor)
    {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissor.x, scissor.y, scissor.width, scissor.height);
    }
    else
    {
        gl.disable(gl.SCISSOR_TEST);
    }

    if (useStencil)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl[stencilFunc], stencilFuncRef, stencilFuncMask);
        gl.stencilOp(gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
        gl.stencilMask(stencilMask);
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}