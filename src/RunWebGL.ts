import { getFramebuffer } from "./caches/getFramebuffer";
import { getGLRenderOcclusionQuery } from "./caches/getGLRenderOcclusionQuery";
import { getIGLBlitFramebuffer } from "./caches/getIGLBlitFramebuffer";
import { getIGLRenderPassDescriptorWithMultisample } from "./caches/getIGLRenderPassDescriptorWithMultisample";
import { getWebGLBuffer } from "./caches/getWebGLBuffer";
import { _GL_Submit_Times } from "./const/const";
import { IGLBlitFramebuffer } from "./data/IGLBlitFramebuffer";
import { IGLCommandEncoder } from "./data/IGLCommandEncoder";
import { IGLCopyBufferToBuffer } from "./data/IGLCopyBufferToBuffer";
import { IGLCopyTextureToTexture } from "./data/IGLCopyTextureToTexture";
import { IGLRenderPassDescriptor } from "./data/IGLRenderPassDescriptor";
import { IGLRenderPass, IGLRenderPassObject } from "./data/IGLRenderPass";
import { IGLRenderPassColorAttachment } from "./data/IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment } from "./data/IGLRenderPassDepthStencilAttachment";
import { IGLSubmit } from "./data/IGLSubmit";
import { IGLTextureView } from "./data/IGLTexture";
import { runFramebuffer } from "./runs/runFramebuffer";
import { runOcclusionQuery } from "./runs/runOcclusionQuery";
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

        // 派发提交WebGPU事件
        gl[_GL_Submit_Times] = ~~gl[_GL_Submit_Times] + 1;
    }

    protected runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: IGLCommandEncoder)
    {
        commandEncoder.passEncoders.forEach((passEncoder) =>
        {
            if (!passEncoder.__type)
            {
                this.runRenderPass(gl, passEncoder as IGLRenderPass);
            }
            else if (passEncoder.__type === "RenderPass")
            {
                this.runRenderPass(gl, passEncoder);
            }
            else if (passEncoder.__type === "BlitFramebuffer")
            {
                this.runBlitFramebuffer(gl, passEncoder);
            }
            else if (passEncoder.__type === "CopyTextureToTexture")
            {
                this.runCopyTextureToTexture(gl, passEncoder);
            }
            else if (passEncoder.__type === "CopyBufferToBuffer")
            {
                this.runCopyBuffer(gl, passEncoder);
            }
            else
            {
                console.error(`未处理 passEncoder ${passEncoder}`);
            }
        });
    }

    protected runRenderPass(gl: WebGLRenderingContext, renderPass: IGLRenderPass)
    {
        // 处理不被遮挡查询
        const occlusionQuery = getGLRenderOcclusionQuery(gl, renderPass.renderObjects);
        //
        occlusionQuery.init();

        if (renderPass.descriptor?.sampleCount && (renderPass.descriptor.colorAttachments[0].view as IGLTextureView).texture)
        {
            const { passDescriptor, blitFramebuffer } = getIGLRenderPassDescriptorWithMultisample(renderPass.descriptor);

            this.runPassDescriptor(gl, passDescriptor);

            this.runRenderObjects(gl, renderPass.renderObjects);

            this.runBlitFramebuffer(gl, blitFramebuffer);
        }
        else
        {
            this.runPassDescriptor(gl, renderPass.descriptor);

            this.runRenderObjects(gl, renderPass.renderObjects);
        }

        occlusionQuery.resolve(renderPass);
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

    private runRenderObjects(gl: WebGLRenderingContext, renderObjects?: IGLRenderPassObject[])
    {
        renderObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type === "Viewport")
            {
                runViewPort(gl, renderObject)
            }
            else if (renderObject.__type === "ScissorRect")
            {
                runScissor(gl, renderObject);
            }
            else if (renderObject.__type === "OcclusionQuery")
            {
                runOcclusionQuery(gl, renderObject);
            }
            else
            {
                runRenderObject(gl, renderObject);
            }
        });
    }

    private runCopyTextureToTexture(gl: WebGLRenderingContext, copyTextureToTexture: IGLCopyTextureToTexture)
    {
        const blitFramebuffer = getIGLBlitFramebuffer(copyTextureToTexture);
        this.runBlitFramebuffer(gl, blitFramebuffer);
    }

    private runBlitFramebuffer(gl: WebGLRenderingContext, blitFramebuffer: IGLBlitFramebuffer)
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


    private runCopyBuffer(gl: WebGLRenderingContext, copyBuffer: IGLCopyBufferToBuffer)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            const { source: read, destination: write, sourceOffset: readOffset, destinationOffset: writeOffset, size } = copyBuffer;

            const rb = getWebGLBuffer(gl, read);
            const wb = getWebGLBuffer(gl, write);

            gl.bindBuffer(gl.COPY_READ_BUFFER, rb);
            gl.bindBuffer(gl.COPY_WRITE_BUFFER, wb);
            gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, readOffset, writeOffset, size);
        }
        else
        {
            console.error(`WebGL1 不支持拷贝缓冲区功能！`);
        }
    }
}

export const defaultRenderPassColorAttachment: IGLRenderPassColorAttachment = { clearValue: [0, 0, 0, 0], loadOp: "clear" };
export const defaultDepthStencilAttachment: IGLRenderPassDepthStencilAttachment = { depthClearValue: 1, depthLoadOp: "load", stencilClearValue: 0, stencilLoadOp: "load" };
