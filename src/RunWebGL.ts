import { IGLCommandEncoder } from "./data/IGLCommandEncoder";
import { IGLRenderPassDescriptor } from "./data/IGLPassDescriptor";
import { IGLRenderPass } from "./data/IGLRenderPass";
import { IGLRenderPassColorAttachment } from "./data/IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment } from "./data/IGLRenderPassDepthStencilAttachment";
import { IGLSubmit } from "./data/IGLSubmit";
import { runBlitFramebuffer } from "./runs/runBlitFramebuffer";
import { runFramebuffer } from "./runs/runFramebuffer";
import { runQueryAction } from "./runs/runQueryAction";
import { runRenderObject } from "./runs/runRenderObject";
import { runScissor } from "./runs/runScissor";
import { runViewPort } from "./runs/runViewPort";

export class RunWebGL
{
    runSubmit(gl: WebGLRenderingContext, submit: IGLSubmit)
    {
        const commandBuffers = submit.commandEncoders.map((v) =>
        {
            const commandBuffer = this.runCommandEncoder(gl, v);

            return commandBuffer;
        });
    }

    protected runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: IGLCommandEncoder)
    {
        commandEncoder.passEncoders.forEach((passEncoder) =>
        {
            if (!passEncoder.__type)
            {
                this.runRenderPass(gl, passEncoder as IGLRenderPass);
            }
            else if (passEncoder.__type === "IGLRenderPass")
            {
                this.runRenderPass(gl, passEncoder);
            }
            else if (passEncoder.__type === "IGLBlitFramebuffer")
            {
                runBlitFramebuffer(gl, passEncoder);
            }
            else
            {
                console.error(`未处理 passEncoder ${passEncoder}`);
            }
        });
    }

    protected runRenderPass(gl: WebGLRenderingContext, renderPass: IGLRenderPass)
    {
        this.runPassDescriptor(gl, renderPass.descriptor);

        renderPass.renderObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type === "IGLQueryAction")
            {
                runQueryAction(gl, renderObject);
            }
            else if (renderObject.__type === "IGLViewport")
            {
                runViewPort(gl, renderObject)
            }
            else if (renderObject.__type === "IGLScissor")
            {
                runScissor(gl, renderObject);
            }
            else
            {
                runRenderObject(gl, renderObject);
            }
        });
    }

    private runPassDescriptor(gl: WebGLRenderingContext, passDescriptor: IGLRenderPassDescriptor)
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


}

export const defaultRenderPassColorAttachment: IGLRenderPassColorAttachment = { clearValue: [0, 0, 0, 0], loadOp: "clear" };
export const defaultDepthStencilAttachment: IGLRenderPassDepthStencilAttachment = { depthClearValue: 1, depthLoadOp: "load", stencilClearValue: 0, stencilLoadOp: "load" };
