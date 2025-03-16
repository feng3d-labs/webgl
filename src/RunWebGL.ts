import { BindingResources, BlendComponent, BlendState, GBuffer, BufferBinding, ColorTargetState, CommandEncoder, CopyBufferToBuffer, CopyTextureToTexture, CullFace, DepthStencilState, DrawIndexed, DrawVertex, FrontFace, IIndicesDataTypes, OcclusionQuery, PrimitiveState, RenderObject, RenderPass, RenderPassDescriptor, RenderPassObject, RenderPipeline, Sampler, ScissorRect, Submit, TextureView, TypedArray, UnReadonly, VertexAttribute, VertexAttributes, vertexFormatMap, Viewport } from "@feng3d/render-api";

import { getGLBlitFramebuffer } from "./caches/getGLBlitFramebuffer";
import { getGLBuffer } from "./caches/getGLBuffer";
import { getGLDrawMode, GLDrawMode } from "./caches/getGLDrawMode";
import { getGLFramebuffer } from "./caches/getGLFramebuffer";
import { getGLProgram, UniformItemInfo } from "./caches/getGLProgram";
import { getGLRenderOcclusionQuery } from "./caches/getGLRenderOcclusionQuery";
import { getGLRenderPassDescriptorWithMultisample } from "./caches/getGLRenderPassDescriptorWithMultisample";
import { getGLSampler, getIGLTextureMagFilter, getIGLTextureMinFilter, getIGLTextureWrap, GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap } from "./caches/getGLSampler";
import { getGLTextureTarget, GLTextureTarget } from "./caches/getGLTextureTarget";
import { getGLTransformFeedback } from "./caches/getGLTransformFeedback";
import { _GL_Submit_Times } from "./const/const";
import { GLUniformBufferType } from "./const/GLUniformType";
import { BlitFramebuffer } from "./data/BlitFramebuffer";
import { DrawElementType } from "./data/polyfills/Buffer";
import { SamplerTexture } from "./data/SamplerTexture";
import { TransformFeedback, TransformFeedbackObject, TransformFeedbackPass, TransformFeedbackPipeline } from "./data/TransformFeedbackPass";
import { getGLTexture } from "./internal";
import { getIGLBuffer } from "./runs/getIGLBuffer";
import { getIGLBlendEquation, getIGLBlendFactor, IGLBlendEquation, IGLBlendFactor } from "./runs/runColorTargetStates";
import { getIGLCompareFunction } from "./runs/runDepthState";
import { getIGLStencilFunc, getIGLStencilOp } from "./runs/runStencilState";
import { ChainMap } from "./utils/ChainMap";
import { updateBufferBinding } from "./utils/updateBufferBinding";

import { getCapabilities } from "./caches/getCapabilities";
import "./data/polyfills/OcclusionQuery";

declare global
{
    interface WebGLTexture
    {
        minFilter?: GLTextureMinFilter,
        magFilter?: GLTextureMagFilter,
        wrapS?: GLTextureWrap,
        wrapT?: GLTextureWrap,
        wrapR?: GLTextureWrap,
        maxAnisotropy?: number,
        lodMinClamp?: number;
        lodMaxClamp?: number;
    }
}

export class RunWebGL
{
    runSubmit(gl: WebGLRenderingContext, submit: Submit)
    {
        const commandBuffers = submit.commandEncoders.map((v) =>
        {
            const commandBuffer = this.runCommandEncoder(gl, v);

            return commandBuffer;
        });

        // 派发提交WebGPU事件
        gl[_GL_Submit_Times] = ~~gl[_GL_Submit_Times] + 1;
    }

