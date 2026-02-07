import { Buffer, CanvasContext, ReadPixels, RenderPassDescriptor, RenderPipeline, Sampler, renderState, Submit, Texture } from '@feng3d/render-api';

import { deleteBuffer } from './caches/getGLBuffer';
import { getGLCanvasContext } from './caches/getGLCanvasContext';
import { deleteFramebuffer } from './caches/getGLFramebuffer';
import { deleteProgram } from './caches/getGLProgram';
import { deleteRenderbuffer } from './caches/getGLRenderbuffer';
import { deleteSampler } from './caches/getGLSampler';
import { deleteTexture } from './caches/getGLTexture';
import { deleteTransformFeedback } from './caches/getGLTransformFeedback';
import { Renderbuffer } from './data/Renderbuffer';
import { TransformFeedback } from '@feng3d/render-api';
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

    constructor(canvasContext?: CanvasContext)
    {
        renderState.isRunWebGL = true;
        //
        this._renderingContext = canvasContext;
        this._gl = getGLCanvasContext(this._renderingContext) as any;
    }

    /**
     * 提交 GPU 。
     *
     * @param submit 一次 GPU 提交内容。
     *
     */
    submit(submit: Submit)
    {
        runSubmit(this._gl, submit);
    }

    readPixels(glReadPixels: ReadPixels)
    {
        const result = readPixels(this._gl, glReadPixels);

        // 设置纹理格式信息
        const textureView = glReadPixels.textureView;

        if (textureView)
        {
            const texture = textureView.texture;

            if ('context' in texture)
            {
                // CanvasTexture: 默认使用 rgba8unorm
                glReadPixels.format = 'rgba8unorm';
            }
            else if ('descriptor' in texture)
            {
                // Texture: 从描述符获取格式
                glReadPixels.format = texture.descriptor.format || 'rgba8unorm';
            }
        }
        else
        {
            // 如果没有指定纹理视图，默认使用 rgba8unorm
            glReadPixels.format = 'rgba8unorm';
        }

        glReadPixels.result = result;

        return result;
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
