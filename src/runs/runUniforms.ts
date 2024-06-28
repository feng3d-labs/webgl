import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { WebGLUniformType } from "../const/WebGLUniformType";
import { RenderAtomic } from "../data/RenderAtomic";
import { lazy } from "../types";

/**
 * 激活常量
 */
export function runUniforms(gl: WebGLRenderingContext, renderAtomic: RenderAtomic)
{
    const shaderResult = getCompileShaderResult(gl, renderAtomic.pipeline);

    for (const name in shaderResult.uniforms)
    {
        const activeInfo = shaderResult.uniforms[name];
        const paths = activeInfo.paths;
        let uniformData = lazy.getValue(renderAtomic.uniforms[paths[0]], renderAtomic.uniforms);
        for (let i = 1; i < paths.length; i++)
        {
            uniformData = uniformData[paths[i]];
        }
        if (uniformData === undefined)
        {
            console.error(`沒有找到Uniform ${name} 數據！`);
        }
        setContext3DUniform(gl, activeInfo, uniformData);
    }
}

/**
 * 设置环境Uniform数据
 */
function setContext3DUniform(gl: WebGLRenderingContext, webGLUniform: WebGLUniform, data)
{
    const { _textures } = gl;

    let vec: number[] = data;
    if (data.toArray) vec = data.toArray();
    const location = webGLUniform.location;
    switch (webGLUniform.type)
    {
        case "BOOL":
        case "INT":
            gl.uniform1i(location, data);
            break;
        case "FLOAT_MAT3":
            gl.uniformMatrix3fv(location, false, vec);
            break;
        case "FLOAT_MAT4":
            gl.uniformMatrix4fv(location, false, vec);
            break;
        case "FLOAT":
            gl.uniform1f(location, data);
            break;
        case "FLOAT_VEC2":
            gl.uniform2f(location, vec[0], vec[1]);
            break;
        case "FLOAT_VEC3":
            gl.uniform3f(location, vec[0], vec[1], vec[2]);
            break;
        case "FLOAT_VEC4":
            gl.uniform4f(location, vec[0], vec[1], vec[2], vec[3]);
            break;
        case "SAMPLER_2D":
        case "SAMPLER_CUBE":
            _textures.active(data, webGLUniform);
            break;
        default:
            console.error(`无法识别的uniform类型 ${webGLUniform.activeInfo.name} ${data}`);
    }
}

/**
 * WebGL统一变量
 */
export interface WebGLUniform
{
    /**
     * WebGL激活信息。
     */
    activeInfo: WebGLActiveInfo;

    /**
     * WebGL中Uniform类型
     */
    type: WebGLUniformType;

    /**
     * uniform地址
     */
    location: WebGLUniformLocation;

    /**
     * texture索引
     */
    textureID: number;

    /**
     * Uniform数组索引，当Uniform数据为数组数据时生效
     */
    paths: string[];
}