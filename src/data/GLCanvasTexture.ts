import { GLCanvasContext } from "./GLCanvasContext";

/**
 * 画布纹理，从画布的WebGPU上下文获取纹理
 */
export interface GLCanvasTexture
{
    context: GLCanvasContext;
}