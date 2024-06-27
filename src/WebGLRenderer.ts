import { getContext as getContext1 } from "./caches/getContext";
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
        const gl = getContext1(canvasContext);
        const webgl = new WebGLRenderer(gl.canvas as any);
        webgl.__canvasContext = canvasContext;

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
        const gl = getContext1(this.__canvasContext);

        if (!gl)
        {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");

            return;
        }

        data.renderPasss.forEach((renderPass) =>
        {
            this.renderPass(gl, renderPass);
        });
    }
    private renderPass(gl: WebGLRenderingContext, renderPass: IWebGLRenderPass)
    {
        this.passDescriptor(gl, renderPass.passDescriptor);

        // renderPass?.renderObjects.forEach((renderObject) =>
        // {
        //     this.render(renderObject);
        // });
    }

    private passDescriptor(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
    {
        const { clearColor, clearDepth, clearMask, depthTest, depthFunc } = passDescriptor;

        // Set clear color to black, fully opaque
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        gl.clearDepth(clearDepth); // Clear everything
        if (depthTest)
        {
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
        }
        else
        {
            gl.disable(gl.DEPTH_TEST); // Enable depth testing
        }
        gl.depthFunc(gl[depthFunc]); // Near things obscure far things
        // Clear the color buffer with specified clear color
        gl.clear(getClearMask(gl, clearMask));
    }

    constructor(canvas?: HTMLCanvasElement, contextAttributes?: WebGLContextAttributes)
    {
        if (!canvas)
        {
            canvas = document.createElement("canvas");
            canvas.id = "glcanvas";
            canvas.style.position = "fixed";
            canvas.style.left = "0px";
            canvas.style.top = "0px";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            document.body.appendChild(canvas);
        }
        canvas.addEventListener("webglcontextlost", this._onContextLost, false);
        canvas.addEventListener("webglcontextrestored", this._onContextRestore, false);
        canvas.addEventListener("webglcontextcreationerror", this._onContextCreationError, false);

        contextAttributes = Object.assign({
            depth: true,
            stencil: true,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
        } as Partial<WebGLContextAttributes>, contextAttributes);

        const contextNames = ["webgl2", "webgl", "experimental-webgl"];
        this.gl = getContext(canvas, contextNames, contextAttributes) as WebGLRenderingContext;

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
        if (this._isContextLost === true) return;

        const webGLRenderAtomic = new WebGLRenderAtomic(this, renderAtomic);

        const { bindingStates, renderParams, elementBuffers: elementBufferRenderer, uniforms, shaders } = this;

        const shaderResult = shaders.activeShader(webGLRenderAtomic);

        renderParams.updateRenderParams(webGLRenderAtomic.renderParams);

        bindingStates.setup(webGLRenderAtomic);

        uniforms.activeUniforms(this, webGLRenderAtomic, shaderResult.uniforms);

        elementBufferRenderer.render(webGLRenderAtomic);
    }

    private _isContextLost = false;
    private _onContextLost = (event: Event) =>
    {
        event.preventDefault();

        console.warn("WebGLRenderer: Context Lost.");

        this._isContextLost = true;
    };

    private _onContextRestore = () =>
    {
        console.warn("WebGLRenderer: Context Restored.");

        this._isContextLost = false;
    };

    private _onContextCreationError = (event: WebGLContextEvent) =>
    {
        console.error("WebGLRenderer: A WebGL context could not be created. Reason: ", event.statusMessage);
    };
}

function getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    const context = _getContext(canvas, contextNames, contextAttributes);

    if (!context)
    {
        if (_getContext(canvas, contextNames))
        {
            throw new Error("Error creating WebGL context with your selected attributes.");
        }
        else
        {
            throw new Error("Error creating WebGL context.");
        }
    }

    return context;
}

function _getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    let context: RenderingContext;
    for (let i = 0; i < contextNames.length; ++i)
    {
        context = canvas.getContext(contextNames[i], contextAttributes);
        if (context) return context;
    }

    return null;
}

function getClearMask(gl: WebGLRenderingContext, clearMask: ("COLOR_BUFFER_BIT" | "DEPTH_BUFFER_BIT" | "STENCIL_BUFFER_BIT")[])
{
    const result = clearMask.reduce((pv, cv) => pv | gl[cv], 0);

    return result;
}