import { getBlendConstantColor, IBlendComponent, IColorTargetState, ICommandEncoder, ICullFace, IDepthStencilState, IDrawIndexed, IDrawVertex, IFrontFace, IIndicesDataTypes, IPrimitiveState, IRenderObject, IRenderPass, IRenderPassColorAttachment, IRenderPassDepthStencilAttachment, IRenderPassDescriptor, IRenderPassObject, IRenderPipeline, IScissorRect, ISubmit, ITextureView, IVertexAttribute, IVertexAttributes, IViewport } from "@feng3d/render-api";

import { getFramebuffer } from "./caches/getFramebuffer";
import { getGLBuffer } from "./caches/getGLBuffer";
import { getGLProgram } from "./caches/getGLProgram";
import { getGLRenderOcclusionQuery } from "./caches/getGLRenderOcclusionQuery";
import { getGLSampler } from "./caches/getGLSampler";
import { getGLTransformFeedback } from "./caches/getGLTransformFeedback";
import { getIGLBlitFramebuffer } from "./caches/getIGLBlitFramebuffer";
import { getIGLDrawMode, IGLDrawMode } from "./caches/getIGLDrawMode";
import { getIGLRenderPassDescriptorWithMultisample } from "./caches/getIGLRenderPassDescriptorWithMultisample";
import { getIGLTextureTarget } from "./caches/getIGLTextureTarget";
import { _GL_Submit_Times } from "./const/const";
import { IGLUniformBufferType } from "./const/IGLUniformType";
import { IGLBlitFramebuffer } from "./data/IGLBlitFramebuffer";
import { IGLBuffer } from "./data/IGLBuffer";
import { IGLCopyBufferToBuffer } from "./data/IGLCopyBufferToBuffer";
import { IGLCopyTextureToTexture } from "./data/IGLCopyTextureToTexture";
import { IGLCompareFunction, IGLStencilFunc, IGLStencilOp } from "./data/IGLDepthStencilState";
import { IGLDrawElementType } from "./data/IGLIndexBuffer";
import { IGLOcclusionQuery } from "./data/IGLOcclusionQuery";
import { IGLSampler, IGLTextureMagFilter, IGLTextureMinFilter, IGLTextureWrap } from "./data/IGLSampler";
import { IGLSamplerTexture } from "./data/IGLSamplerTexture";
import { IGLTextureTarget } from "./data/IGLTexture";
import { IGLTransformFeedback } from "./data/IGLTransformFeedback";
import { IGLTransformFeedbackObject, IGLTransformFeedbackPass, IGLTransformFeedbackPipeline } from "./data/IGLTransformFeedbackPass";
import { IUniformItemInfo } from "./data/IGLUniformInfo";
import { IGLUniforms } from "./data/IGLUniforms";
import { getGLTexture } from "./internal";
import { getIGLIndexBuffer, getIGLVertexBuffer } from "./runs/getIGLBuffer";
import { getIGLBlendEquation, getIGLBlendFactor, IGLBlendEquation, IGLBlendFactor } from "./runs/runColorTargetStates";
import { getIGLCompareFunction } from "./runs/runDepthState";
import { getIGLStencilFunc, getIGLStencilOp } from "./runs/runStencilState";
import { lazy, LazyObject } from "./types";
import { ChainMap } from "./utils/ChainMap";
import { getGLRenderPassAttachmentSize } from "./utils/getGLRenderPassAttachmentSize";
import { getIGLCullFace, IGLCullFace } from "./utils/getIGLCullFace";
import { getIGLFrontFace, IGLFrontFace } from "./utils/getIGLFrontFace";
import { getIGLVertexFormat } from "./utils/getIVertexFormat";

declare global
{
    interface WebGLRenderingContext
    {
        _vertexArrays: ChainMap<[IRenderPipeline, IVertexAttributes, IIndicesDataTypes], WebGLVertexArrayObject>;
    }
}

declare global
{
    interface WebGLTexture
    {
        minFilter?: IGLTextureMinFilter,
        magFilter?: IGLTextureMagFilter,
        wrapS?: IGLTextureWrap,
        wrapT?: IGLTextureWrap,
        wrapR?: IGLTextureWrap,
        anisotropy?: number,
        lodMinClamp?: number;
        lodMaxClamp?: number;
    }
}

