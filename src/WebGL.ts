import { RunWebGL } from "./RunWebGL";
import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getCanvas, getRenderingContext } from "./caches/getRenderingContext";
import { deleteSampler } from "./caches/getSampler";
import { deleteTexture } from "./caches/getTexture";
import { deleteBuffer } from "./caches/getWebGLBuffer";
import { deleteTransformFeedback } from "./caches/getWebGLTransformFeedback";
import { IGLBlitFramebuffer } from "./data/IGLBlitFramebuffer";
import { IGLBuffer } from "./data/IGLBuffer";
import { IGLCopyBufferToBuffer } from "./data/IGLCopyBufferToBuffer";
import { IGLRenderPassDescriptor } from "./data/IGLPassDescriptor";
import { IGLQuery } from "./data/IGLQueryAction";
import { IGLReadPixels } from "./data/IGLReadPixels";
import { IGLRenderPass } from "./data/IGLRenderPass";
import { IGLRenderPipeline } from "./data/IGLRenderPipeline";
import { IGLRenderbuffer } from "./data/IGLRenderbuffer";
import { IGLRenderingContext } from "./data/IGLRenderingContext";
import { IGLSampler } from "./data/IGLSampler";
import { IGLSubmit } from "./data/IGLSubmit";
import { IGLTexture } from "./data/IGLTexture";
import { IGLTransformFeedback } from "./data/IGLTransformFeedback";
import { IGLVertexArrayObject } from "./data/IGLVertexArrayObject";
import { getQueryResult } from "./runs/runQueryAction";
import { runReadPixels } from "./runs/runReadPixels";
import { deleteVertexArray } from "./runs/runVertexArray";

/**
 * WEBGL 对象。
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderObject 渲染數據進行渲染。
 */
export class WebGL
{
    private _runWebGL: RunWebGL = new RunWebGL();
    private _renderingContext: IGLRenderingContext;
    gl: WebGLRenderingContext;

    constructor(renderingContext: IGLRenderingContext)
    {
        this.init(renderingContext);
    }

    init(renderingContext: IGLRenderingContext)
    {
        this._renderingContext = renderingContext;
        const gl = getRenderingContext(this._renderingContext);

        const canvas = getCanvas(renderingContext);
        canvas.addEventListener("webglcontextlost", function _onContextLost(event: Event)
        {
            console.warn("WebGLRenderer: Context Lost.");

            this.init(renderingContext);
        });

        this.gl = gl;

        return this;
    }

    /**
     * 提交 GPU 。
     *
     * @param submit 一次 GPU 提交内容。
     *
     */
    submit(submit: IGLSubmit)
    {
        this._runWebGL.runSubmit(this.gl, submit);
    }

    /**
     * 提交一次渲染通道数据。
     *
     * @param renderingContext 渲染画布上下文描述。
     * @param renderPass 渲染通道数据。
     * @returns
     */
    runRenderPass(renderPass: IGLRenderPass)
    {
        const submit: IGLSubmit = { commandEncoders: [{ passEncoders: [renderPass] }] };
        this.submit(submit);
    }

    runBlitFramebuffer(blitFramebuffer: IGLBlitFramebuffer)
    {
        const submit: IGLSubmit = { commandEncoders: [{ passEncoders: [blitFramebuffer] }] };
        this.submit(submit);
    }

    runCopyBuffer(copyBuffer: IGLCopyBufferToBuffer)
    {
        const submit: IGLSubmit = { commandEncoders: [{ passEncoders: [copyBuffer] }] };
        this.submit(submit);
    }

    runReadPixels(readPixels: IGLReadPixels)
    {
        runReadPixels(this.gl, readPixels);
    }

    deleteFramebuffer(passDescriptor: IGLRenderPassDescriptor)
    {
        deleteFramebuffer(this.gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: IGLRenderbuffer)
    {
        deleteRenderbuffer(this.gl, renderbuffer);
    }

    deleteBuffer(buffer: IGLBuffer)
    {
        deleteBuffer(this.gl, buffer);
    }

    deleteTexture(texture: IGLTexture)
    {
        deleteTexture(this.gl, texture);
    }

    deleteSampler(sampler: IGLSampler)
    {
        deleteSampler(this.gl, sampler);
    }

    deleteProgram(pipeline: IGLRenderPipeline)
    {
        deleteProgram(this.gl, pipeline);
    }

    deleteVertexArray(vertexArray: IGLVertexArrayObject)
    {
        deleteVertexArray(this.gl, vertexArray);
    }

    deleteTransformFeedback(transformFeedback: IGLTransformFeedback)
    {
        deleteTransformFeedback(this.gl, transformFeedback);
    }

    getQueryResult(query: IGLQuery)
    {
        return getQueryResult(this.gl, query);
    }
}
