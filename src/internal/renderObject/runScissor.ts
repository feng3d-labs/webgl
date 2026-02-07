import { ScissorRect } from '@feng3d/render-api';

export function runScissor(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, scissor: ScissorRect)
{
    if (scissor)
    {
        const isYup = scissor.isYup ?? true;
        const x = scissor.x ?? 0;
        let y = scissor.y ?? 0;
        const width = scissor.width ?? attachmentSize.width;
        const height = scissor.height ?? attachmentSize.height;

        if (!isYup)
        {
            y = attachmentSize.height - y - height;
        }

        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(x, y, width, height);
    }
    else
    {
        gl.disable(gl.SCISSOR_TEST);
    }
}

