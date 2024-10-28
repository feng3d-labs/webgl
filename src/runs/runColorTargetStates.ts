import { IGLBlendComponent, IGLBlendState } from "../data/IGLBlendState";
import { IGLColorTargetState, IGLWriteMask } from "../data/IGLColorTargetState";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: IGLColorTargetState[])
{
    //
    const colorMask = targets?.[0]?.writeMask || defaultWriteMask;
    gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

    //
    let blend = targets?.[0]?.blend;
    if (blend)
    {
        blend = {
            color: { ...defaultBlendState.color, ...blend?.color },
            alpha: { ...defaultBlendState.alpha, ...blend?.color, ...blend?.alpha },
        };
        //
        gl.enable(gl.BLEND);
        gl.blendEquationSeparate(gl[blend.color.operation], gl[blend.alpha.operation]);
        gl.blendFuncSeparate(gl[blend.color.srcFactor], gl[blend.color.dstFactor], gl[blend.alpha.srcFactor], gl[blend.alpha.dstFactor]);
    }
    else
    {
        gl.disable(gl.BLEND);
    }
}

const defaultWriteMask: IGLWriteMask = Object.freeze([true, true, true, true]) as any;
const defaultBlendComponent: IGLBlendComponent = Object.freeze({ operation: "FUNC_ADD", srcFactor: "SRC_ALPHA", dstFactor: "ONE_MINUS_SRC_ALPHA" });
const defaultBlendState: IGLBlendState = Object.freeze({ color: defaultBlendComponent, alpha: defaultBlendComponent });
const defaultColorTargetState: IGLColorTargetState = Object.freeze({ writeMask: defaultWriteMask, blend: defaultBlendState });
export const defaultColorTargetStates: IGLColorTargetState[] = Object.freeze([defaultColorTargetState]) as any;