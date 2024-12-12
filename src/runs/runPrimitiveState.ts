import { ICullFace, IFrontFace, IPrimitiveState } from "@feng3d/render-api";
import { getIGLCullFace, IGLCullFace } from "../utils/getIGLCullFace";
import { getIGLFrontFace, IGLFrontFace } from "../utils/getIGLFrontFace";

export function runPrimitiveState(gl: WebGLRenderingContext, primitive?: IPrimitiveState)
{
    const cullFace: ICullFace = primitive?.cullFace || "none";
    const frontFace: IFrontFace = primitive?.frontFace || "ccw";

    const enableCullFace = cullFace !== "none";
    const glCullMode: IGLCullFace = getIGLCullFace(cullFace);
    const glFrontFace: IGLFrontFace = getIGLFrontFace(frontFace);

    if (enableCullFace)
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[glCullMode]);
        gl.frontFace(gl[glFrontFace]);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }
}
