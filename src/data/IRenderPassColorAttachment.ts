import { IRenderbuffer } from "./IRenderbuffer";
import { ITexture } from "./ITexture";

export interface IRenderPassColorAttachment
{
    /**
     * 颜色附件视图。
     *
     * 如果没有设置，默认为画布；否则使用 帧缓冲 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
     */
    view?: IRenderbuffer | ITexture;

    /**
     * 清除后填充值。
     *
     * 默认为 [0,0,0,0]。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clearColor
     */
    clearValue?: [red: number, green: number, blue: number, alpha: number];

    /**
     * 是否清除颜色附件。
     *
     * 默认 `"clear"` 。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    loadOp?: "load" | "clear";
}