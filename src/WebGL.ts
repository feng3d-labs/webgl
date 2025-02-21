import { Buffer, RenderPassDescriptor, RenderPipeline, Sampler, Submit, Texture } from "@feng3d/render-api";

import { RunWebGL } from "./RunWebGL";
import { deleteBuffer } from "./caches/getGLBuffer";
import { getGLCanvasContext } from "./caches/getGLCanvasContext";
import { deleteFramebuffer } from "./caches/getGLFramebuffer";
import { deleteProgram } from "./caches/getGLProgram";
import { deleteRenderbuffer } from "./caches/getGLRenderbuffer";
import { deleteSampler } from "./caches/getGLSampler";
import { deleteTexture } from "./caches/getGLTexture";
import { deleteTransformFeedback } from "./caches/getGLTransformFeedback";
import { IGLCanvasContext } from "./data/IGLCanvasContext";
import { IGLReadPixels } from "./data/IGLReadPixels";
import { IGLRenderbuffer } from "./data/IGLRenderbuffer";
import { IGLTransformFeedback } from "./data/IGLTransformFeedback";
import { readPixels } from "./utils/readPixels";

/**
 * WEBGL 对象。
 *
 * 所有渲染都由该渲染器执行。與2D、3D場景無關，屬於更加底層的API。針對每一個 RenderObject 渲染數據進行渲染。
 */
export class WebGL
{
    private _runWebGL: RunWebGL = new RunWebGL();
    private _renderingContext: IGLCanvasContext;
    private _gl: WebGLRenderingContext;

    constructor(renderingContext?: IGLCanvasContext)
    {
        this._renderingContext = renderingContext;
        this._gl = getGLCanvasContext(this._renderingContext);
    }

    /**
     * 提交 GPU 。
     *
     * @param submit 一次 GPU 提交内容。
     *
     */
    submit(submit: Submit)
    {
        this._runWebGL.runSubmit(this._gl, submit);
    }

    runReadPixels(glReadPixels: IGLReadPixels)
    {
        readPixels(this._gl, glReadPixels);
    }

    deleteFramebuffer(passDescriptor: RenderPassDescriptor)
    {
        deleteFramebuffer(this._gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: IGLRenderbuffer)
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

    deleteProgram(pipeline: RenderPipeline)
    {
        deleteProgram(this._gl, pipeline);
    }

    deleteTransformFeedback(transformFeedback: IGLTransformFeedback)
    {
        deleteTransformFeedback(this._gl, transformFeedback);
    }
}
