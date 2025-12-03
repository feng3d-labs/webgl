import { RenderPassDescriptor } from '@feng3d/render-api';
import { getGLFramebuffer } from '../caches/getGLFramebuffer';

export function runRenderPassDescriptor(gl: WebGLRenderingContext, passDescriptor: RenderPassDescriptor)
{
    passDescriptor = passDescriptor || {};

    //
    const framebuffer = getGLFramebuffer(gl, passDescriptor);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    //
    const colorAttachment = passDescriptor.colorAttachments?.[0];
    //
    const clearValue = colorAttachment?.clearValue ?? [0, 0, 0, 0];
    const loadOp = colorAttachment?.loadOp ?? 'clear';
    gl.clearColor(clearValue[0], clearValue[1], clearValue[2], clearValue[3]);

    //
    const depthStencilAttachment = passDescriptor.depthStencilAttachment;
    if (depthStencilAttachment)
    {
        const depthClearValue = depthStencilAttachment.depthClearValue ?? 1;
        const depthLoadOp = depthStencilAttachment.depthLoadOp ?? 'clear'; // 默认清除深度缓冲区
        const stencilClearValue = depthStencilAttachment.stencilClearValue ?? 0;
        const stencilLoadOp = depthStencilAttachment.stencilLoadOp ?? 'load';

        //
        gl.clearDepth(depthClearValue);
        gl.clearStencil(stencilClearValue);

        //
        gl.clear((loadOp === 'clear' ? gl.COLOR_BUFFER_BIT : 0)
            | (depthLoadOp === 'clear' ? gl.DEPTH_BUFFER_BIT : 0)
            | (stencilLoadOp === 'clear' ? gl.STENCIL_BUFFER_BIT : 0),
        );
    }
    else
    {
        //
        gl.clear((loadOp === 'clear' ? gl.COLOR_BUFFER_BIT : 0));
    }
}

