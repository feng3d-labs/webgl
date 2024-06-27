import { IWebGLCanvasContext } from "../data/IWebGLCanvasContext";

export function getContext(canvasContext: IWebGLCanvasContext)
{
    const canvas = document.getElementById(canvasContext.canvasId) as HTMLCanvasElement;
    let gl = canvasContextMap.get(canvasContext);
    if (!gl)
    {
        // Initialize the GL context
        gl = canvas.getContext(canvasContext.contextId, canvasContext) as any;

        canvasContextMap.set(canvasContext, gl);
    }

    return gl;
}

const canvasContextMap = new Map<IWebGLCanvasContext, WebGLRenderingContext>();
