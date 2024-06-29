import { IScissor } from "../data/IScissor";

export function runScissor(gl: WebGLRenderingContext, scissor?: IScissor)
{
    if (scissor)
    {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissor.x, scissor.y, scissor.width, scissor.height);
    }
    else
    {
        gl.disable(gl.SCISSOR_TEST);
    }
}