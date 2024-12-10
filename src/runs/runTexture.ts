import { getGLTexture } from "../caches/getGLTexture";
import { IGLSamplerTexture } from "../data/IGLSamplerTexture";
import { IUniformItemInfo } from "../data/IGLUniformInfo";
import { runSampler } from "./runSampler";

export function runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: IUniformItemInfo, samplerTexture: IGLSamplerTexture)
{
    const { texture, sampler } = samplerTexture;
    const { location, textureID } = uniformInfo;

    // 设置纹理所在采样编号
    gl.uniform1i(location, textureID);
    //
    const webGLTexture = getGLTexture(gl, texture);
    gl.activeTexture(gl[`TEXTURE${textureID}`]);
    // 绑定纹理
    gl.bindTexture(gl[webGLTexture.textureTarget], webGLTexture);

    // 运行采样器
    runSampler(gl, webGLTexture, sampler, textureID);

    return webGLTexture;
}
