import { RenderParams } from "../data/RenderParams";

declare global
{
    interface WebGLRenderingContextExt
    {
        _renderParams: WebGLRenderParams;
    }
}

export class WebGLRenderParams
{
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;

        gl._renderParams = this;
    }

    /**
     * 更新渲染参数
     */
    updateRenderParams(renderParams: RenderParams)
    {
        const { gl } = this;

        const { cullFace, frontFace,
            enableBlend, blendEquation, sfactor, dfactor,
            depthtest, depthFunc, depthMask,
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

        if (depthtest)
        {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl[depthFunc]);
        }
        else
        {
            gl.disable(gl.DEPTH_TEST);
        }

        gl.depthMask(depthMask);

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
}
