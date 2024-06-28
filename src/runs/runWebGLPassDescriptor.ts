import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";
import { defaults } from "../defaults/defaults";
import { ClearMask } from "../gl/WebGLEnums";

export function runWebGLPassDescriptor(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    passDescriptor = Object.assign({}, defaults.webGLPassDescriptor, passDescriptor);

    const clearColor = passDescriptor.colorAttachments[0].clearColor;

    const { clearDepth, clearMask, depthTest, depthFunc } = passDescriptor;

    // Set clear color to black, fully opaque
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clearDepth(clearDepth); // Clear everything
    if (depthTest)
    {
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
    }
    else
    {
        gl.disable(gl.DEPTH_TEST); // Enable depth testing
    }
    gl.depthFunc(gl[depthFunc]); // Near things obscure far things
    // Clear the color buffer with specified clear color
    gl.clear(getClearMask(gl, clearMask));
}

function getClearMask(gl: WebGLRenderingContext, clearMask: ClearMask[])
{
    const result = clearMask.reduce((pv, cv) => pv | gl[cv], 0);

    return result;
}