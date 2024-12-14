import { IRenderObject } from "@feng3d/render-api";
import { LazyObject } from "../types";
import { IGLDrawIndexed } from "./IGLDrawIndexed";
import { IGLDrawVertex } from "./IGLDrawVertex";
import { IGLIndicesDataTypes } from "./IGLIndexBuffer";
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
         * 顶点索引数据
         */
        indices?: IGLIndicesDataTypes;

        /**
         * Uniform渲染数据
         */
        uniforms?: LazyObject<IGLUniforms>;

        /**
         * 绘制一定数量顶点。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
         */
        drawVertex?: IGLDrawVertex;

        /**
         * 根据索引数据绘制图元。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
         */
        drawIndexed?: IGLDrawIndexed;

        /**
         * 回写顶点着色器中输出到缓冲区。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
         */
        transformFeedback?: IGLTransformFeedback;
    }

}
