import { getRenderPassColorAttachment } from "../caches/getRenderPassColorAttachment";
import { IRenderPassDepthStencilAttachment } from "../data/IRenderPassDepthStencilAttachment";
import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";
import { defaults } from "../defaults/defaults";
import { ClearMask } from "../gl/WebGLEnums";

const defaultDepthStencilAttachment: IRenderPassDepthStencilAttachment = { depthClearValue: 1 };

export function runWebGLPassDescriptor(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    passDescriptor = Object.assign({}, defaults.webGLPassDescriptor, passDescriptor);

    //
    const colorAttachment = getRenderPassColorAttachment(passDescriptor.colorAttachments?.[0]);
    const { clearValue, loadOp } = colorAttachment;
    gl.clearColor(clearValue[0], clearValue[1], clearValue[2], clearValue[3]);

    //
    const depthStencilAttachment = Object.assign({}, defaultDepthStencilAttachment, passDescriptor.depthStencilAttachment);
    const { depthClearValue } = depthStencilAttachment;
    gl.clearDepth(depthClearValue);

    //
    const { clearMask, depthTest, depthFunc } = passDescriptor;

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
    gl.clear(getClearMask(gl, clearMask) | (loadOp === "clear" ? gl.COLOR_BUFFER_BIT : 0));
}

function getClearMask(gl: WebGLRenderingContext, clearMask: ClearMask[])
{
    const result = clearMask.reduce((pv, cv) => pv | gl[cv], 0);

    return result;
}