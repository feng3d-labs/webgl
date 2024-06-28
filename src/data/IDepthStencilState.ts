import { DepthFunc } from "./RenderParams";

export interface IDepthStencilState
{
    /**
     * 是否写入深度。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
     */
    depthWriteEnabled?: boolean;

    /**
     * 指定深度比较函数的枚举，该函数设置绘制像素的条件。
     *
     * 默认 LESS，如果传入值小于深度缓冲区值则通过。
     *
     * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
     *
     * @see DepthFunc
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthCompare?: DepthFunc;
}