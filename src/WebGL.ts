import { deleteBuffer } from "./caches/getBuffer";
import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getRenderingContext } from "./caches/getRenderingContext";
import { deleteTexture } from "./caches/getTexture";
import { IBlitFramebuffer } from "./data/IBlitFramebuffer";
import { IBuffer } from "./data/IBuffer";
import { IRenderingContext } from "./data/ICanvasContext";
import { IPassDescriptor } from "./data/IPassDescriptor";
import { IRenderObject } from "./data/IRenderObject";
import { IRenderPass } from "./data/IRenderPass";
import { IRenderPipeline } from "./data/IRenderPipeline";
import { IRenderbuffer } from "./data/IRenderbuffer";
import { ITexture } from "./data/ITexture";
import { runBlitFramebuffer } from "./runs/runBlitFramebuffer";
import { runRenderObject } from "./runs/runRenderObject";
import { runRenderPass } from "./runs/runRenderPass";
import { deleteVertexArray } from "./runs/runVertexIndex";

/**
 * WEBGL 渲染器
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderAtomic 渲染數據進行渲染。
 */
export class WebGL
{
    /**
     * 提交一次渲染通道数据。
     *
     * @param canvasContext 渲染画布上下文描述。
     * @param renderPass 渲染通道数据。
     * @returns
     */
    static runRenderPass(canvasContext: IRenderingContext, renderPass: IRenderPass)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        runRenderPass(gl, renderPass);
    }

    /**
     * 渲染一次。
     *
     * @param renderAtomic 渲染原子，包含渲染所需的所有数据。
     */
    static runRenderObject(canvasContext: IRenderingContext, renderAtomic: IRenderObject)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        runRenderObject(gl, renderAtomic);
    }

    static runBlitFramebuffer(canvasContext: IRenderingContext, blitFramebuffer: IBlitFramebuffer)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        runBlitFramebuffer(gl, blitFramebuffer);
    }

    static deleteFramebuffer(canvasContext: IRenderingContext, passDescriptor: IPassDescriptor)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteFramebuffer(gl, passDescriptor);
    }

    static deleteRenderbuffer(canvasContext: IRenderingContext, colorRenderbuffer: IRenderbuffer)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteRenderbuffer(gl, colorRenderbuffer);
    }

    static deleteBuffer(canvasContext: IRenderingContext, vertexPosBuffer: IBuffer)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteBuffer(gl, vertexPosBuffer);
    }

    static deleteTexture(canvasContext: IRenderingContext, textureDiffuse: ITexture)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteTexture(gl, textureDiffuse);
    }

    static deleteProgram(canvasContext: IRenderingContext, pipeline: IRenderPipeline)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteProgram(gl, pipeline);
    }

    static deleteVertexArray(canvasContext: IRenderingContext, renderObject: IRenderObject)
    {
        const gl = getRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        deleteVertexArray(gl, renderObject);
    }
}
