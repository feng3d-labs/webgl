import { Viewport } from '@feng3d/render-api';

export function runViewPort(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, viewport: Viewport)
{
    if (viewport)
    {
        const isYup = viewport.isYup ?? true;
        const x = viewport.x ?? 0;
        let y = viewport.y ?? 0;
        const width = viewport.width ?? attachmentSize.width;
        const height = viewport.height ?? attachmentSize.height;

        if (!isYup)
        {
            y = attachmentSize.height - y - height;
        }

        gl.viewport(x, y, width, height);
    }
    else
    {
        gl.viewport(0, 0, attachmentSize.width, attachmentSize.height);
    }
}

