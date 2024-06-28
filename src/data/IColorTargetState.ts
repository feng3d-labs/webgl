import { IBlendState } from "./IBlendState";

export interface IColorTargetState
{
    /**
     * 混合状态。
     */
    blend?: IBlendState;

    /**
     * 控制那些颜色分量是否可以被写入到帧缓冲器。
     *
     * [red, green, blue, alpha]
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
     */
    writeMask?: [boolean, boolean, boolean, boolean];
}