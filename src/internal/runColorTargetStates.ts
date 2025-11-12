import { BlendComponent, BlendState, ColorTargetState } from "@feng3d/render-api";
import { getIGLBlendEquation, getIGLBlendFactor, IGLBlendEquation, IGLBlendFactor } from "../runs/runColorTargetStates";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly ColorTargetState[])
{
    //
    const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    //
    const blend = targets?.[0]?.blend;
    if (blend)
    {
        const color: BlendComponent = blend.color;
        const alpha: BlendComponent = blend.alpha;

        const colorOperation: IGLBlendEquation = getIGLBlendEquation(color?.operation) || "FUNC_ADD";
        const colorSrcFactor: IGLBlendFactor = getIGLBlendFactor(color?.srcFactor, color?.operation) || "SRC_ALPHA";
        const colorDstFactor: IGLBlendFactor = getIGLBlendFactor(color?.dstFactor, color?.operation) || "ONE_MINUS_SRC_ALPHA";
        //
        const alphaOperation: IGLBlendEquation = getIGLBlendEquation(alpha?.operation) || colorOperation;
        const alphaSrcFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.srcFactor, color?.operation) || colorSrcFactor;
        const alphaDstFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.dstFactor, color?.operation) || colorDstFactor;

        // 当混合系数用到了混合常量值时设置混合常量值。
        const constantColor = BlendState.getBlendConstantColor(blend);
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

