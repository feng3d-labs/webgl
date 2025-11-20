import { Buffer, CanvasContext, CanvasRenderPassDescriptor, ReadPixels, RenderPassColorAttachment, RenderPassDepthStencilAttachment, RenderPassDescriptor, RenderPipeline, Sampler, Submit, Texture, unreadonly } from '@feng3d/render-api';

import { Computed, computed, reactive } from '@feng3d/reactivity';
import { deleteBuffer } from './caches/getGLBuffer';
import { getGLCanvasContext } from './caches/getGLCanvasContext';
import { deleteFramebuffer } from './caches/getGLFramebuffer';
import { deleteProgram } from './caches/getGLProgram';
import { deleteRenderbuffer } from './caches/getGLRenderbuffer';
import { deleteSampler } from './caches/getGLSampler';
import { deleteTexture } from './caches/getGLTexture';
import { deleteTransformFeedback } from './caches/getGLTransformFeedback';
import { Renderbuffer } from './data/Renderbuffer';
import { TransformFeedback } from './data/TransformFeedbackPass';
import { runSubmit } from './internal/runSubmit';
import { readPixels } from './utils/readPixels';

/**
 * WEBGL 对象。
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderObject 渲染數據進行渲染。
 */
export class WebGL
{
    private _renderingContext: CanvasContext;
    private _gl: WebGLRenderingContext;

    private _renderPassDescriptorComputed: Computed<RenderPassDescriptor>;

    constructor(canvasContext?: CanvasContext, canvasRenderPassDescriptor?: CanvasRenderPassDescriptor)
    {
        this._renderingContext = canvasContext;
        this._gl = getGLCanvasContext(this._renderingContext) as any;

        this._initRenderPassDescriptorComputed(canvasContext, canvasRenderPassDescriptor);
    }

    private _initRenderPassDescriptorComputed(canvasContext?: CanvasContext, canvasRenderPassDescriptor?: CanvasRenderPassDescriptor)
    {
        if (canvasContext)
        {
            const colorAttachment: RenderPassColorAttachment = {};
            const depthStencilAttachment: RenderPassDepthStencilAttachment = {};
            //
            const descriptor: RenderPassDescriptor = {
                colorAttachments: [colorAttachment],
            };

            this._renderPassDescriptorComputed = computed(() =>
            {
                if (!canvasRenderPassDescriptor) return descriptor;

                const r_canvasRenderPassDescriptor = reactive(canvasRenderPassDescriptor);
                //
                r_canvasRenderPassDescriptor.clearColorValue;
                reactive(descriptor.colorAttachments[0]).clearValue = canvasRenderPassDescriptor.clearColorValue;

                r_canvasRenderPassDescriptor.loadColorOp;
                reactive(descriptor.colorAttachments[0]).loadOp = canvasRenderPassDescriptor.loadColorOp;

                let hasDepthStencilAttachment = false;
                if (r_canvasRenderPassDescriptor.depthClearValue !== undefined)
                {
                    hasDepthStencilAttachment = true;
                    reactive(depthStencilAttachment).depthClearValue = r_canvasRenderPassDescriptor.depthClearValue;
                }
                else
                {
                    delete unreadonly(depthStencilAttachment).depthClearValue;
                }
                if (r_canvasRenderPassDescriptor.depthLoadOp !== undefined)
                {
                    hasDepthStencilAttachment = true;
                    reactive(depthStencilAttachment).depthLoadOp = r_canvasRenderPassDescriptor.depthLoadOp;
                }
                else
                {
                    delete unreadonly(depthStencilAttachment).depthLoadOp;
                }
                if (r_canvasRenderPassDescriptor.stencilClearValue !== undefined)
                {
                    hasDepthStencilAttachment = true;
                    reactive(depthStencilAttachment).stencilClearValue = r_canvasRenderPassDescriptor.stencilClearValue;
                }
                else
                {
                    delete unreadonly(depthStencilAttachment).stencilClearValue;
                }
                if (r_canvasRenderPassDescriptor.stencilLoadOp !== undefined)
                {
                    hasDepthStencilAttachment = true;
                    reactive(depthStencilAttachment).stencilLoadOp = r_canvasRenderPassDescriptor.stencilLoadOp;
                }
                else
                {
                    delete unreadonly(depthStencilAttachment).stencilLoadOp;
                }
                if (hasDepthStencilAttachment)
                {
                    reactive(descriptor).depthStencilAttachment = depthStencilAttachment;
                }
                else
                {
                    delete unreadonly(descriptor).depthStencilAttachment;
                }

                if (r_canvasRenderPassDescriptor.sampleCount !== undefined)
                {
                    reactive(descriptor).sampleCount = r_canvasRenderPassDescriptor.sampleCount;
                }
                else
                {
                    delete unreadonly(descriptor).sampleCount;
                }

                return descriptor;
            });
        }
    }

    /**
     * 提交 GPU 。
     *
     * @param submit 一次 GPU 提交内容。
     *
     */
    submit(submit: Submit)
    {
        runSubmit(this._gl, submit, this._renderPassDescriptorComputed?.value);
    }

    readPixels(glReadPixels: ReadPixels)
    {
        glReadPixels.result = readPixels(this._gl, glReadPixels);

        return glReadPixels.result;
    }

    deleteFramebuffer(passDescriptor: RenderPassDescriptor)
    {
        deleteFramebuffer(this._gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: Renderbuffer)
    {
        deleteRenderbuffer(this._gl, renderbuffer);
    }

    deleteBuffer(buffer: Buffer)
    {
        deleteBuffer(this._gl, buffer);
    }

    deleteTexture(texture: Texture)
    {
        deleteTexture(this._gl, texture);
    }

    deleteSampler(sampler: Sampler)
    {
        deleteSampler(this._gl, sampler);
    }

    deleteProgram(material: RenderPipeline)
    {
        deleteProgram(this._gl, material);
    }

    deleteTransformFeedback(transformFeedback: TransformFeedback)
    {
        deleteTransformFeedback(this._gl, transformFeedback);
    }
}