    protected runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: CommandEncoder)
    {
        commandEncoder.passEncoders.forEach((passEncoder) =>
        {
            if (!passEncoder.__type__)
            {
                this.runRenderPass(gl, passEncoder as RenderPass);
            }
            else if (passEncoder.__type__ === "RenderPass")
            {
                this.runRenderPass(gl, passEncoder);
            }
            else if (passEncoder.__type__ === "TransformFeedbackPass")
            {
                this.runTransformFeedbackPass(gl, passEncoder);
            }
            else if (passEncoder.__type__ === "BlitFramebuffer")
            {
                this.runBlitFramebuffer(gl, passEncoder);
            }
            else if (passEncoder.__type__ === "CopyTextureToTexture")
            {
                this.runCopyTextureToTexture(gl, passEncoder);
            }
            else if (passEncoder.__type__ === "CopyBufferToBuffer")
            {
                this.runCopyBuffer(gl, passEncoder);
            }
            else
            {
                console.error(`未处理 passEncoder ${passEncoder}`);
            }
        });
    }

    protected runTransformFeedbackPass(gl: WebGLRenderingContext, transformFeedbackPass: TransformFeedbackPass)
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

    protected runRenderPass(gl: WebGLRenderingContext, renderPass: RenderPass)
    {
        // 获取附件尺寸
        const attachmentSize = getGLRenderPassAttachmentSize(gl, renderPass.descriptor);

        // 处理不被遮挡查询
        const occlusionQuery = getGLRenderOcclusionQuery(gl, renderPass.renderObjects);
        //
        occlusionQuery.init();

        if (renderPass.descriptor?.sampleCount && (renderPass.descriptor.colorAttachments[0].view as TextureView).texture)
        {
            const { passDescriptor, blitFramebuffer } = getGLRenderPassDescriptorWithMultisample(renderPass.descriptor);

            this.runRenderPassDescriptor(gl, passDescriptor);

            this.runRenderObjects(gl, attachmentSize, renderPass.renderObjects);

            this.runBlitFramebuffer(gl, blitFramebuffer);
        }
        else
        {
            this.runRenderPassDescriptor(gl, renderPass.descriptor);

            this.runRenderObjects(gl, attachmentSize, renderPass.renderObjects);
        }

        occlusionQuery.resolve(renderPass);
    }

    private runRenderPassDescriptor(gl: WebGLRenderingContext, passDescriptor: RenderPassDescriptor)
    {
        passDescriptor = passDescriptor || {};


        //
        const framebuffer = getGLFramebuffer(gl, passDescriptor);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        //
        const colorAttachment = passDescriptor.colorAttachments?.[0];
        //
        const clearValue = colorAttachment?.clearValue ?? [0, 0, 0, 0];
        const loadOp = colorAttachment?.loadOp ?? "clear";
        gl.clearColor(clearValue[0], clearValue[1], clearValue[2], clearValue[3]);

        //
        const depthStencilAttachment = passDescriptor.depthStencilAttachment;
        const depthClearValue = depthStencilAttachment?.depthClearValue ?? 1;
        const depthLoadOp = depthStencilAttachment?.depthLoadOp ?? "load";
        const stencilClearValue = depthStencilAttachment?.stencilClearValue ?? 0;
        const stencilLoadOp = depthStencilAttachment?.stencilLoadOp ?? "load";

        //
        gl.clearDepth(depthClearValue);
        gl.clearStencil(stencilClearValue);

        //
        gl.clear((loadOp === "clear" ? gl.COLOR_BUFFER_BIT : 0)
            | (depthLoadOp === "clear" ? gl.DEPTH_BUFFER_BIT : 0)
            | (stencilLoadOp === "clear" ? gl.STENCIL_BUFFER_BIT : 0)
        );
    }

    private runRenderObjects(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObjects?: readonly RenderPassObject[])
    {
        renderObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type__ === "OcclusionQuery")
            {
                this.runOcclusionQuery(gl, attachmentSize, renderObject);
            }
            else
            {
                this.runRenderObject(gl, attachmentSize, renderObject);
            }
        });
    }

    private runRenderObject(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObject: RenderObject)
    {
        const { viewport, scissorRect, pipeline, geometry, bindingResources: uniforms } = renderObject;

        this.runViewPort(gl, attachmentSize, viewport);

        this.runScissor(gl, attachmentSize, scissorRect);

        this.runRenderPipeline(gl, pipeline);

        this.runUniforms(gl, pipeline, uniforms);

        const { vertices, indices, draw, primitive } = geometry;

        this.runVertexArray(gl, pipeline, vertices, indices);

        this.runPrimitiveState(gl, primitive);

        const topology = primitive?.topology || "triangle-list";
        const drawMode = getGLDrawMode(topology);

        if (draw.__type__ === 'DrawVertex')
        {
            this.runDrawVertex(gl, drawMode, draw);
        }
        else
        {
            this.runDrawIndexed(gl, drawMode, indices, draw);
        }
    }

    private runTransformFeedbackObject(gl: WebGLRenderingContext, renderObject: TransformFeedbackObject)
    {
        const { pipeline: material, vertices, uniforms, transformFeedback, draw } = renderObject;

        const drawMode = getGLDrawMode("point-list");

        this.runTransformFeedbackPipeline(gl, material);

        this.runVertexArray(gl, material, vertices, undefined);

        this.runUniforms(gl, material, uniforms);

        this.runTransformFeedback(gl, transformFeedback, drawMode);

        this.runDrawVertex(gl, drawMode, draw);

        this.endTransformFeedback(gl, transformFeedback);
    }

    private endTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback)
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

    private runDrawIndexed(gl: WebGLRenderingContext, drawMode: GLDrawMode, indices: IIndicesDataTypes, drawIndexed: DrawIndexed)
    {
        const type: DrawElementType = indices.BYTES_PER_ELEMENT === 2 ? "UNSIGNED_SHORT" : "UNSIGNED_INT";
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

    private runDrawVertex(gl: WebGLRenderingContext, drawMode: GLDrawMode, drawArrays: DrawVertex)
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
    private runUniforms(gl: WebGLRenderingContext, material: RenderPipeline, uniforms: BindingResources)
    {
        const webGLProgram = getGLProgram(gl, material);

        webGLProgram.uniforms.forEach((uniformInfo) =>
        {
            const { name, type, items, isTexture, inBlock } = uniformInfo;
            if (inBlock) return;

            items.forEach((v) =>
            {
                const { paths } = v;

                let uniformData = uniforms[paths[0]];
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
                    this.runSamplerTexture(gl, v, uniformData as SamplerTexture);
                }
                else
                {
                    this.runUniform(gl, type as GLUniformBufferType, v, uniformData);
                }
            });
        });

        if (gl instanceof WebGL2RenderingContext)
        {
            webGLProgram.uniformBlocks.forEach((uniformBlock) =>
            {
                const { name, index } = uniformBlock;
                const uniformData = uniforms[name] as TypedArray | BufferBinding;

                //
                let typedArray = uniformData as TypedArray;
                if (!(typedArray.buffer && typedArray.BYTES_PER_ELEMENT))
                {
                    const bufferBinding = uniforms[name] as BufferBinding;
                    updateBufferBinding(uniformBlock.bufferBindingInfo, bufferBinding);
                    typedArray = bufferBinding.bufferView;
                }
                const buffer = getIGLBuffer(typedArray, "UNIFORM_BUFFER", "DYNAMIC_DRAW");
                buffer.target ??= "UNIFORM_BUFFER";
                buffer.usage ??= "DYNAMIC_DRAW";

                (buffer as UnReadonly<GBuffer>).label = buffer.label || (`UniformBuffer ${name}`);

                //
                const webGLBuffer = getGLBuffer(gl, buffer);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, index, webGLBuffer);
            });
        }
    }

    private runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: UniformItemInfo, samplerTexture: SamplerTexture)
    {
        const { texture, sampler } = samplerTexture;
        const { location, textureID } = uniformInfo;

        const textureTarget = getGLTextureTarget(texture.dimension);

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
    private runSampler(gl: WebGLRenderingContext, textureTarget: GLTextureTarget, webGLTexture: WebGLTexture, sampler: Sampler, textureID: number)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            const webGLSampler = getGLSampler(gl, sampler);
            gl.bindSampler(textureID, webGLSampler);
        }
        else
        {
            const minFilter = getIGLTextureMinFilter(sampler.minFilter, sampler.mipmapFilter);
            const magFilter = getIGLTextureMagFilter(sampler.magFilter);
            const wrapS = getIGLTextureWrap(sampler.addressModeU);
            const wrapT = getIGLTextureWrap(sampler.addressModeV);

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
        const maxAnisotropy = sampler?.maxAnisotropy || 1;
        if (webGLTexture.maxAnisotropy !== maxAnisotropy)
        {
            const extension = gl.getExtension("EXT_texture_filter_anisotropic");
            if (extension)
            {
                gl.texParameterf(gl[textureTarget], extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(maxAnisotropy, getCapabilities(gl).maxAnisotropy));
            }
            webGLTexture.maxAnisotropy = maxAnisotropy;
        }
    }

    /**
     * 设置环境Uniform数据
     */
    private runUniform(gl: WebGLRenderingContext, type: GLUniformBufferType, uniformInfo: UniformItemInfo, data: any)
    {
        if (typeof data === "number")
        {
            data = [data];
        }
        if (data.toArray) data = data.toArray();
        const location = uniformInfo.location;
        switch (type)
        {
            case "BOOL":
            case "INT":
                gl.uniform1iv(location, data);
                break;
            case "BOOL_VEC2":
            case "INT_VEC2":
                gl.uniform2iv(location, data);
                break;
            case "BOOL_VEC3":
            case "INT_VEC3":
                gl.uniform3iv(location, data);
                break;
            case "BOOL_VEC4":
            case "INT_VEC4":
                gl.uniform4iv(location, data);
                break;
            case "FLOAT":
                gl.uniform1fv(location, [data]);
                break;
            case "FLOAT_VEC2":
                gl.uniform2fv(location, data);
                break;
            case "FLOAT_VEC3":
                gl.uniform3fv(location, data);
                break;
            case "FLOAT_VEC4":
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
                (gl as any as WebGL2RenderingContext).uniform1uiv(location, data);
                break;
            case "UNSIGNED_INT_VEC2":
                (gl as any as WebGL2RenderingContext).uniform2uiv(location, data);
                break;
            case "UNSIGNED_INT_VEC3":
                (gl as any as WebGL2RenderingContext).uniform3uiv(location, data);
                break;
            case "UNSIGNED_INT_VEC4":
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
    private runVertexArray(gl: WebGLRenderingContext, material: RenderPipeline, vertices: VertexAttributes, indices: IIndicesDataTypes)
    {
        if (!vertices && !indices) return;

        let webGLVertexArrayObject: WebGLVertexArrayObject;
        if (gl instanceof WebGL2RenderingContext)
        {
            webGLVertexArrayObject = gl._vertexArrays.get([material, vertices, indices]);
            if (webGLVertexArrayObject)
            {
                gl.bindVertexArray(webGLVertexArrayObject);

                return;
            }

            webGLVertexArrayObject = gl.createVertexArray();
            gl.bindVertexArray(webGLVertexArrayObject);
            gl._vertexArrays.set([material, vertices, indices], webGLVertexArrayObject);
        }

        const shaderResult = getGLProgram(gl, material);

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

        const indexBuffer = getIGLBuffer(indices, "ELEMENT_ARRAY_BUFFER");
        indexBuffer.target ??= "ELEMENT_ARRAY_BUFFER";
        indexBuffer.usage ??= "STATIC_DRAW";

        const buffer = getGLBuffer(gl, indexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    private runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: VertexAttribute)
    {
        const { stepMode, format } = attribute;
        let { arrayStride, offset } = attribute;

        const glVertexFormat = vertexFormatMap[format];
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
        const buffer = getIGLBuffer(attribute.data, "ARRAY_BUFFER", "STATIC_DRAW");
        buffer.target ??= "ARRAY_BUFFER";

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

    private runTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback, topology: GLDrawMode)
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

    private runTransformFeedbackPipeline(gl: WebGLRenderingContext, renderPipeline: TransformFeedbackPipeline)
    {
        const program = getGLProgram(gl, renderPipeline);
        gl.useProgram(program);
    }

    private runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: RenderPipeline)
    {
        this.runProgram(gl, renderPipeline);

        this.runDepthState(gl, renderPipeline.depthStencil);
        this.runStencilState(gl, renderPipeline.depthStencil);
    }

    private runStencilState(gl: WebGLRenderingContext, depthStencil?: DepthStencilState)
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
                const func = getIGLStencilFunc(stencilFront.compare ?? "always");
                const fail = getIGLStencilOp(stencilFront.failOp);
                const zfail = getIGLStencilOp(stencilFront.depthFailOp);
                const zpass = getIGLStencilOp(stencilFront.passOp);
                //
                gl.stencilFuncSeparate(gl.FRONT, gl[func], ref, readMask);
                gl.stencilOpSeparate(gl.FRONT, gl[fail], gl[zfail], gl[zpass]);
                gl.stencilMaskSeparate(gl.FRONT, writeMask);
            }
            if (stencilBack)
            {
                const func = getIGLStencilFunc(stencilBack.compare ?? "always");
                const fail = getIGLStencilOp(stencilBack.failOp);
                const zfail = getIGLStencilOp(stencilBack.depthFailOp);
                const zpass = getIGLStencilOp(stencilBack.passOp);
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

    private runDepthState(gl: WebGLRenderingContext, depthStencil?: DepthStencilState)
    {
        if (depthStencil && (depthStencil.depthWriteEnabled || depthStencil.depthCompare !== "always"))
        {
            const depthCompare = getIGLCompareFunction(depthStencil.depthCompare ?? "less");
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

    private runPrimitiveState(gl: WebGLRenderingContext, primitive?: PrimitiveState)
    {
        const cullFace: CullFace = primitive?.cullFace || "none";
        const frontFace: FrontFace = primitive?.frontFace || "ccw";


        if (cullFace !== "none")
        {
            const glCullMode = cullFaceMap[cullFace];
            console.assert(!!glCullMode, `接收到错误值，请从 ${Object.keys(cullFaceMap).toString()} 中取值！`);

            const glFrontFace = frontFaceMap[frontFace];
            console.assert(!!glFrontFace, `接收到错误 IFrontFace 值，请从 ${Object.keys(frontFaceMap).toString()} 中取值！`);

            //
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl[glCullMode]);
            gl.frontFace(gl[glFrontFace]);
        }
        else
        {
            gl.disable(gl.CULL_FACE);
        }
    }

    private runProgram(gl: WebGLRenderingContext, material: RenderPipeline)
    {
        const program = getGLProgram(gl, material);
        gl.useProgram(program);

        //
        this.runColorTargetStates(gl, material.fragment.targets);
    }

    private runColorTargetStates(gl: WebGLRenderingContext, targets?: readonly ColorTargetState[])
    {
        //
        const colorMask = targets?.[0]?.writeMask || [true, true, true, true];
        gl.colorMask(colorMask[0], colorMask[1], colorMask[2], colorMask[3]);

        //
        const blend = targets?.[0]?.blend;
        if (blend)
        {
            const color: BlendComponent = blend.color;
            const alpha: BlendComponent = blend.alpha;

            const colorOperation: IGLBlendEquation = getIGLBlendEquation(color?.operation) || "FUNC_ADD";
            const colorSrcFactor: IGLBlendFactor = getIGLBlendFactor(color?.srcFactor, color?.operation) || "SRC_ALPHA";
            const colorDstFactor: IGLBlendFactor = getIGLBlendFactor(color?.dstFactor, color?.operation) || "ONE_MINUS_SRC_ALPHA";
            //
            const alphaOperation: IGLBlendEquation = getIGLBlendEquation(alpha?.operation) || colorOperation;
            const alphaSrcFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.srcFactor, color?.operation) || colorSrcFactor;
            const alphaDstFactor: IGLBlendFactor = getIGLBlendFactor(alpha?.dstFactor, color?.operation) || colorDstFactor;

            // 当混合系数用到了混合常量值时设置混合常量值。
            const constantColor = BlendState.getBlendConstantColor(blend);
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

    private runOcclusionQuery(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, occlusionQuery: OcclusionQuery)
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

    private runViewPort(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, viewport: Viewport)
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

    private runScissor(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, scissor: ScissorRect)
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

    private runCopyTextureToTexture(gl: WebGLRenderingContext, copyTextureToTexture: CopyTextureToTexture)
    {
        const blitFramebuffer = getGLBlitFramebuffer(copyTextureToTexture);
        this.runBlitFramebuffer(gl, blitFramebuffer);
    }

    private runBlitFramebuffer(gl: WebGLRenderingContext, blitFramebuffer: BlitFramebuffer)
    {
        const { read, draw, blitFramebuffers } = blitFramebuffer;

        const readFramebuffer = getGLFramebuffer(gl, read);
        const drawFramebuffer = getGLFramebuffer(gl, draw);

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

    private runCopyBuffer(gl: WebGLRenderingContext, copyBuffer: CopyBufferToBuffer)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            const { source: read, destination: write, sourceOffset: readOffset, destinationOffset: writeOffset, size } = copyBuffer;

            const rb = getGLBuffer(gl, read);
            const wb = getGLBuffer(gl, write);

            gl.bindBuffer(gl.COPY_READ_BUFFER, rb);
            gl.bindBuffer(gl.COPY_WRITE_BUFFER, wb);
            gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, readOffset, writeOffset, size);

            //
            gl.bindBuffer(gl.COPY_READ_BUFFER, null);
            gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
        }
        else
        {
            console.error(`WebGL1 不支持拷贝缓冲区功能！`);
        }
    }
}

const cullFaceMap = Object.freeze({
    FRONT_AND_BACK: "FRONT_AND_BACK",
    none: "BACK", // 不会开启剔除面功能，什么值无所谓。
    front: "FRONT",
    back: "BACK",
});

const frontFaceMap = Object.freeze({ ccw: "CCW", cw: "CW", });

/**
 * 获取渲染通道附件尺寸。
 *
 * @param gl
 * @param descriptor
 */
function getGLRenderPassAttachmentSize(gl: WebGLRenderingContext, descriptor: RenderPassDescriptor): { readonly width: number; readonly height: number; }
{
    if (!descriptor) return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };

    const colorAttachments = descriptor.colorAttachments;
    if (colorAttachments)
    {
        const view = colorAttachments[0]?.view;
        if (view)
        {
            return { width: view.texture.size[0], height: view.texture.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    const depthStencilAttachment = descriptor.depthStencilAttachment;
    if (depthStencilAttachment)
    {
        const view = depthStencilAttachment.view;
        if (view)
        {
            return { width: view.texture.size[0], height: view.texture.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
}