import { getWebGLRenderingContext } from "./caches/getWebGLRenderingContext";
import { IRenderObject } from "./data/IRenderObject";
import { IWebGLCanvasContext } from "./data/IWebGLCanvasContext";
import { IWebGLRenderPass } from "./data/IWebGLRenderPass";
import { runRenderObject } from "./runs/runRenderObject";
import { runWebGLRenderPass } from "./runs/runWebGLRenderPass";

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
    static renderPass(canvasContext: IWebGLCanvasContext, renderPass: IWebGLRenderPass)
    {
        const gl = getWebGLRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        runWebGLRenderPass(gl, renderPass);
    }

    /**
     * 渲染一次。
     *
     * @param renderAtomic 渲染原子，包含渲染所需的所有数据。
     */
    static renderObject(canvasContext: IWebGLCanvasContext, renderAtomic: IRenderObject)
    {
        const gl = getWebGLRenderingContext(canvasContext);
        if (!gl || gl.isContextLost()) return;

        runRenderObject(gl, renderAtomic);
    }
}
