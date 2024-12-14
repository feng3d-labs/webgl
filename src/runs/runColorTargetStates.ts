import { getBlendConstantColor, IBlendComponent, IBlendFactor, IBlendOperation, IColorTargetState } from "@feng3d/render-api";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly IColorTargetState[])
{
    //
    const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    //
    let blend = targets?.[0]?.blend;
    if (blend)
    {
        const color: IBlendComponent = blend.color;
        const alpha: IBlendComponent = blend.alpha;

        const colorOperation: IGLBlendEquation = getIGLBlendEquation(color?.operation) || "FUNC_ADD";
        const colorSrcFactor: IGLBlendFactor = getIGLBlendFactor(color?.srcFactor) || "SRC_ALPHA";
        const colorDstFactor: IGLBlendFactor = getIGLBlendFactor(color?.dstFactor) || "ONE_MINUS_SRC_ALPHA";
        //
        const alphaOperation: IGLBlendEquation = getIGLBlendEquation(alpha?.operation) || colorOperation;
        const alphaSrcFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.srcFactor) || colorSrcFactor;
        const alphaDstFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.dstFactor) || colorDstFactor;

        // 当混合系数用到了混合常量值时设置混合常量值。
        const constantColor = getBlendConstantColor(blend);
        if (constantColor)
        {
            const constantColor = blend.constantColor ?? [0, 0, 0, 0];
            gl.blendColor(constantColor[0], constantColor[1], constantColor[2], constantColor[3]);
        }

        //
        gl.enable(gl.BLEND);
        gl.blendEquationSeparate(gl[colorOperation], gl[alphaOperation]);
        gl.blendFuncSeparate(gl[colorSrcFactor], gl[colorDstFactor], gl[alphaSrcFactor], gl[alphaDstFactor]);
    }
    else
    {
        gl.disable(gl.BLEND);
    }
}

function getIGLBlendEquation(operation?: IBlendOperation)
{
    if (!operation) return undefined;

    const glBlendEquation: IGLBlendEquation = operationMap[operation];

    console.assert(!!glBlendEquation, `接收到错误值，请从 ${Object.keys(operationMap).toString()} 中取值！`);

    return glBlendEquation;
}

const operationMap: { [key: string]: IGLBlendEquation } = {
    "add": "FUNC_ADD",
    "subtract": "FUNC_SUBTRACT",
    "reverse-subtract": "FUNC_REVERSE_SUBTRACT",
    "min": "MIN",
    "max": "MAX",
};

function getIGLBlendFactor(blendFactor?: IBlendFactor)
{
    if (!blendFactor) return undefined;

    const glBlendFactor: IGLBlendFactor = blendFactorMap[blendFactor];

    console.assert(!!glBlendFactor, `接收到错误值，请从 ${Object.keys(blendFactorMap).toString()} 中取值！`);

    return glBlendFactor;
}

const blendFactorMap: { [key: string]: IGLBlendFactor } = {
    "zero": "ZERO",
    "one": "ONE",
    "src": "SRC_COLOR",
    "one-minus-src": "ONE_MINUS_SRC_COLOR",
    "src-alpha": "SRC_ALPHA",
    "one-minus-src-alpha": "ONE_MINUS_SRC_ALPHA",
    "dst": "DST_COLOR",
    "one-minus-dst": "ONE_MINUS_DST_COLOR",
    "dst-alpha": "DST_ALPHA",
    "one-minus-dst-alpha": "ONE_MINUS_DST_ALPHA",
    "src-alpha-saturated": "SRC_ALPHA_SATURATE",
    "constant": "CONSTANT_COLOR",
    "one-minus-constant": "ONE_MINUS_CONSTANT_COLOR",
};

