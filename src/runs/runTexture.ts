import { getWebGLTexture } from "../caches/getWebGLTexture";
import { ITexture } from "../data/ITexture";
import { defaultSampler, runSampler } from "./runSampler";
import { WebGLUniform } from "./runUniforms";

export const defaultTexture: ITexture = { textureTarget: "TEXTURE_2D", format: "RGBA", type: "UNSIGNED_BYTE", generateMipmap: true, flipY: false, premulAlpha: false, sampler: defaultSampler };

export function runTexture(gl: WebGLRenderingContext, texture: ITexture, activeInfo: WebGLUniform)
{
    gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);

    const webGLTexture = getWebGLTexture(gl, texture);
    // 设置纹理所在采样编号
    gl.uniform1i(activeInfo.location, activeInfo.textureID);

    runSampler(gl, webGLTexture, texture);

    return webGLTexture;
}
