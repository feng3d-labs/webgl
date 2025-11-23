import { UnReadonly } from '@feng3d/reactivity';
import { BindingResources, Buffer, BufferBinding, RenderPipeline, Sampler, Texture, TextureView, TypedArray } from '@feng3d/render-api';
import { getGLBuffer } from '../../caches/getGLBuffer';
import { getGLProgram } from '../../caches/getGLProgram';
import { GLUniformBufferType } from '../../const/GLUniformType';
import { SamplerTexture } from '../../data/SamplerTexture';
import { updateBufferBinding } from '../../utils/updateBufferBinding';
import { runSamplerTexture } from '../runSamplerTexture';
import { runUniform } from '../runUniform';

/**
 * 检查是否是 TextureView 格式（包含 texture 属性）
 */
function isTextureView(value: any): value is TextureView
{
    return value && typeof value === 'object' && 'texture' in value;
}

/**
 * 检查是否是 Sampler 对象
 */
function isSampler(value: any): value is Sampler
{
    return value && typeof value === 'object' && !('texture' in value) && !('value' in value) && !('buffer' in value);
}

/**
 * 尝试从展开的格式中获取 SamplerTexture
 * 如果找到 name_texture 和 name，且它们分别是 TextureView 和 Sampler，则合并为 SamplerTexture
 */
function getSamplerTextureFromExpanded(bindingResources: BindingResources, name: string): SamplerTexture | undefined
{
    const textureKey = `${name}_texture`;
    const samplerKey = name;

    const textureValue = bindingResources[textureKey];
    const samplerValue = bindingResources[samplerKey];

    if (textureValue && samplerValue && isTextureView(textureValue) && isSampler(samplerValue))
    {
        return {
            texture: textureValue.texture,
            sampler: samplerValue,
        };
    }

    return undefined;
}

/**
 * 激活常量
 */
export function runUniforms(gl: WebGLRenderingContext, pipeline: RenderPipeline, bindingResources: BindingResources)
{
    const webGLProgram = getGLProgram(gl, pipeline);

    webGLProgram.uniforms.forEach((uniformInfo) =>
    {
        const { name, type, items, isTexture, inBlock } = uniformInfo;
        if (inBlock) return;

        items.forEach((v) =>
        {
            const { paths } = v;

            let uniformData = bindingResources[paths[0]];
            for (let i = 1; i < paths.length; i++)
            {
                uniformData = uniformData[paths[i]];
            }

            // 如果是纹理，检查 uniformData 是否是有效的 SamplerTexture
            // 如果不是（undefined 或只是 Sampler），尝试从展开的格式中获取
            if (isTexture)
            {
                const isSamplerTexture = uniformData && typeof uniformData === 'object' && 'texture' in uniformData;
                if (!isSamplerTexture)
                {
                    // 尝试从展开的格式中获取
                    const expandedData = getSamplerTextureFromExpanded(bindingResources, paths[0]);
                    if (expandedData)
                    {
                        uniformData = expandedData;
                    }
                }
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
                runUniform(gl, type as GLUniformBufferType, v, uniformData as BufferBinding);
            }
        });
    });

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLProgram.uniformBlocks.forEach((uniformBlock) =>
        {
            const { name, index } = uniformBlock;
            const uniformData = bindingResources[name] as TypedArray | BufferBinding;

            //
            let typedArray = uniformData as TypedArray;
            if (!(typedArray.buffer && typedArray.BYTES_PER_ELEMENT))
            {
                const bufferBinding = bindingResources[name] as BufferBinding;
                updateBufferBinding(uniformBlock.bufferBindingInfo, bufferBinding);
                typedArray = bufferBinding.bufferView;
            }
            const buffer = Buffer.getBuffer(typedArray.buffer);

            (buffer as UnReadonly<Buffer>).label = buffer.label || (`UniformBuffer ${name}`);

            const offset = typedArray.byteOffset;
            const size = uniformBlock.bufferBindingInfo.size;

            //
            const webGLBuffer = getGLBuffer(gl, buffer, 'UNIFORM_BUFFER', 'DYNAMIC_DRAW');
            gl.bindBufferRange(gl.UNIFORM_BUFFER, index, webGLBuffer, offset, size);
        });
    }
}

