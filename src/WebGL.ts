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
export class WebGL
{
    /**
     * 提交一次渲染通道数据。
     *
     * @param renderingContext 渲染画布上下文描述。
     * @param renderPass 渲染通道数据。
     * @returns
     */
    static runRenderPass(renderingContext: IRenderingContext, renderPass: IRenderPass)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        runRenderPass(gl, renderPass);
    }

    /**
     * 渲染一次。
     *
     * @param renderObject 渲染原子，包含渲染所需的所有数据。
     */
    static runRenderObject(renderingContext: IRenderingContext, renderObject: IRenderObject)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        runRenderObject(gl, renderObject);
    }

    static runBlitFramebuffer(renderingContext: IRenderingContext, blitFramebuffer: IBlitFramebuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        runBlitFramebuffer(gl, blitFramebuffer);
    }

    static runCopyBuffer(renderingContext: IRenderingContext, copyBuffer: ICopyBuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        runCopyBuffer(gl, copyBuffer);
    }

    static runReadPixels(renderingContext: IRenderingContext, readPixels: IReadPixels)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        runReadPixels(gl, readPixels);
    }

    static deleteFramebuffer(renderingContext: IRenderingContext, passDescriptor: IPassDescriptor)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteFramebuffer(gl, passDescriptor);
    }

    static deleteRenderbuffer(renderingContext: IRenderingContext, renderbuffer: IRenderbuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteRenderbuffer(gl, renderbuffer);
    }

    static deleteBuffer(renderingContext: IRenderingContext, buffer: IBuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteBuffer(gl, buffer);
    }

    static deleteTexture(renderingContext: IRenderingContext, texture: ITexture)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteTexture(gl, texture);
    }

    static deleteSampler(renderingContext: IRenderingContext, sampler: ISampler)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteSampler(gl, sampler);
    }

    static deleteProgram(renderingContext: IRenderingContext, pipeline: IRenderPipeline)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteProgram(gl, pipeline);
    }

    static deleteVertexArray(renderingContext: IRenderingContext, vertexArray: IVertexArrayObject)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteVertexArray(gl, vertexArray);
    }

    static deleteTransformFeedback(renderingContext: IRenderingContext, transformFeedback: ITransformFeedback)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteTransformFeedback(gl, transformFeedback);
    }

    static getQueryResult(renderingContext: IRenderingContext, query: IQuery)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        return getQueryResult(gl, query);
    }
}
