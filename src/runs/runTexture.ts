import { getTexture } from "../caches/getTexture";
import { ISamplerTexture } from "../data/ISamplerTexture";
import { IBufferSource, IImageSource, ITexture, ITextureSource } from "../data/ITexture";
import { runSampler } from "./runSampler";
import { WebGLUniform } from "./runUniforms";

export const defaultImageSource: IImageSource = { level: 0, source: new ImageData(1, 1) };
export const defaultBufferSource: IBufferSource = { level: 0, width: 1, height: 1, depth: 1, border: 0 };
export const defaultTextureSources: ITextureSource[] = [defaultBufferSource];
export const defaultTexture: ITexture = { textureTarget: "TEXTURE_2D", generateMipmap: false, flipY: false, premulAlpha: false, sources: defaultTextureSources, internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE" };

Object.freeze(defaultImageSource);
Object.freeze(defaultBufferSource);
Object.freeze(defaultTextureSources);
Object.freeze(defaultTexture);

export function runSamplerTexture(gl: WebGLRenderingContext, samplerTexture: ISamplerTexture, activeInfo: WebGLUniform)
{
    const { texture, sampler } = samplerTexture;

    // 设置纹理所在采样编号
    gl.uniform1i(activeInfo.location, activeInfo.textureID);
    //
    const webGLTexture = getTexture(gl, texture);
    gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);
    // 绑定纹理
    gl.bindTexture(gl[webGLTexture.textureTarget], webGLTexture);

    // 运行采样器
    runSampler(gl, webGLTexture, sampler, activeInfo.textureID);

    return webGLTexture;
}
