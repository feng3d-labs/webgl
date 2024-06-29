import { IRenderObject } from "../data/IRenderObject";

export function runViewPort(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const viewport = renderAtomic.viewport;
    if (viewport)
    {
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }
    else
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}