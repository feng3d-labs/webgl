import { getProgram } from "../caches/getProgram";
import { WebGLUniformType } from "../const/WebGLUniformType";
import { IRenderObject } from "../data/IRenderObject";
import { lazy } from "../types";
import { runTexture } from "./runTexture";

/**
 * 激活常量
 */
export function runUniforms(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const shaderResult = getProgram(gl, renderAtomic.pipeline);

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
        runUniform(gl, activeInfo, uniformData);
    }
}

/**
 * 设置环境Uniform数据
 */
function runUniform(gl: WebGLRenderingContext, webGLUniform: WebGLUniform, data: any)
{
    const location = webGLUniform.location;
    switch (webGLUniform.type)
    {
        case "BOOL":
        case "INT":
            gl.uniform1i(location, data);
            break;
        case "FLOAT_MAT3":
            gl.uniformMatrix3fv(location, false, data);
            break;
        case "FLOAT_MAT4":
            gl.uniformMatrix4fv(location, false, data);
            break;
        case "FLOAT":
            gl.uniform1f(location, data);
            break;
        case "FLOAT_VEC2":
            gl.uniform2f(location, data[0], data[1]);
            break;
        case "FLOAT_VEC3":
            gl.uniform3f(location, data[0], data[1], data[2]);
            break;
        case "FLOAT_VEC4":
            gl.uniform4f(location, data[0], data[1], data[2], data[3]);
            break;
        case "SAMPLER_2D":
        case "SAMPLER_CUBE":
            runTexture(gl, data, webGLUniform);
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