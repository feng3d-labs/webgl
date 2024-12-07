import { getTexture } from "../caches/getTexture";
import { IGLSamplerTexture } from "../data/IGLSamplerTexture";
import { IGLBufferSource, IGLImageSource, IGLTexture, IGLTextureSource } from "../data/IGLTexture";
import { IUniformItemInfo } from "../data/IGLUniformInfo";
import { runSampler } from "./runSampler";

export const defaultImageSource: IGLImageSource = { level: 0, source: new ImageData(1, 1) };
export const defaultBufferSource: IGLBufferSource = { level: 0, width: 1, height: 1, depth: 1, border: 0 };
export const defaultTextureSources: IGLTextureSource[] = [defaultBufferSource];
export const defaultTexture: IGLTexture = { generateMipmap: false};

Object.freeze(defaultImageSource);
Object.freeze(defaultBufferSource);
Object.freeze(defaultTextureSources);
Object.freeze(defaultTexture);

export function runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: IUniformItemInfo, samplerTexture: IGLSamplerTexture)
{
    const { texture, sampler } = samplerTexture;
    const { location, textureID } = uniformInfo;

    // 设置纹理所在采样编号
    gl.uniform1i(location, textureID);
    //
    const webGLTexture = getTexture(gl, texture);
    gl.activeTexture(gl[`TEXTURE${textureID}`]);
    // 绑定纹理
    gl.bindTexture(gl[webGLTexture.textureTarget], webGLTexture);

    // 运行采样器
    runSampler(gl, webGLTexture, sampler, textureID);

    return webGLTexture;
}
