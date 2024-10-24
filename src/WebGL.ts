import { IWebRenderer } from "@feng3d/renderer-common";
import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getRenderingContext } from "./caches/getRenderingContext";
import { deleteSampler } from "./caches/getSampler";
import { deleteTexture } from "./caches/getTexture";
import { deleteBuffer } from "./caches/getWebGLBuffer";
import { deleteTransformFeedback } from "./caches/getWebGLTransformFeedback";
import { IBlitFramebuffer } from "./data/IBlitFramebuffer";
import { IBuffer } from "./data/IBuffer";
import { ICopyBuffer } from "./data/ICopyBuffer";
import { IPassDescriptor } from "./data/IPassDescriptor";
import { IQuery } from "./data/IQueryAction";
import { IReadPixels } from "./data/IReadPixels";
import { IRenderObject } from "./data/IRenderObject";
import { IRenderPass } from "./data/IRenderPass";
import { IRenderPipeline } from "./data/IRenderPipeline";
import { IRenderbuffer } from "./data/IRenderbuffer";
import { IRenderingContext } from "./data/IRenderingContext";
import { ISampler } from "./data/ISampler";
import { ITexture } from "./data/ITexture";
import { ITransformFeedback } from "./data/ITransformFeedback";
import { IVertexArrayObject } from "./data/IVertexArrayObject";
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
export class WebGL implements IWebRenderer
{
    private _renderingContext: IRenderingContext;
    private _gl: WebGLRenderingContext;

    constructor(renderingContext: IRenderingContext)
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
    runRenderPass(renderPass: IRenderPass)
    {
        runRenderPass(this._gl, renderPass);
    }

    /**
     * 渲染一次。
     *
     * @param renderObject 渲染原子，包含渲染所需的所有数据。
     */
    runRenderObject(renderObject: IRenderObject)
    {
        runRenderObject(this._gl, renderObject);
    }

    runBlitFramebuffer(blitFramebuffer: IBlitFramebuffer)
    {
        runBlitFramebuffer(this._gl, blitFramebuffer);
    }

    runCopyBuffer(copyBuffer: ICopyBuffer)
    {
        runCopyBuffer(this._gl, copyBuffer);
    }

    runReadPixels(readPixels: IReadPixels)
    {
        runReadPixels(this._gl, readPixels);
    }

    deleteFramebuffer(passDescriptor: IPassDescriptor)
    {
        deleteFramebuffer(this._gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: IRenderbuffer)
    {
        deleteRenderbuffer(this._gl, renderbuffer);
    }

    deleteBuffer(buffer: IBuffer)
    {
        deleteBuffer(this._gl, buffer);
    }

    deleteTexture(texture: ITexture)
    {
        deleteTexture(this._gl, texture);
    }

    deleteSampler(sampler: ISampler)
    {
        deleteSampler(this._gl, sampler);
    }

    deleteProgram(pipeline: IRenderPipeline)
    {
        deleteProgram(this._gl, pipeline);
    }

    deleteVertexArray(vertexArray: IVertexArrayObject)
    {
        deleteVertexArray(this._gl, vertexArray);
    }

    deleteTransformFeedback(transformFeedback: ITransformFeedback)
    {
        deleteTransformFeedback(this._gl, transformFeedback);
    }

    getQueryResult(query: IQuery)
    {
        return getQueryResult(this._gl, query);
    }
}
