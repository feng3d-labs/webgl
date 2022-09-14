import { FunctionPropertyNames } from '@feng3d/polyfill';
import { RenderParams } from '../data/RenderParams';
import { BlendEquation } from './enums/BlendEquation';
import { ColorMask } from './enums/ColorMask';
import { CullFace } from './enums/CullFace';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLState } from './WebGLState';

export class WebGLRenderParams
{
    gl: WebGLRenderingContext;
    capabilities: WebGLCapabilities;
    state: WebGLState;

    constructor(gl: WebGLRenderingContext, capabilities: WebGLCapabilities, state: WebGLState)
    {
        this.gl = gl;
        this.capabilities = capabilities;
        this.state = state;

        this.cacheRenderParams();
    }

    private cacheRenderParams()
    {
        const { gl } = this;

        const enableMap = {};
        const oldEnable = gl.enable;
        gl.enable = (cap) =>
        {
            if (enableMap[cap] === true) return;
            oldEnable.call(gl, cap);
            enableMap[cap] = true;
        };

        const oldDisable = gl.disable;
        gl.disable = (cap) =>
        {
            if (enableMap[cap] === false) return;
            oldDisable.call(gl, cap);
            enableMap[cap] = false;
        };

        this.cacheFunction(gl, 'cullFace');
        this.cacheFunction(gl, 'frontFace');
        this.cacheFunction(gl, 'blendEquation');
        this.cacheFunction(gl, 'blendFunc');
        this.cacheFunction(gl, 'depthFunc');
        this.cacheFunction(gl, 'depthMask');
        this.cacheFunction(gl, 'colorMask');
        this.cacheFunction(gl, 'viewport');
        this.cacheFunction(gl, 'useProgram');
        this.cacheFunction(gl, 'polygonOffset');
        this.cacheFunction(gl, 'scissor');
        this.cacheFunction(gl, 'stencilFunc');
        this.cacheFunction(gl, 'stencilOp');
        this.cacheFunction(gl, 'stencilMask');
    }

    private cacheFunction<T>(gl: T, funcName: FunctionPropertyNames<T>)
    {
        let cacheParams: any[] = [];
        const oldBlendFunc = gl[funcName] as any as Function;
        gl[funcName] = ((...params: any[]) =>
        {
            const equal = params.every((_v, i, arr) => arr[i] === cacheParams[i]);
            if (equal) return;

            cacheParams = params.concat();
            const result = oldBlendFunc.apply(gl, params);

            return result;
        }) as any;
    }

    /**
     * 更新渲染参数
     */
    updateRenderParams(renderParams: RenderParams)
    {
        const { gl, capabilities, state } = this;

        const cullfaceEnum = renderParams.cullFace;
        const blendEquation = state.convertBlendEquation(renderParams.blendEquation as BlendEquation);
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
}
