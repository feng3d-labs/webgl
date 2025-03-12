import { CanvasTexture } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    /**
     * 画布纹理，从画布的WebGPU上下文获取纹理
     */
    export interface CanvasTexture
    {
        /**
         * 画布上下文
         */
        context: CanvasContext;
    }
}