import { IGLCullFace } from "../data/IGLCullFace";
import { IGLPrimitiveState } from "../data/IGLPrimitiveState";

export function runPrimitiveState(gl: WebGLRenderingContext, cullFace?: IGLCullFace)
{
    //
    const { enableCullFace: enableCullMode, cullMode, frontFace } = { ...defaultCullFace, ...cullFace };
    if (enableCullMode)
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[cullMode]);
        gl.frontFace(gl[frontFace]);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }
}

const defaultCullFace: IGLCullFace = { enableCullFace: false, cullMode: "BACK", frontFace: "CCW" };
export const defaultPrimitiveState: IGLPrimitiveState = { topology: "TRIANGLES", cullFace: defaultCullFace };

Object.freeze(defaultCullFace);
Object.freeze(defaultPrimitiveState);