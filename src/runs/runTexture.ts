import { getTexture } from "../caches/getTexture";
import { ISamplerTexture } from "../data/ISamplerTexture";
import { IBufferSource, IImageSource, ITexture, ITexturePixelStore, ITextureSource } from "../data/ITexture";
import { IUniformItemInfo } from "../data/IUniformInfo";
import { runSampler } from "./runSampler";

export const defaultImageSource: IImageSource = { level: 0, source: new ImageData(1, 1) };
export const defaultBufferSource: IBufferSource = { level: 0, width: 1, height: 1, depth: 1, border: 0 };
export const defaultTextureSources: ITextureSource[] = [defaultBufferSource];
export const defaultTexture: ITexture = { target: "TEXTURE_2D", generateMipmap: false, internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE" };

Object.freeze(defaultImageSource);
Object.freeze(defaultBufferSource);
Object.freeze(defaultTextureSources);
Object.freeze(defaultTexture);

export function runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: IUniformItemInfo, samplerTexture: ISamplerTexture)
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
