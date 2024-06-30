import { getWebGLTexture } from "../caches/getWebGLTexture";
import { IBufferSource, IImageSource, ITexture, ITextureSource } from "../data/ITexture";
import { defaultSampler, runSampler } from "./runSampler";
import { WebGLUniform } from "./runUniforms";

export const defaultImageSource: IImageSource = { level: 0, source: new ImageData(1, 1) };
export const defaultBufferSource: IBufferSource = { level: 0, width: 1, height: 1, border: 0 };
export const defaultTextureSources: ITextureSource[] = [defaultBufferSource];
export const defaultTexture: ITexture = { textureTarget: "TEXTURE_2D", generateMipmap: false, flipY: false, premulAlpha: false, sampler: defaultSampler, sources: defaultTextureSources, internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE" };

Object.freeze(defaultImageSource);
Object.freeze(defaultBufferSource);
Object.freeze(defaultTextureSources);
Object.freeze(defaultTexture);

export function runTexture(gl: WebGLRenderingContext, texture: ITexture, activeInfo: WebGLUniform)
{
    gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);

    const webGLTexture = getWebGLTexture(gl, texture);
    // 设置纹理所在采样编号
    gl.uniform1i(activeInfo.location, activeInfo.textureID);

    runSampler(gl, webGLTexture, texture);

    return webGLTexture;
}
