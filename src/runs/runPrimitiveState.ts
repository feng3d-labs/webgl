import { ICullFace } from "../data/ICullFace";
import { IPrimitiveState } from "../data/IPrimitiveState";

export function runPrimitiveState(gl: WebGLRenderingContext, cullFace?: ICullFace)
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

const defaultCullFace: ICullFace = { enableCullFace: false, cullMode: "BACK", frontFace: "CCW" };
export const defaultPrimitiveState: IPrimitiveState = { topology: "TRIANGLES", cullFace: defaultCullFace };

Object.freeze(defaultCullFace);
Object.freeze(defaultPrimitiveState);