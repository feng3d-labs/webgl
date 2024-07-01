import { getFramebuffer } from "../caches/getFramebuffer";
import { IBlitFramebuffer } from "../data/IBlitFramebuffer";

export function runBlitFramebuffer(gl: WebGLRenderingContext, blitFramebuffer: IBlitFramebuffer)
{
    const { read, draw, blitFramebuffers } = blitFramebuffer;

    const readFramebuffer = getFramebuffer(gl, read);
    const drawFramebuffer = getFramebuffer(gl, draw);

    if (gl instanceof WebGL2RenderingContext)
    {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readFramebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawFramebuffer);

        draw.colorAttachments.forEach((item, i) =>
        {
            const clearValue = draw.colorAttachments[i]?.clearValue;
            if (clearValue)
            {
                gl.clearBufferfv(gl.COLOR, i, clearValue);
            }
        });

        blitFramebuffers.forEach((item) =>
        {
            const [srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter] = item;

            gl.blitFramebuffer(srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, gl[mask], gl[filter]);
        });
    }
}
