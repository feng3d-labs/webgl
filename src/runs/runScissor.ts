import { IGLScissor } from "../data/IGLScissor";

export function runScissor(gl: WebGLRenderingContext, scissor?: IGLScissor)
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