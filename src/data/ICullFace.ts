/**
 * 面剔除。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 */
export interface ICullFace
{
    /**
     * 是否开启面剔除。
     *
     * 默认为 false。
     */
    enableCullFace?: boolean;

    /**
     * 剔除面，默认 BACK，剔除背面。
     *
     * 默认情况下，逆时针的顶点连接顺序被定义为三角形的正面。
     * 使用gl.frontFace(gl.CW);调整顺时针为正面
     *
     * * NONE 关闭裁剪面
     * * FRONT 正面
     * * BACK 背面
     * * FRONT_AND_BACK 正面与背面
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
     */
    cullMode?: CullFace;

    /**
     * 正向方向，默认 CCW。三角形逆时针方向为正面。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
     */
    frontFace?: FrontFace;
}

/**
 * 正面方向枚举
 *
 * * CW 顺时钟方向
 * * CCW 逆时钟方向
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
export type FrontFace = "CW" | "CCW";

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
export type CullFace = "FRONT" | "BACK" | "FRONT_AND_BACK";