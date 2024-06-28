import { getRenderParams } from "../caches/getRenderParams";
import { RenderParams } from "../data/RenderParams";

export function runRenderParams(gl: WebGLRenderingContext, renderParams: RenderParams)
{
    renderParams = getRenderParams(renderParams);

    const { cullFace, frontFace,
        enableBlend, blendEquation, sfactor, dfactor,
        colorMask,
        useViewPort, viewPort,
        usePolygonOffset, polygonOffsetFactor, polygonOffsetUnits,
        useScissor, scissor,
        useStencil, stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask,
    } = renderParams;

    if (cullFace === "NONE")
    {
        gl.disable(gl.CULL_FACE);
    }
    else
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[cullFace]);
        gl.frontFace(gl[frontFace]);
    }

    if (enableBlend)
    {
        //
        gl.enable(gl.BLEND);
        gl.blendEquation(gl[blendEquation]);
        gl.blendFunc(gl[sfactor], gl[dfactor]);
    }
    else
    {
        gl.disable(gl.BLEND);
    }

    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    if (useViewPort)
    {
        gl.viewport(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
    }
    else
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

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