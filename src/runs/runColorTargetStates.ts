import { IBlendComponent, IBlendState } from "../data/IBlendState";
import { IColorTargetState } from "../data/IColorTargetState";

export function runColorTargetStates(gl: WebGLRenderingContext, targets?: IColorTargetState[])
{
    //
    const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
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

const defaultBlendComponent: IBlendComponent = { operation: "FUNC_ADD", srcFactor: "SRC_ALPHA", dstFactor: "ONE_MINUS_SRC_ALPHA" };
const defaultBlendState: IBlendState = { color: defaultBlendComponent, alpha: defaultBlendComponent };
