import { RenderParams } from '../data/RenderParams';
import { WebGLRenderer } from '../WebGLRenderer';

export class WebGLRenderParams
{
    private _webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this._webGLRenderer = webGLRenderer;
    }

    /**
     * 更新渲染参数
     */
    updateRenderParams(renderParams: RenderParams)
    {
        const { webGLContext, width, height, gl } = this._webGLRenderer;

        const { cullFace, frontFace,
            enableBlend, blendEquation, sfactor, dfactor,
            depthtest, depthFunc, depthMask,
            colorMask,
            useViewPort, viewPort,
            usePolygonOffset, polygonOffsetFactor, polygonOffsetUnits,
            useScissor, scissor,
            useStencil, stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask,
        } = renderParams;

        if (cullFace === 'NONE')
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
            webGLContext.viewport(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
        }
        else
        {
            webGLContext.viewport(0, 0, width, height);
        }

        if (usePolygonOffset)
        {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            webGLContext.polygonOffset(polygonOffsetFactor, polygonOffsetUnits);
        }
        else
        {
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }

        if (useScissor)
        {
            gl.enable(gl.SCISSOR_TEST);
            webGLContext.scissor(scissor.x, scissor.y, scissor.width, scissor.height);
        }
        else
        {
            gl.disable(gl.SCISSOR_TEST);
        }

        if (useStencil)
        {
            gl.enable(gl.STENCIL_TEST);
            webGLContext.stencilFunc(stencilFunc, stencilFuncRef, stencilFuncMask);
            webGLContext.stencilOp(stencilOpFail, stencilOpZFail, stencilOpZPass);
            webGLContext.stencilMask(stencilMask);
        }
        else
        {
            gl.disable(gl.STENCIL_TEST);
        }
    }
}
