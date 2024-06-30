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
     * [red: boolean, green: boolean, blue: boolean, alpha: boolean]
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
     */
    writeMask?: IWriteMask;
}

export type IWriteMask = [red: boolean, green: boolean, blue: boolean, alpha: boolean];