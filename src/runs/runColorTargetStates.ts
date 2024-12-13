import { IColorTargetState } from "@feng3d/render-api";
import { IGLBlendEquation, IGLBlendFactor } from "../data/IGLRenderPipeline";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly IColorTargetState[])
{
    //
    const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    //
    let blend = targets?.[0]?.blend;
    if (blend)
    {
        const colorOperation: IGLBlendEquation = blend?.color?.operation || "FUNC_ADD";
        const colorSrcFactor: IGLBlendFactor = blend?.color?.srcFactor || "SRC_ALPHA";
        const colorDstFactor: IGLBlendFactor = blend?.color?.dstFactor || "ONE_MINUS_SRC_ALPHA";
        //
        const alphaOperation: IGLBlendEquation = blend?.alpha?.operation || colorOperation || "FUNC_ADD";
        const alphaSrcFactor: IGLBlendFactor = blend?.alpha?.srcFactor || colorSrcFactor || "SRC_ALPHA";
        const alphaDstFactor: IGLBlendFactor = blend?.alpha?.dstFactor || colorDstFactor || "ONE_MINUS_SRC_ALPHA";

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
