import { getWebGLRenderingContext } from "./caches/getWebGLRenderingContext";
import { IWebGLCanvasContext } from "./data/IWebGLCanvasContext";
import { IWebGLPassDescriptor } from "./data/IWebGLPassDescriptor";
import { IWebGLRenderPass } from "./data/IWebGLRenderPass";
import { IWebGLSubmit } from "./data/IWebGLSubmit";
import { RenderAtomic } from "./data/RenderAtomic";
import { WebGLAttributeBuffers } from "./gl/WebGLAttributeBuffers";
import { WebGLBindingStates } from "./gl/WebGLBindingStates";
import { WebGLCapabilities } from "./gl/WebGLCapabilities";
import { WebGLElementBuffers } from "./gl/WebGLElementBuffers";
import { WebGLFramebuffers } from "./gl/WebGLFramebuffers";
import { WebGLInfo } from "./gl/WebGLInfo";
import { WebGLRenderAtomic } from "./gl/WebGLRenderAtomic";
import { WebGLRenderbuffers } from "./gl/WebGLRenderbuffers";
import { WebGLRenderParams } from "./gl/WebGLRenderParams";
import { WebGLShaders } from "./gl/WebGLShaders";
import { WebGLTextures } from "./gl/WebGLTextures";
import { WebGLUniforms } from "./gl/WebGLUniforms";
import { runWebGLPassDescriptor } from "./runs/runWebGLPassDescriptor";

/**
 * WEBGL 渲染器
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderAtomic 渲染數據進行渲染。
 *
 * 3D 渲染請使用 WebGLRenderer3D。
 */
export class WebGLRenderer
{
    /**
     * WebGL渲染上下文，圖形庫。
     */
    readonly gl: WebGLRenderingContext;

    /**
     * WebGL纹理
     */
    textures: WebGLTextures;

    /**
     * WebGL信息
     */
    info: WebGLInfo;

    shaders: WebGLShaders;
    bindingStates: WebGLBindingStates;
    attributeBuffers: WebGLAttributeBuffers;
    renderParams: WebGLRenderParams;
    uniforms: WebGLUniforms;
    renderbuffers: WebGLRenderbuffers;
    framebuffers: WebGLFramebuffers;

    elementBuffers: WebGLElementBuffers;

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

        if (!gl)
        {
            return;
        }

        data.renderPasss.forEach((renderPass) =>
        {
            this.renderPass(gl, renderPass);
        });
    }
    private renderPass(gl: WebGLRenderingContext, renderPass: IWebGLRenderPass)
    {
        runWebGLPassDescriptor(gl, renderPass.passDescriptor);

        // renderPass?.renderObjects.forEach((renderObject) =>
        // {
        //     this.render(renderObject);
        // });
    }

    constructor(canvasContext: IWebGLCanvasContext)
    {
        this.__canvasContext = canvasContext;

        this.gl = getWebGLRenderingContext(this.__canvasContext);

        new WebGLCapabilities(this.gl);

        this.info = new WebGLInfo(this);
        this.shaders = new WebGLShaders(this);
        this.textures = new WebGLTextures(this);
        this.attributeBuffers = new WebGLAttributeBuffers(this);
        this.elementBuffers = new WebGLElementBuffers(this);

        this.bindingStates = new WebGLBindingStates(this);
        this.renderParams = new WebGLRenderParams(this);
        this.uniforms = new WebGLUniforms();
        this.renderbuffers = new WebGLRenderbuffers(this);
        this.framebuffers = new WebGLFramebuffers(this);
    }

    /**
     * 渲染一次。
     *
     * @param renderAtomic 渲染原子，包含渲染所需的所有数据。
     */
    render(renderAtomic: RenderAtomic)
    {
        if (this.gl.isContextLost()) return;

        const webGLRenderAtomic = new WebGLRenderAtomic(renderAtomic);

        const { bindingStates, renderParams, elementBuffers: elementBufferRenderer, uniforms, shaders } = this;

        const shaderResult = shaders.activeShader(webGLRenderAtomic);

        renderParams.updateRenderParams(webGLRenderAtomic.renderParams);

        bindingStates.setup(webGLRenderAtomic);

        uniforms.activeUniforms(this, webGLRenderAtomic, shaderResult.uniforms);

        elementBufferRenderer.render(webGLRenderAtomic);
    }
}
