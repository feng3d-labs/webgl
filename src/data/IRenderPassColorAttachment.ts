export interface IRenderPassColorAttachment
{
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