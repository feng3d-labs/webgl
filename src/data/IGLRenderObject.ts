import { IRenderObject } from "@feng3d/render-api";
import { LazyObject } from "../types";
import { IGLTransformFeedback } from "./IGLTransformFeedback";
import { IGLUniforms } from "./IGLUniforms";

declare module "@feng3d/render-api"
{
    /**
     * 渲染对象，包含一次渲染时包含的所有数据。
     */
    export interface IRenderObject
    {
        /**
         * Uniform渲染数据
         */
        uniforms?: LazyObject<IGLUniforms>;

        /**
         * 回写顶点着色器中输出到缓冲区。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
         */
        transformFeedback?: IGLTransformFeedback;
    }

    /**
     * 剪刀盒。
     *
     * 设置了一个剪刀盒，它将绘图限制为一个指定的矩形。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor
     */
    export interface IScissorRect
    {
        /**
         * 数据类型。
         */
        readonly __type: "ScissorRect";
    }
}
