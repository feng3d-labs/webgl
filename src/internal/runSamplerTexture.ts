import { Sampler } from "@feng3d/render-api";
import { getGLProgram, UniformItemInfo } from "../caches/getGLProgram";
import { getGLTextureTarget } from "../caches/getGLTextureTarget";
import { getGLTexture } from "../internal";
import { SamplerTexture } from "../data/SamplerTexture";
import { runSampler } from "./runSampler";

export function runSamplerTexture(gl: WebGLRenderingContext, uniformInfo: UniformItemInfo, samplerTexture: SamplerTexture)
{
    const { texture, sampler } = samplerTexture;
    const { location, textureID } = uniformInfo;

    const textureTarget = getGLTextureTarget(texture.dimension);

    // 设置纹理所在采样编号
    gl.uniform1i(location, textureID);
    //
    const webGLTexture = getGLTexture(gl, texture);
    gl.activeTexture(gl[`TEXTURE${textureID}`]);
    // 绑定纹理
    gl.bindTexture(gl[textureTarget], webGLTexture);

    // 运行采样器
    runSampler(gl, textureTarget, webGLTexture, sampler, textureID);

    return webGLTexture;
}

