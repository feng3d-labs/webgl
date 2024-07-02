import { deleteBuffer } from "./caches/getBuffer";
import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getRenderingContext } from "./caches/getRenderingContext";
import { deleteTexture } from "./caches/getTexture";
import { IBlitFramebuffer } from "./data/IBlitFramebuffer";
import { IBuffer } from "./data/IBuffer";
import { IPassDescriptor } from "./data/IPassDescriptor";
import { IReadPixels } from "./data/IReadPixels";
import { IRenderObject } from "./data/IRenderObject";
import { IRenderPass } from "./data/IRenderPass";
import { IRenderPipeline } from "./data/IRenderPipeline";
import { IRenderbuffer } from "./data/IRenderbuffer";
import { IRenderingContext } from "./data/IRenderingContext";
import { ITexture } from "./data/ITexture";
import { IVertexArrayObject } from "./data/IVertexArrayObject";
import { runBlitFramebuffer } from "./runs/runBlitFramebuffer";
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

    static deleteRenderbuffer(renderingContext: IRenderingContext, colorRenderbuffer: IRenderbuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteRenderbuffer(gl, colorRenderbuffer);
    }

    static deleteBuffer(renderingContext: IRenderingContext, vertexPosBuffer: IBuffer)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteBuffer(gl, vertexPosBuffer);
    }

    static deleteTexture(renderingContext: IRenderingContext, textureDiffuse: ITexture)
    {
        const gl = getRenderingContext(renderingContext);
        if (!gl || gl.isContextLost()) return;

        deleteTexture(gl, textureDiffuse);
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
}
