import { getWebGLTexture } from "../caches/getWebGLTexture";
import { IBufferSource, IImageSource, ITexture, ITextureSource } from "../data/ITexture";
import { defaultSampler, runSampler } from "./runSampler";
import { WebGLUniform } from "./runUniforms";

export const defaultImageSource: IImageSource = Object.freeze({ level: 0, internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE" }) as any;
export const defaultBufferSource: IBufferSource = Object.freeze({ level: 0, internalformat: "RGBA", width: 1, height: 1, border: 0, format: "RGBA", type: "UNSIGNED_BYTE" });
export const defaultTextureSources: ITextureSource[] = Object.freeze([defaultBufferSource]) as any;
export const defaultTexture: ITexture = Object.freeze({ textureTarget: "TEXTURE_2D", generateMipmap: true, flipY: false, premulAlpha: false, sampler: defaultSampler, sources: defaultTextureSources });

export function runTexture(gl: WebGLRenderingContext, texture: ITexture, activeInfo: WebGLUniform)
{
    gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);

    const webGLTexture = getWebGLTexture(gl, texture);
    // 设置纹理所在采样编号
    gl.uniform1i(activeInfo.location, activeInfo.textureID);

    runSampler(gl, webGLTexture, texture);

    return webGLTexture;
}
