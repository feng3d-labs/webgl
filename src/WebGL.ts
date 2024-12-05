import { RunWebGL } from "./RunWebGL";
import { deleteFramebuffer } from "./caches/getFramebuffer";
import { deleteProgram } from "./caches/getProgram";
import { deleteRenderbuffer } from "./caches/getRenderbuffer";
import { getRenderingContext } from "./caches/getRenderingContext";
import { deleteSampler } from "./caches/getSampler";
import { deleteTexture } from "./caches/getTexture";
import { deleteBuffer } from "./caches/getWebGLBuffer";
import { deleteTransformFeedback } from "./caches/getWebGLTransformFeedback";
import { IGLBuffer } from "./data/IGLBuffer";
import { IGLCanvasContext } from "./data/IGLCanvasContext";
import { IGLRenderPassDescriptor } from "./data/IGLPassDescriptor";
import { IGLReadPixels } from "./data/IGLReadPixels";
import { IGLRenderPipeline } from "./data/IGLRenderPipeline";
import { IGLRenderbuffer } from "./data/IGLRenderbuffer";
import { IGLSampler } from "./data/IGLSampler";
import { IGLSubmit } from "./data/IGLSubmit";
import { IGLTexture } from "./data/IGLTexture";
import { IGLTransformFeedback } from "./data/IGLTransformFeedback";
import { IGLVertexArrayObject } from "./data/IGLVertexArrayObject";
import { runReadPixels } from "./runs/runReadPixels";
import { deleteVertexArray } from "./runs/runVertexArray";

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
        this._gl = getRenderingContext(this._renderingContext);
    }

    /**
     * 提交 GPU 。
     *
     * @param submit 一次 GPU 提交内容。
     *
     */
    submit(submit: IGLSubmit)
    {
        this._runWebGL.runSubmit(this._gl, submit);
    }

    runReadPixels(readPixels: IGLReadPixels)
    {
        runReadPixels(this._gl, readPixels);
    }

    deleteFramebuffer(passDescriptor: IGLRenderPassDescriptor)
    {
        deleteFramebuffer(this._gl, passDescriptor);
    }

    deleteRenderbuffer(renderbuffer: IGLRenderbuffer)
    {
        deleteRenderbuffer(this._gl, renderbuffer);
    }

    deleteBuffer(buffer: IGLBuffer)
    {
        deleteBuffer(this._gl, buffer);
    }

    deleteTexture(texture: IGLTexture)
    {
        deleteTexture(this._gl, texture);
    }

    deleteSampler(sampler: IGLSampler)
    {
        deleteSampler(this._gl, sampler);
    }

    deleteProgram(pipeline: IGLRenderPipeline)
    {
        deleteProgram(this._gl, pipeline);
    }

    deleteVertexArray(vertexArray: IGLVertexArrayObject)
    {
        deleteVertexArray(this._gl, vertexArray);
    }

    deleteTransformFeedback(transformFeedback: IGLTransformFeedback)
    {
        deleteTransformFeedback(this._gl, transformFeedback);
    }
}
