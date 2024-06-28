import { IBlendComponent } from "./IBlendComponent";

export interface IBlendState
{
    /**
     * 为颜色通道定义相应渲染目标的混合行为。
     */
    color: IBlendComponent;

    /**
     * 为alpha通道定义相应渲染目标的混合行为。
     */
    alpha: IBlendComponent;
}