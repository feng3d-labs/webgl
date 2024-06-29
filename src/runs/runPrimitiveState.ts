import { IPrimitiveState } from "../data/IPrimitiveState";

const defaultPrimitiveState: IPrimitiveState = { topology: "TRIANGLES", cullMode: "BACK", frontFace: "CCW" };

export function runPrimitiveState(gl: WebGLRenderingContext, primitive?: IPrimitiveState)
{
    //
    const cullMode = primitive?.cullMode || defaultPrimitiveState.cullMode;
    const frontFace = primitive?.frontFace || defaultPrimitiveState.frontFace;
    if (cullMode === "NONE")
    {
        gl.disable(gl.CULL_FACE);
    }
    else
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[cullMode]);
        gl.frontFace(gl[frontFace]);
    }
}