export class RunWebGL
{
    runSubmit(gl: WebGLRenderingContext, submit: ISubmit)
    {
        const commandBuffers = submit.commandEncoders.map((v) =>
        {
            const commandBuffer = this.runCommandEncoder(gl, v);

            return commandBuffer;
        });

        // 派发提交WebGPU事件
        gl[_GL_Submit_Times] = ~~gl[_GL_Submit_Times] + 1;
    }

    protected runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: ICommandEncoder)
    {
        commandEncoder.passEncoders.forEach((passEncoder) =>
        {
            if (!passEncoder.__type)
            {
                this.runRenderPass(gl, passEncoder as IRenderPass);
            }
            else if (passEncoder.__type === "RenderPass")
            {
                this.runRenderPass(gl, passEncoder);
            }
            else if (passEncoder.__type === "TransformFeedbackPass")
            {
                this.runTransformFeedbackPass(gl, passEncoder);
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

    protected runTransformFeedbackPass(gl: WebGLRenderingContext, transformFeedbackPass: IGLTransformFeedbackPass)
    {
        // 执行变换反馈通道时关闭光栅化功能
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.enable(gl.RASTERIZER_DISCARD);
        }
        transformFeedbackPass.transformFeedbackObjects.forEach((transformFeedbackObject) =>
        {
            this.runTransformFeedbackObject(gl, transformFeedbackObject);
        });
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.disable(gl.RASTERIZER_DISCARD);
        }
    }

    protected runRenderPass(gl: WebGLRenderingContext, renderPass: IRenderPass)
    {
        // 获取附件尺寸
        const attachmentSize = getGLRenderPassAttachmentSize(gl, renderPass.descriptor);

        // 处理不被遮挡查询
        const occlusionQuery = getGLRenderOcclusionQuery(gl, renderPass.renderObjects);
        //
        occlusionQuery.init();

        if (renderPass.descriptor?.sampleCount && (renderPass.descriptor.colorAttachments[0].view as ITextureView).texture)
        {
            const { passDescriptor, blitFramebuffer } = getIGLRenderPassDescriptorWithMultisample(renderPass.descriptor);

            this.runPassDescriptor(gl, passDescriptor);

            this.runRenderObjects(gl, attachmentSize, renderPass.renderObjects);

            this.runBlitFramebuffer(gl, blitFramebuffer);
        }
        else
        {
            this.runPassDescriptor(gl, renderPass.descriptor);

            this.runRenderObjects(gl, attachmentSize, renderPass.renderObjects);
        }

        occlusionQuery.resolve(renderPass);
    }

    private runPassDescriptor(gl: WebGLRenderingContext, passDescriptor: IRenderPassDescriptor)
    {
        passDescriptor = passDescriptor || {};

        //
        const colorAttachment = Object.assign({}, defaultRenderPassColorAttachment, passDescriptor.colorAttachments?.[0]);

        //
        const framebuffer = getFramebuffer(gl, passDescriptor);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

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

    private runRenderObjects(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObjects?: readonly IRenderPassObject[])
    {
        renderObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type === "OcclusionQuery")
            {
                this.runOcclusionQuery(gl, attachmentSize, renderObject);
            }
            else
            {
                this.runRenderObject(gl, attachmentSize, renderObject);
            }
        });
    }

    private runRenderObject(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObject: IRenderObject)
    {
        const { viewport, scissorRect, pipeline, vertices, indices, uniforms, drawIndexed, drawVertex } = renderObject;

        const topology = pipeline.primitive?.topology || "triangle-list";
        const drawMode = getIGLDrawMode(topology);

        this.runViewPort(gl, attachmentSize, viewport);

        this.runScissor(gl, attachmentSize, scissorRect);

        this.runRenderPipeline(gl, pipeline);

        this.runVertexArray(gl, pipeline, vertices, indices);

        this.runUniforms(gl, pipeline, uniforms);

        if (drawVertex)
        {
            this.runDrawVertex(gl, drawMode, drawVertex);
        }
        if (drawIndexed)
        {
            this.runDrawIndexed(gl, drawMode, indices, drawIndexed);
        }
    }

    private runTransformFeedbackObject(gl: WebGLRenderingContext, renderObject: IGLTransformFeedbackObject)
    {
        const { pipeline, vertices, uniforms, transformFeedback, drawVertex } = renderObject;

        const drawMode = getIGLDrawMode("point-list");

        this.runTransformFeedbackPipeline(gl, pipeline);

        this.runVertexArray(gl, pipeline, vertices, undefined);

        this.runUniforms(gl, pipeline, uniforms);

        this.runTransformFeedback(gl, transformFeedback, drawMode);

        this.runDrawVertex(gl, drawMode, drawVertex);

        this.endTransformFeedback(gl, transformFeedback);
    }

    private endTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback)
    {
        //
        if (transformFeedback)
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.endTransformFeedback();
                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
            }
        }
    }

    private runDrawIndexed(gl: WebGLRenderingContext, drawMode: IGLDrawMode, indices: IIndicesDataTypes, drawIndexed: IDrawIndexed)
    {
        const type: IGLDrawElementType = indices.BYTES_PER_ELEMENT === 2 ? "UNSIGNED_SHORT" : "UNSIGNED_INT";
        //
        const indexCount = drawIndexed.indexCount;
        const firstIndex = drawIndexed.firstIndex || 0;
        const instanceCount = drawIndexed.instanceCount || 1;
        //
        const offset = firstIndex * indices.BYTES_PER_ELEMENT;

        //
        if (instanceCount > 1)
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.drawElementsInstanced(gl[drawMode], indexCount, gl[type], offset, instanceCount);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, gl[type], offset, instanceCount);
            }
        }
        else
        {
            gl.drawElements(gl[drawMode], indexCount, gl[type], offset);
        }
    }

    private runDrawVertex(gl: WebGLRenderingContext, drawMode: IGLDrawMode, drawArrays: IDrawVertex)
    {
        //
        const vertexCount = drawArrays.vertexCount;
        const firstVertex = drawArrays.firstVertex || 0;
        const instanceCount = drawArrays.instanceCount || 1;

        if (instanceCount > 1)
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.drawArraysInstanced(gl[drawMode], firstVertex, vertexCount, instanceCount);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.drawArraysInstancedANGLE(gl[drawMode], firstVertex, vertexCount, instanceCount);
            }
        }
        else
        {
            gl.drawArrays(gl[drawMode], firstVertex, vertexCount);
        }
    }


    /**
     * 激活常量
     */
    private runUniforms(gl: WebGLRenderingContext, pipeline: IRenderPipeline, uniforms: LazyObject<IGLUniforms>)
    {
        const webGLProgram = getGLProgram(gl, pipeline);

        webGLProgram.uniforms.forEach((uniformInfo) =>
        {
            const { name, type, items, isTexture, inBlock } = uniformInfo;
            if (inBlock) return;

            items.forEach((v) =>
            {
                const { paths } = v;

                let uniformData = lazy.getValue(uniforms[paths[0]], uniforms);
                for (let i = 1; i < paths.length; i++)
                {
                    uniformData = uniformData[paths[i]];
                }
                if (uniformData === undefined)
                {
                    console.error(`沒有找到Uniform ${name} 數據！`);
                }

                if (isTexture)
                {
                    this.runSamplerTexture(gl, v, uniformData as IGLSamplerTexture);
                }
                else
                {
                    this.runUniform(gl, type as IGLUniformBufferType, v, uniformData);
                }
            });
        });

        if (gl instanceof WebGL2RenderingContext)
        {
            webGLProgram.uniformBlocks.forEach((uniformBlock) =>
            {
                const { name, index } = uniformBlock;
                const uniformData = lazy.getValue(uniforms[name], uniforms);

                //
                const webGLBuffer = getGLBuffer(gl, uniformData as IGLBuffer);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, index, webGLBuffer);
            });
        }
    }

    private runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: IUniformItemInfo, samplerTexture: IGLSamplerTexture)
    {
        const { texture, sampler } = samplerTexture;
        const { location, textureID } = uniformInfo;

        const textureTarget = getIGLTextureTarget(texture.dimension);

        // 设置纹理所在采样编号
        gl.uniform1i(location, textureID);
        //
        const webGLTexture = getGLTexture(gl, texture);
        gl.activeTexture(gl[`TEXTURE${textureID}`]);
        // 绑定纹理
        gl.bindTexture(gl[textureTarget], webGLTexture);

        // 运行采样器
        this.runSampler(gl, textureTarget, webGLTexture, sampler, textureID);

        return webGLTexture;
    }

    /**
     * 设置采样参数
     */
    private runSampler(gl: WebGLRenderingContext, textureTarget: IGLTextureTarget, webGLTexture: WebGLTexture, sampler: IGLSampler, textureID: number)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            const webGLSampler = getGLSampler(gl, sampler);
            gl.bindSampler(textureID, webGLSampler);
        }
        else
        {
            const minFilter: IGLTextureMinFilter = sampler.minFilter || "LINEAR_MIPMAP_LINEAR";
            const magFilter: IGLTextureMagFilter = sampler.magFilter || "LINEAR";
            const wrapS: IGLTextureWrap = sampler.wrapS || "REPEAT";
            const wrapT: IGLTextureWrap = sampler.wrapT || "REPEAT";

            // 设置纹理参数
            if (webGLTexture.minFilter !== minFilter)
            {
                gl.texParameteri(gl[textureTarget], gl.TEXTURE_MIN_FILTER, gl[minFilter]);
                webGLTexture.minFilter = minFilter;
            }
            if (webGLTexture.magFilter !== magFilter)
            {
                gl.texParameteri(gl[textureTarget], gl.TEXTURE_MAG_FILTER, gl[magFilter]);
                webGLTexture.magFilter = magFilter;
            }
            if (webGLTexture.wrapS !== wrapS)
            {
                gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_S, gl[wrapS]);
                webGLTexture.wrapS = wrapS;
            }
            if (webGLTexture.wrapT !== wrapT)
            {
                gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_T, gl[wrapT]);
                webGLTexture.wrapT = wrapT;
            }
        }

        //
        const anisotropy = sampler?.anisotropy || 1;
        if (webGLTexture.anisotropy !== anisotropy)
        {
            const extension = gl.getExtension("EXT_texture_filter_anisotropic");
            if (extension)
            {
                gl.texParameterf(gl[textureTarget], extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, gl._capabilities.maxAnisotropy));
            }
            webGLTexture.anisotropy = anisotropy;
        }
    }

    /**
     * 设置环境Uniform数据
     */
    private runUniform(gl: WebGLRenderingContext, type: IGLUniformBufferType, uniformInfo: IUniformItemInfo, data: any)
    {
        const location = uniformInfo.location;
        switch (type)
        {
            case "BOOL":
            case "INT":
                // gl.uniform1i(location, data);
                gl.uniform1iv(location, [data]);
                break;
            case "BOOL_VEC2":
            case "INT_VEC2":
                // gl.uniform2i(location, data[0], data[1]);
                gl.uniform2iv(location, data);
                break;
            case "BOOL_VEC3":
            case "INT_VEC3":
                // gl.uniform3i(location, data[0], data[1], data[2]);
                gl.uniform3iv(location, data);
                break;
            case "BOOL_VEC4":
            case "INT_VEC4":
                // gl.uniform4i(location, data[0], data[1], data[2], data[3]);
                gl.uniform4iv(location, data);
                break;
            case "FLOAT":
                // gl.uniform1f(location, data);
                gl.uniform1fv(location, [data]);
                break;
            case "FLOAT_VEC2":
                // gl.uniform2f(location, data[0], data[1]);
                gl.uniform2fv(location, data);
                break;
            case "FLOAT_VEC3":
                // gl.uniform3f(location, data[0], data[1], data[2]);
                gl.uniform3fv(location, data);
                break;
            case "FLOAT_VEC4":
                // gl.uniform4f(location, data[0], data[1], data[2], data[3]);
                gl.uniform4fv(location, data);
                break;
            case "FLOAT_MAT2":
                gl.uniformMatrix2fv(location, false, data);
                break;
            case "FLOAT_MAT3":
                gl.uniformMatrix3fv(location, false, data);
                break;
            case "FLOAT_MAT4":
                gl.uniformMatrix4fv(location, false, data);
                break;
            case "UNSIGNED_INT":
                (gl as any as WebGL2RenderingContext).uniform1ui(location, data);
                (gl as any as WebGL2RenderingContext).uniform1uiv(location, [data]);
                break;
            case "UNSIGNED_INT_VEC2":
                // (gl as any as WebGL2RenderingContext).uniform2ui(location, data[0], data[1]);
                (gl as any as WebGL2RenderingContext).uniform2uiv(location, data);
                break;
            case "UNSIGNED_INT_VEC3":
                // (gl as any as WebGL2RenderingContext).uniform3ui(location, data[0], data[1], data[2]);
                (gl as any as WebGL2RenderingContext).uniform3uiv(location, data);
                break;
            case "UNSIGNED_INT_VEC4":
                // (gl as any as WebGL2RenderingContext).uniform4ui(location, data[0], data[1], data[2], data[3]);
                (gl as any as WebGL2RenderingContext).uniform4uiv(location, data);
                break;
            case "FLOAT_MAT2x3":
                (gl as any as WebGL2RenderingContext).uniformMatrix2x3fv(location, false, data);
                break;
            case "FLOAT_MAT2x4":
                (gl as any as WebGL2RenderingContext).uniformMatrix2x4fv(location, false, data);
                break;
            case "FLOAT_MAT3x2":
                (gl as any as WebGL2RenderingContext).uniformMatrix3x2fv(location, false, data);
                break;
            case "FLOAT_MAT3x4":
                (gl as any as WebGL2RenderingContext).uniformMatrix3x4fv(location, false, data);
                break;
            case "FLOAT_MAT4x2":
                (gl as any as WebGL2RenderingContext).uniformMatrix4x2fv(location, false, data);
                break;
            case "FLOAT_MAT4x3":
                (gl as any as WebGL2RenderingContext).uniformMatrix4x3fv(location, false, data);
                break;
            default:
                console.error(`无法识别的uniform类型 ${uniformInfo.paths} ${type}`);
        }
    }


    /**
     * 执行设置或者上传渲染对象的顶点以及索引数据。
     */
    private runVertexArray(gl: WebGLRenderingContext, pipeline: IRenderPipeline, vertices: IVertexAttributes, indices: IIndicesDataTypes)
    {
        if (!vertices && !indices) return;

        let webGLVertexArrayObject: WebGLVertexArrayObject;
        if (gl instanceof WebGL2RenderingContext)
        {
            webGLVertexArrayObject = gl._vertexArrays.get([pipeline, vertices, indices]);
            if (webGLVertexArrayObject)
            {
                gl.bindVertexArray(webGLVertexArrayObject);

                return;
            }

            webGLVertexArrayObject = gl.createVertexArray();
            gl.bindVertexArray(webGLVertexArrayObject);
            gl._vertexArrays.set([pipeline, vertices, indices], webGLVertexArrayObject);
        }

        const shaderResult = getGLProgram(gl, pipeline);

        //
        shaderResult.attributes.forEach((activeInfo) =>
        {
            const { name, location } = activeInfo;
            // 处理 WebGL 内置属性 gl_VertexID 等
            if (location < 0) return;

            const attribute = vertices[name];
            if (!attribute)
            {
                console.error(`缺少顶点 ${name} 数据！`);
            }

            this.runVertexAttribute(gl, location, attribute);
        });

        this.runIndexBuffer(gl, indices);
    }

    private runIndexBuffer(gl: WebGLRenderingContext, indices?: IIndicesDataTypes)
    {
        if (!indices) return;

        const indexBuffer = getIGLIndexBuffer(indices);

        const buffer = getGLBuffer(gl, indexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    private runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: IVertexAttribute)
    {
        const { stepMode, format } = attribute;
        let { arrayStride, offset } = attribute;

        const glVertexFormat = getIGLVertexFormat(format);
        const { numComponents, normalized, type } = glVertexFormat;

        gl.enableVertexAttribArray(location);

        if (stepMode === "instance")
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.vertexAttribDivisor(location, 1);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.vertexAttribDivisorANGLE(location, 1);
            }
        }

        //
        arrayStride = arrayStride || 0;
        offset = offset || 0;

        //
        const buffer = getIGLVertexBuffer(attribute.data);
        const webGLBuffer = getGLBuffer(gl, buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

        //
        if (gl instanceof WebGL2RenderingContext && (type === "INT" || type === "UNSIGNED_INT"))
        {
            gl.vertexAttribIPointer(location, numComponents, gl[type], arrayStride, offset);
        }
        else
        {
            gl.vertexAttribPointer(location, numComponents, gl[type], normalized, arrayStride, offset);
        }
    }

    private runTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback, topology: IGLDrawMode)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            if (transformFeedback)
            {
                const webGLTransformFeedback = getGLTransformFeedback(gl, transformFeedback);

                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);

                gl.beginTransformFeedback(gl[topology]);
            }
            else
            {
                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
            }
        }
        else if (transformFeedback)
        {
            console.log(`WebGL1 不支持顶点着色器回写数据功能！`);
        }
    }

    private runTransformFeedbackPipeline(gl: WebGLRenderingContext, renderPipeline: IGLTransformFeedbackPipeline)
    {
        const program = getGLProgram(gl, renderPipeline);
        gl.useProgram(program);
    }

    private runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IRenderPipeline)
    {
        this.runProgram(gl, renderPipeline);

        this.runPrimitiveState(gl, renderPipeline?.primitive);

        this.runDepthState(gl, renderPipeline.depthStencil);
        this.runStencilState(gl, renderPipeline.depthStencil);
    }

    private runStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
    {
        const { stencilFront, stencilBack } = { ...depthStencil };
        //
        if (stencilFront || stencilBack)
        {
            const ref: number = depthStencil.stencilReference ?? 0;
            const readMask = depthStencil.stencilReadMask ?? 0xFFFFFFFF;
            const writeMask = depthStencil.stencilWriteMask ?? 0xFFFFFFFF;

            gl.enable(gl.STENCIL_TEST);

            if (stencilFront)
            {
                const func: IGLStencilFunc = getIGLStencilFunc(stencilFront.compare ?? "always");
                const fail: IGLStencilOp = getIGLStencilOp(stencilFront.failOp);
                const zfail: IGLStencilOp = getIGLStencilOp(stencilFront.depthFailOp);
                const zpass: IGLStencilOp = getIGLStencilOp(stencilFront.passOp);
                //
                gl.stencilFuncSeparate(gl.FRONT, gl[func], ref, readMask);
                gl.stencilOpSeparate(gl.FRONT, gl[fail], gl[zfail], gl[zpass]);
                gl.stencilMaskSeparate(gl.FRONT, writeMask);
            }
            if (stencilBack)
            {
                const func: IGLStencilFunc = getIGLStencilFunc(stencilBack.compare ?? "always");
                const fail: IGLStencilOp = getIGLStencilOp(stencilBack.failOp);
                const zfail: IGLStencilOp = getIGLStencilOp(stencilBack.depthFailOp);
                const zpass: IGLStencilOp = getIGLStencilOp(stencilBack.passOp);
                //
                gl.stencilFuncSeparate(gl.BACK, gl[func], ref, readMask);
                gl.stencilOpSeparate(gl.BACK, gl[fail], gl[zfail], gl[zpass]);
                gl.stencilMaskSeparate(gl.BACK, writeMask);
            }
        }
        else
        {
            gl.disable(gl.STENCIL_TEST);
        }
    }

    private runDepthState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
    {
        if (depthStencil && (depthStencil.depthWriteEnabled || depthStencil.depthCompare !== "always"))
        {
            const depthCompare: IGLCompareFunction = getIGLCompareFunction(depthStencil.depthCompare ?? 'less');
            const depthWriteEnabled = depthStencil.depthWriteEnabled ?? true;
            //
            gl.enable(gl.DEPTH_TEST);
            //
            gl.depthFunc(gl[depthCompare]);
            gl.depthMask(depthWriteEnabled);

            //
            if (depthStencil.depthBias || depthStencil.depthBiasSlopeScale)
            {
                const factor = depthStencil.depthBiasSlopeScale ?? 0;
                const units = depthStencil.depthBias ?? 0;
                //
                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.polygonOffset(factor, units);
            }
            else
            {
                gl.disable(gl.POLYGON_OFFSET_FILL);
            }
        }
        else
        {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    private runPrimitiveState(gl: WebGLRenderingContext, primitive?: IPrimitiveState)
    {
        const cullFace: ICullFace = primitive?.cullFace || "none";
        const frontFace: IFrontFace = primitive?.frontFace || "ccw";

        const enableCullFace = cullFace !== "none";
        const glCullMode: IGLCullFace = getIGLCullFace(cullFace);
        const glFrontFace: IGLFrontFace = getIGLFrontFace(frontFace);

        if (enableCullFace)
        {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl[glCullMode]);
            gl.frontFace(gl[glFrontFace]);
        }
        else
        {
            gl.disable(gl.CULL_FACE);
        }
    }

    private runProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
    {
        const program = getGLProgram(gl, pipeline);
        gl.useProgram(program);

        //
        this.runColorTargetStates(gl, pipeline.fragment.targets);
    }

    private runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly IColorTargetState[])
    {
        //
        const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
        gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

        //
        let blend = targets?.[0]?.blend;
        if (blend)
        {
            const color: IBlendComponent = blend.color;
            const alpha: IBlendComponent = blend.alpha;

            const colorOperation: IGLBlendEquation = getIGLBlendEquation(color?.operation) || "FUNC_ADD";
            const colorSrcFactor: IGLBlendFactor = getIGLBlendFactor(color?.srcFactor, color?.operation) || "SRC_ALPHA";
            const colorDstFactor: IGLBlendFactor = getIGLBlendFactor(color?.dstFactor, color?.operation) || "ONE_MINUS_SRC_ALPHA";
            //
            const alphaOperation: IGLBlendEquation = getIGLBlendEquation(alpha?.operation) || colorOperation;
            const alphaSrcFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.srcFactor, color?.operation) || colorSrcFactor;
            const alphaDstFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.dstFactor, color?.operation) || colorDstFactor;

            // 当混合系数用到了混合常量值时设置混合常量值。
            const constantColor = getBlendConstantColor(blend);
            if (constantColor)
            {
                const constantColor = blend.constantColor ?? [0, 0, 0, 0];
                gl.blendColor(constantColor[0], constantColor[1], constantColor[2], constantColor[3]);
            }

            //
            gl.enable(gl.BLEND);
            gl.blendEquationSeparate(gl[colorOperation], gl[alphaOperation]);
            gl.blendFuncSeparate(gl[colorSrcFactor], gl[colorDstFactor], gl[alphaSrcFactor], gl[alphaDstFactor]);
        }
        else
        {
            gl.disable(gl.BLEND);
        }
    }

    private runOcclusionQuery(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, occlusionQuery: IGLOcclusionQuery)
    {
        // 开始查询
        occlusionQuery._step.begin();

        // 正常渲染对象列表
        occlusionQuery.renderObjects.forEach((renderObject) =>
        {
            this.runRenderObject(gl, attachmentSize, renderObject);
        });

        // 结束查询
        occlusionQuery._step.end();
    }

    private runViewPort(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, viewport: IViewport)
    {
        if (viewport)
        {
            const isYup = viewport.isYup ?? true;
            const x = viewport.x ?? 0;
            let y = viewport.y ?? 0;
            const width = viewport.width ?? attachmentSize.width;
            const height = viewport.height ?? attachmentSize.height;

            if (!isYup)
            {
                y = attachmentSize.height - y - height;
            }

            gl.viewport(x, y, width, height);
        }
        else
        {
            gl.viewport(0, 0, attachmentSize.width, attachmentSize.height);
        }
    }

    private runScissor(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, scissor: IScissorRect)
    {
        if (scissor)
        {
            const isYup = scissor.isYup ?? true;
            const x = scissor.x ?? 0;
            let y = scissor.y ?? 0;
            const width = scissor.width ?? attachmentSize.width;
            const height = scissor.height ?? attachmentSize.height;

            if (!isYup)
            {
                y = attachmentSize.height - y - height;
            }

            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(x, y, width, height);
        }
        else
        {
            gl.disable(gl.SCISSOR_TEST);
        }
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

            const rb = getGLBuffer(gl, read);
            const wb = getGLBuffer(gl, write);

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

export const defaultRenderPassColorAttachment: IRenderPassColorAttachment = { clearValue: [0, 0, 0, 0], loadOp: "clear" };
export const defaultDepthStencilAttachment: IRenderPassDepthStencilAttachment = { depthClearValue: 1, depthLoadOp: "load", stencilClearValue: 0, stencilLoadOp: "load" };
