import { getWebGLRenderingContext } from "./caches/getWebGLRenderingContext";
import { IWebGLCanvasContext } from "./data/IWebGLCanvasContext";
import { IWebGLSubmit } from "./data/IWebGLSubmit";
import { IRenderObject } from "./data/IRenderObject";
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
     * 提交渲染数据
     *
     * @param data
     * @returns
     */
    static submit(data: IWebGLSubmit)
    {
        const gl = getWebGLRenderingContext(data.canvasContext);

        if (!gl) return;

        if (gl.isContextLost()) return;

        //
        data.renderPasss.forEach((renderPass) =>
        {
            runWebGLRenderPass(gl, renderPass);
        });
    }

    /**
     * 渲染一次。
     *
     * @param renderAtomic 渲染原子，包含渲染所需的所有数据。
     */
    static render(canvasContext: IWebGLCanvasContext, renderAtomic: IRenderObject)
    {
        const gl = getWebGLRenderingContext(canvasContext);
        if (gl.isContextLost()) return;

        runRenderObject(gl, renderAtomic);
    }
}
