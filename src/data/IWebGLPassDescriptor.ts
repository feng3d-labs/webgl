import { ClearMask } from "../gl/WebGLEnums";
import { IRenderPassColorAttachment } from "./IRenderPassColorAttachment";
import { IRenderPassDepthStencilAttachment } from "./IRenderPassDepthStencilAttachment";
import { DepthFunc } from "./RenderParams";

/**
 * WebGL渲染通道描述
 */
export interface IWebGLPassDescriptor
{
    /**
     * 颜色附件
     */
    colorAttachments?: IRenderPassColorAttachment[];

    /**
     * 深度模板附件。
     */
    depthStencilAttachment?: IRenderPassDepthStencilAttachment;

    /**
     * 清除内容。（颜色、深度、模板）
     *
     * 默认为 ["COLOR_BUFFER_BIT", "DEPTH_BUFFER_BIT", "STENCIL_BUFFER_BIT"]。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    clearMask?: ClearMask[];

    /**
     * 是否开启深度检查。
     *
     * 默认为 true。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthTest?: boolean;

    /**
     * 指定深度比较函数的枚举，该函数设置绘制像素的条件。
     *
     * 默认为 LESS。
     *
     * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
     *
     * @see DepthFunc
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthFunc?: DepthFunc;
}