import { getWebGLRenderingContext } from "./caches/getWebGLRenderingContext";
import { IWebGLCanvasContext } from "./data/IWebGLCanvasContext";
import { IWebGLSubmit } from "./data/IWebGLSubmit";
import { RenderAtomic } from "./data/RenderAtomic";
import { WebGLRenderAtomic } from "./gl/WebGLRenderAtomic";
import { runWebGLRenderPass } from "./runs/runWebGLRenderPass";

/**
 * WEBGL 渲染器
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderAtomic 渲染數據進行渲染。
 *
 * 3D 渲染請使用 WebGLRenderer3D。
 */
export class WebGLRenderer
{
    private __canvasContext: IWebGLCanvasContext;
    static init(canvasContext: IWebGLCanvasContext)
    {
        const webgl = new WebGLRenderer(canvasContext);

        return webgl;
    }

    /**
     * 提交渲染数据
     *
     * @param data
     * @returns
     */
    submit(data: IWebGLSubmit)
    {
        const gl = getWebGLRenderingContext(this.__canvasContext);

        if (!gl) return;

        if (gl.isContextLost()) return;

        //
        data.renderPasss.forEach((renderPass) =>
        {
            runWebGLRenderPass(gl, renderPass);
        });
    }

    constructor(canvasContext: IWebGLCanvasContext)
    {
        this.__canvasContext = canvasContext;
    }

    /**
     * 渲染一次。
     *
     * @param renderAtomic 渲染原子，包含渲染所需的所有数据。
     */
    render(renderAtomic: RenderAtomic)
    {
        const gl = getWebGLRenderingContext(this.__canvasContext);
        if (gl.isContextLost()) return;

        const webGLRenderAtomic = new WebGLRenderAtomic(renderAtomic);

        const { _bindingStates, _renderParams, _elementBuffers, _uniforms, _shaders } = gl;

        const shaderResult = _shaders.activeShader(webGLRenderAtomic);

        _renderParams.updateRenderParams(webGLRenderAtomic.renderParams);

        _bindingStates.setup(webGLRenderAtomic);

        _uniforms.activeUniforms(webGLRenderAtomic, shaderResult.uniforms);

        _elementBuffers.render(webGLRenderAtomic);
    }
}
