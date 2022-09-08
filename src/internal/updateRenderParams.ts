import { RenderParams } from '../data/RenderParams';
import { ColorMask } from '../gl/enums/ColorMask';
import { CullFace } from '../gl/enums/CullFace';
import { WebGLRenderer } from '../WebGLRenderer';

/**
 * 更新渲染参数
 */
export function updateRenderParams(webGLRenderer: WebGLRenderer, renderParams: RenderParams)
{
    const { gl, capabilities } = webGLRenderer;

    const cullfaceEnum = renderParams.cullFace;
    const blendEquation = gl[renderParams.blendEquation];
    const sfactor = gl[renderParams.sfactor];
    const dfactor = gl[renderParams.dfactor];
    const cullFace = gl[renderParams.cullFace];
    const frontFace = gl[renderParams.frontFace];
    const enableBlend = renderParams.enableBlend;
    const depthtest = renderParams.depthtest;
    const depthMask = renderParams.depthMask;
    const depthFunc = gl[renderParams.depthFunc];
    let viewPort = renderParams.viewPort;
    const useViewPort = renderParams.useViewPort;
    const useScissor = renderParams.useScissor;
    const scissor = renderParams.scissor;
    const colorMask = renderParams.colorMask;
    const colorMaskB = [ColorMask.R, ColorMask.G, ColorMask.B, ColorMask.A].map((v) => !!(colorMask & v));

    const usePolygonOffset = renderParams.usePolygonOffset;
    const polygonOffsetFactor = renderParams.polygonOffsetFactor;
    const polygonOffsetUnits = renderParams.polygonOffsetUnits;

    const useStencil = renderParams.useStencil;
    const stencilFunc = gl[renderParams.stencilFunc];
    const stencilFuncRef = renderParams.stencilFuncRef;
    const stencilFuncMask = renderParams.stencilFuncMask;
    const stencilOpFail = gl[renderParams.stencilOpFail];
    const stencilOpZFail = gl[renderParams.stencilOpZFail];
    const stencilOpZPass = gl[renderParams.stencilOpZPass];
    const stencilMask = renderParams.stencilMask;

    if (!useViewPort)
    {
        viewPort = { x: 0, y: 0, width: gl.canvas.width, height: gl.canvas.height };
    }

    if (cullfaceEnum !== CullFace.NONE)
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(cullFace);
        gl.frontFace(frontFace);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }

    if (enableBlend)
    {
        //
        gl.enable(gl.BLEND);
        gl.blendEquation(blendEquation);
        gl.blendFunc(sfactor, dfactor);
    }
    else
    {
        gl.disable(gl.BLEND);
    }

    if (depthtest)
    {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(depthFunc);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
    gl.depthMask(depthMask);

    gl.colorMask(colorMaskB[0], colorMaskB[1], colorMaskB[2], colorMaskB[3]);

    gl.viewport(viewPort.x, viewPort.y, viewPort.width, viewPort.height);

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
        if (capabilities.stencilBits === 0)
        {
            console.warn(`${gl} 不支持 stencil，参考 https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext WebGL context attributes: stencil`);
        }
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(stencilFunc, stencilFuncRef, stencilFuncMask);
        gl.stencilOp(stencilOpFail, stencilOpZFail, stencilOpZPass);
        gl.stencilMask(stencilMask);
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}
