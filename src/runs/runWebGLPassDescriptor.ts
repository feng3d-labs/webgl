import { IRenderPassColorAttachment } from "../data/IRenderPassColorAttachment";
import { IRenderPassDepthStencilAttachment } from "../data/IRenderPassDepthStencilAttachment";
import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";
import { runFramebuffer } from "./runFramebuffer";

const defaultRenderPassColorAttachment: IRenderPassColorAttachment = { clearValue: [0, 0, 0, 0], loadOp: "clear" };
const defaultDepthStencilAttachment: IRenderPassDepthStencilAttachment = { depthClearValue: 1, depthLoadOp: "load", stencilClearValue: 0, stencilLoadOp: "load" };

export function runWebGLPassDescriptor(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    passDescriptor = passDescriptor || {};

    //
    const colorAttachment = Object.assign({}, defaultRenderPassColorAttachment, passDescriptor.colorAttachments?.[0]);

    //
    runFramebuffer(gl, passDescriptor);

    //
    const { clearValue, loadOp } = colorAttachment;
    gl.clearColor(clearValue[0], clearValue[1], clearValue[2], clearValue[3]);

    //
    const depthStencilAttachment = Object.assign({}, defaultDepthStencilAttachment, passDescriptor.depthStencilAttachment);
    const { depthClearValue, depthLoadOp, stencilClearValue, stencilLoadOp } = depthStencilAttachment;
    gl.clearDepth(depthClearValue);
    gl.clearStencil(stencilClearValue);

    //
    gl.clear((loadOp === "clear" ? gl.COLOR_BUFFER_BIT : 0)
        | (depthLoadOp === "clear" ? gl.DEPTH_BUFFER_BIT : 0)
        | (stencilLoadOp === "clear" ? gl.STENCIL_BUFFER_BIT : 0)
    );
}
