import { IRenderObject } from "@feng3d/render-api";
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
        uniforms?: IGLUniforms;
    }
}
