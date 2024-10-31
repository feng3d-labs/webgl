import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getRenderingContext } from "./caches/getRenderingContext";
import { deleteSampler } from "./caches/getSampler";
import { deleteTexture } from "./caches/getTexture";
import { deleteBuffer } from "./caches/getWebGLBuffer";
import { deleteTransformFeedback } from "./caches/getWebGLTransformFeedback";
import { IGLBlitFramebuffer } from "./data/IGLBlitFramebuffer";
import { IGLBuffer } from "./data/IGLBuffer";
import { IGLCopyBuffer } from "./data/IGLCopyBuffer";
import { IGLRenderPassDescriptor } from "./data/IGLPassDescriptor";
import { IGLQuery } from "./data/IGLQueryAction";
import { IGLReadPixels } from "./data/IGLReadPixels";
import { IGLRenderObject } from "./data/IGLRenderObject";
import { IGLRenderPass } from "./data/IGLRenderPass";
import { IGLRenderPipeline } from "./data/IGLRenderPipeline";
import { IGLRenderbuffer } from "./data/IGLRenderbuffer";
import { IGLRenderingContext } from "./data/IGLRenderingContext";
import { IGLSampler } from "./data/IGLSampler";
import { IGLTexture } from "./data/IGLTexture";
import { IGLTransformFeedback } from "./data/IGLTransformFeedback";
import { IGLVertexArrayObject } from "./data/IGLVertexArrayObject";
import { runBlitFramebuffer } from "./runs/runBlitFramebuffer";
import { runCopyBuffer } from "./runs/runCopyBuffer";
import { getQueryResult } from "./runs/runQueryAction";
import { runReadPixels } from "./runs/runReadPixels";
import { runRenderObject } from "./runs/runRenderObject";
import { runRenderPass } from "./runs/runRenderPass";
import { deleteVertexArray } from "./runs/runVertexArray";

/**
 * WEBGL 渲染器
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderObject 渲染數據進行渲染。
 */
export class WebGL
{
    private _renderingContext: IGLRenderingContext;
    private _gl: WebGLRenderingContext;

    constructor(renderingContext: IGLRenderingContext)
    {
        this._renderingContext = renderingContext;
        this._gl = getRenderingContext(this._renderingContext);
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
        runRenderPass(this._gl, renderPass);
    }

    /**
     * 渲染一次。
     *
     * @param renderObject 渲染原子，包含渲染所需的所有数据。
     */
    runRenderObject(renderObject: IGLRenderObject)
    {
        runRenderObject(this._gl, renderObject);
    }

    runBlitFramebuffer(blitFramebuffer: IGLBlitFramebuffer)
    {
        runBlitFramebuffer(this._gl, blitFramebuffer);
    }

    runCopyBuffer(copyBuffer: IGLCopyBuffer)
    {
        runCopyBuffer(this._gl, copyBuffer);
    }

    runReadPixels(readPixels: IGLReadPixels)
    {
        runReadPixels(this._gl, readPixels);
    }

    deleteFramebuffer(passDescriptor: IGLRenderPassDescriptor)
    {
        deleteFramebuffer(this._gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: IGLRenderbuffer)
    {
        deleteRenderbuffer(this._gl, renderbuffer);
    }

    deleteBuffer(buffer: IGLBuffer)
    {
        deleteBuffer(this._gl, buffer);
    }

    deleteTexture(texture: IGLTexture)
    {
        deleteTexture(this._gl, texture);
    }

    deleteSampler(sampler: IGLSampler)
    {
        deleteSampler(this._gl, sampler);
    }

    deleteProgram(pipeline: IGLRenderPipeline)
    {
        deleteProgram(this._gl, pipeline);
    }

    deleteVertexArray(vertexArray: IGLVertexArrayObject)
    {
        deleteVertexArray(this._gl, vertexArray);
    }

    deleteTransformFeedback(transformFeedback: IGLTransformFeedback)
    {
        deleteTransformFeedback(this._gl, transformFeedback);
    }

    getQueryResult(query: IGLQuery)
    {
        return getQueryResult(this._gl, query);
    }
}
