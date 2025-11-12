import { CanvasContext } from '@feng3d/render-api';

declare module '@feng3d/render-api'
{
    /**
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
     */
    export interface CanvasContext
    {
        /**
         * WebGL上下文类型
         */
        webGLcontextId?: 'webgl' | 'webgl2';

        /**
         * WebGL上下文属性。
         */
        webGLContextAttributes?: WebGLContextAttributes;
    }
}

/**
 * 默认画布(WebGL)上下文信息。
 */
export const defaultWebGLContextAttributes: WebGLContextAttributes = {
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
};
