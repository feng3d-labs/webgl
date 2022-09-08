/**
 * 混合方法
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 */
export enum BlendEquation
{
    /**
     * 源 + 目标
     *
     *  source + destination
     */
    FUNC_ADD = 'FUNC_ADD',

    /**
     * 源 - 目标
     *
     * source - destination
     */
    FUNC_SUBTRACT = 'FUNC_SUBTRACT',

    /**
     * 目标 - 源
     *
     * destination - source
     */
    FUNC_REVERSE_SUBTRACT = 'FUNC_REVERSE_SUBTRACT',

    /**
     * 源与目标的最小值，在 WebGL 2 中可使用。
     *
     * 在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MIN_EXT 值。
     *
     * using a WebGL 2 context
     * Minimum of source and destination
     */
    MIN = 'MIN',

    /**
     * 源与目标的最大值，在 WebGL 2 中可使用。
     *
     * 在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MAX_EXT 值。
     *
     * using a WebGL 2 context
     * Maximum of source and destination.
     */
    MAX = 'MAX',
}
