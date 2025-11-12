import { BindingResources, Buffer, BufferBinding, RenderPipeline, TypedArray, UnReadonly } from "@feng3d/render-api";
import { getGLProgram, UniformItemInfo } from "../caches/getGLProgram";
import { getGLBuffer } from "../caches/getGLBuffer";
import { getIGLBuffer } from "../runs/getIGLBuffer";
import { SamplerTexture } from "../data/SamplerTexture";
import { updateBufferBinding } from "../utils/updateBufferBinding";
import { runSamplerTexture } from "./runSamplerTexture";
import { runUniform } from "./runUniform";
import { GLUniformBufferType } from "../const/GLUniformType";

/**
 * 激活常量
 */
export function runUniforms(gl: WebGLRenderingContext, material: RenderPipeline, uniforms: BindingResources)
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
                runSamplerTexture(gl, v, uniformData as SamplerTexture);
            }
            else
            {
                runUniform(gl, type as GLUniformBufferType, v, uniformData);
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

            (buffer as UnReadonly<Buffer>).label = buffer.label || (`UniformBuffer ${name}`);

            //
            const webGLBuffer = getGLBuffer(gl, buffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, index, webGLBuffer);
        });
    }
}

