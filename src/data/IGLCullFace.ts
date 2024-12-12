import { ICullFace } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    export interface ICullFaceMap
    {
        "FRONT_AND_BACK": "FRONT_AND_BACK";
    }
}

/**
 * 正面方向枚举
 *
 * * CW 顺时钟方向
 * * CCW 逆时钟方向
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
export type IGLFrontFace = "CW" | "CCW";

/**
 * 剔除面，默认 BACK，剔除背面。
 *
 * 默认情况下，逆时针的顶点连接顺序被定义为三角形的正面。
 * 使用gl.frontFace(gl.CW);调整顺时针为正面
 *
 * * FRONT 正面
 * * BACK 背面
 * * FRONT_AND_BACK 正面与背面
 *
 * @see http://www.jianshu.com/p/ee04165f2a02
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 */
export type IGLCullFace = "FRONT" | "BACK" | "FRONT_AND_BACK";