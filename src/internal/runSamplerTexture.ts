import { Sampler } from '@feng3d/render-api';
import { UniformItemInfo } from '../caches/getGLProgram';
import { getGLTextureTarget } from '../caches/getGLTextureTarget';
import { SamplerTexture } from '../data/SamplerTexture';
import { getGLTexture } from '../internal';
import { runSampler } from './runSampler';

export function runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: UniformItemInfo, samplerTexture: SamplerTexture)
{
    const { texture, sampler } = samplerTexture;
    const { location, textureID } = uniformInfo;

    const textureTarget = getGLTextureTarget(texture.descriptor.dimension);

    // 设置纹理所在采样编号
    gl.uniform1i(location, textureID);
    //
    const webGLTexture = getGLTexture(gl, texture);

    gl.activeTexture(gl[`TEXTURE${textureID}`]);
    // 绑定纹理
    gl.bindTexture(gl[textureTarget], webGLTexture);

    // 检查纹理是否只有单一 mip level，如果是则调整采样器配置
    const adjustedSampler = adjustSamplerForTexture(texture, sampler);

    // 运行采样器
    runSampler(gl, textureTarget, webGLTexture, adjustedSampler, textureID);

    return webGLTexture;
}

// 用于追踪已警告的纹理，避免重复警告
const warnedTextures = new WeakSet<SamplerTexture['texture']>();

/**
 * 根据纹理的 mip level 数量调整采样器配置
 * 当纹理只有单一 mip level 时，忽略 mipmapFilter 并限制 lodMaxClamp
 */
function adjustSamplerForTexture(texture: SamplerTexture['texture'], sampler: Sampler): Sampler
{
    const descriptor = texture.descriptor;
    const hasMipmap = descriptor.generateMipmap || (descriptor.mipLevelCount && descriptor.mipLevelCount > 1);

    if (!hasMipmap && sampler.mipmapFilter)
    {
        // 只警告一次
        if (!warnedTextures.has(texture))
        {
            warnedTextures.add(texture);
            console.warn(
                `[WebGL] 纹理没有 mipmap（generateMipmap: false），但采样器设置了 mipmapFilter: '${sampler.mipmapFilter}'。`
                + ` 已自动忽略 mipmapFilter 并将 lodMaxClamp 设为 0，以避免黑屏。`
                + ` 建议：设置 generateMipmap: true 或移除 mipmapFilter 配置。`,
            );
        }

        return {
            ...sampler,
            mipmapFilter: undefined,
            lodMaxClamp: 0,
        };
    }

    return sampler;
}

