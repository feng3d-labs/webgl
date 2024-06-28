export interface IRenderPassColorAttachment
{
    /**
     * 清除后填充颜色。
     *
     * 默认为 [0,0,0,0]。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clearColor
     */
    clearValue?: [red: number, green: number, blue: number, alpha: number];
}