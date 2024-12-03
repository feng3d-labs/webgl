import { LazyObject } from "../types";
import { IGLDrawArrays } from "./IGLDrawArrays";
import { IGLDrawElements } from "./IGLDrawElements";
import { IGLRenderPipeline } from "./IGLRenderPipeline";
import { IGLTransformFeedback } from "./IGLTransformFeedback";
import { IGLUniforms } from "./IGLUniforms";
import { IGLVertexArrayObject } from "./IGLVertexArrayObject";

/**
 * 渲染原子（该对象会收集一切渲染所需数据以及参数）
 */
export interface IGLRenderObject
{
    /**
     * 数据类型。
     */
    readonly __type?: "IGLRenderObject";

    /**
     * 渲染程序
     */
    pipeline: IGLRenderPipeline;

    /**
     * 顶点属性以及索引数据。
     */
    vertexArray?: IGLVertexArrayObject;

    /**
     * Uniform渲染数据
     */
    uniforms?: LazyObject<IGLUniforms>;

    /**
     * 绘制一定数量顶点。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
     */
    drawArrays?: IGLDrawArrays;

    /**
     * 绘制一定数量顶点索引。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     */
    drawElements?: IGLDrawElements;

    // /**
    //  * 视窗，显示在画布上的区域。
    //  *
    //  * 指定了x和y从标准化设备坐标到窗口坐标的仿射变换。
    //  *
    //  * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport
    //  */
    // viewport?: IGLViewport;

    // /**
    //  * 剪刀盒。
    //  *
    //  * 设置了一个剪刀盒，它将绘图限制为一个指定的矩形。
    //  *
    //  * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor
    //  */
    // scissor?: IGLScissor;

    /**
     * 回写顶点着色器中输出到缓冲区。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
     */
    transformFeedback?: IGLTransformFeedback;
}
