import { IBlendComponent, IBlendState, IColorTargetState } from "@feng3d/render-api";
import { IGLWriteMask } from "../data/IGLRenderPipeline";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly IColorTargetState[])
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
const defaultBlendComponent: IBlendComponent = Object.freeze({ operation: "FUNC_ADD", srcFactor: "SRC_ALPHA", dstFactor: "ONE_MINUS_SRC_ALPHA" });
export const defaultBlendState: IBlendState = Object.freeze({ color: defaultBlendComponent, alpha: defaultBlendComponent });
const defaultColorTargetState: IColorTargetState = Object.freeze({ writeMask: defaultWriteMask, blend: defaultBlendState });
export const defaultColorTargetStates: IColorTargetState[] = Object.freeze([defaultColorTargetState]) as any;