/**
 * 混合因子（R分量系数，G分量系数，B分量系数）
 *
 * 混合颜色的公式可以这样描述：color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor)。这里的 RGBA 值均在0与1之间。
 *
 * The formula for the blending color can be described like this: color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor). The RBGA values are between 0 and 1.
 *
 * * `ZERO` Factor: (0,0,0,0); 把所有颜色都乘以0。
 * * `ONE` Factor: (1,1,1,1); 把所有颜色都乘以1。
 * * `SRC_COLOR` Factor: (Rs, Gs, Bs, As); 将所有颜色乘以源颜色。
 * * `ONE_MINUS_SRC_COLOR` Factor: (1-Rs, 1-Gs, 1-Bs, 1-As); 将所有颜色乘以1减去每个源颜色。
 * * `DST_COLOR` Factor: (Rd, Gd, Bd, Ad); 将所有颜色乘以目标颜色。
 * * `ONE_MINUS_DST_COLOR` Factor: (1-Rd, 1-Gd, 1-Bd, 1-Ad); 将所有颜色乘以1减去每个目标颜色。
 * * `SRC_ALPHA` Factor: (As, As, As, As); 将所有颜色乘以源alpha值。
 * * `ONE_MINUS_SRC_ALPHA` Factor: (1-As, 1-As, 1-As, 1-As); 将所有颜色乘以1减去源alpha值。
 * * `DST_ALPHA` Factor: (Ad, Ad, Ad, Ad); 将所有颜色乘以目标alpha值。
 * * `ONE_MINUS_DST_ALPHA` Factor: (1-Ad, 1-Ad, 1-Ad, 1-Ad); 将所有颜色乘以1减去目标alpha值。
 * * `CONSTANT_COLOR` Factor: (Rc, Gc, Bc, Ac); 将所有颜色乘以一个常数颜色。
 * * `ONE_MINUS_CONSTANT_COLOR` Factor: (1-Rc, 1-Gc, 1-Bc, 1-Ac); 所有颜色乘以1减去一个常数颜色。
 * * `CONSTANT_ALPHA` Factor: (Ac, Ac, Ac, Ac); 将所有颜色乘以一个常量alpha值。
 * * `ONE_MINUS_CONSTANT_ALPHA` Factor: (1-Ac, 1-Ac, 1-Ac, 1-Ac); 将所有颜色乘以1减去一个常数alpha值。
 * * `SRC_ALPHA_SATURATE` Factor: (min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad), 1); 将RGB颜色乘以源alpha值与1减去目标alpha值的较小值。alpha值乘以1。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 */
export type IGLBlendFactor = "ZERO" | "ONE" | "SRC_COLOR" | "ONE_MINUS_SRC_COLOR" | "DST_COLOR" | "ONE_MINUS_DST_COLOR" | "SRC_ALPHA" | "ONE_MINUS_SRC_ALPHA" | "DST_ALPHA" | "ONE_MINUS_DST_ALPHA" | "SRC_ALPHA_SATURATE" | "CONSTANT_COLOR" | "ONE_MINUS_CONSTANT_COLOR" | "CONSTANT_ALPHA" | "ONE_MINUS_CONSTANT_ALPHA";

/**
 * 混合方法
 *
 * * FUNC_ADD 源 + 目标
 * * FUNC_SUBTRACT 源 - 目标
 * * FUNC_REVERSE_SUBTRACT 目标 - 源
 * * MIN 源与目标的最小值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MIN_EXT 值。
 * * MAX 源与目标的最大值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MAX_EXT 值。
 *
 * A GLenum specifying how source and destination colors are combined. Must be either:
 *
 * * gl.FUNC_ADD: source + destination (default value)
 * * gl.FUNC_SUBTRACT: source - destination
 * * gl.FUNC_REVERSE_SUBTRACT: destination - source
 *
 * When using the EXT_blend_minmax extension:
 *
 * * ext.MIN_EXT: Minimum of source and destination
 * * ext.MAX_EXT: Maximum of source and destination
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.MIN: Minimum of source and destination
 * * gl.MAX: Maximum of source and destination
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 */
export type IGLBlendEquation = "FUNC_ADD" | "FUNC_SUBTRACT" | "FUNC_REVERSE_SUBTRACT" | "MIN" | "MAX";
