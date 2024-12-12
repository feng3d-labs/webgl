import { IRenderPipeline } from "@feng3d/render-api";
import { getGLBuffer } from "../caches/getGLBuffer";
import { getGLProgram } from "../caches/getGLProgram";
import { IGLUniformBufferType } from "../const/IGLUniformType";
import { IGLBuffer } from "../data/IGLBuffer";
import { IGLSamplerTexture } from "../data/IGLSamplerTexture";
import { IUniformItemInfo } from "../data/IGLUniformInfo";
import { IGLUniforms } from "../data/IGLUniforms";
import { LazyObject, lazy } from "../types";
import { runSamplerTexture } from "./runTexture";

/**
 * 激活常量
 */
export function runUniforms(gl: WebGLRenderingContext, pipeline: IRenderPipeline, uniforms: LazyObject<IGLUniforms>)
{
    const webGLProgram = getGLProgram(gl, pipeline);

    webGLProgram.uniforms.forEach((uniformInfo) =>
    {
        const { name, type, items, isTexture, inBlock } = uniformInfo;
        if (inBlock) return;

        items.forEach((v) =>
        {
            const { paths } = v;

            let uniformData = lazy.getValue(uniforms[paths[0]], uniforms);
            for (let i = 1; i < paths.length; i++)
            {
                uniformData = uniformData[paths[i]];
            }
            if (uniformData === undefined)
            {
                console.error(`沒有找到Uniform ${name} 數據！`);
            }

            if (isTexture)
            {
                runSamplerTexture(gl, v, uniformData as IGLSamplerTexture);
            }
            else
            {
                runUniform(gl, type as IGLUniformBufferType, v, uniformData);
            }
        });
    });

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLProgram.uniformBlocks.forEach((uniformBlock) =>
        {
            const { name, index } = uniformBlock;
            const uniformData = lazy.getValue(uniforms[name], uniforms);

            //
            const webGLBuffer = getGLBuffer(gl, uniformData as IGLBuffer);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, index, webGLBuffer);
        });
    }
}

/**
 * 设置环境Uniform数据
 */
function runUniform(gl: WebGLRenderingContext, type: IGLUniformBufferType, uniformInfo: IUniformItemInfo, data: any)
{
    const location = uniformInfo.location;
    switch (type)
    {
        case "BOOL":
        case "INT":
            // gl.uniform1i(location, data);
            gl.uniform1iv(location, [data]);
            break;
        case "BOOL_VEC2":
        case "INT_VEC2":
            // gl.uniform2i(location, data[0], data[1]);
            gl.uniform2iv(location, data);
            break;
        case "BOOL_VEC3":
        case "INT_VEC3":
            // gl.uniform3i(location, data[0], data[1], data[2]);
            gl.uniform3iv(location, data);
            break;
        case "BOOL_VEC4":
        case "INT_VEC4":
            // gl.uniform4i(location, data[0], data[1], data[2], data[3]);
            gl.uniform4iv(location, data);
            break;
        case "FLOAT":
            // gl.uniform1f(location, data);
            gl.uniform1fv(location, [data]);
            break;
        case "FLOAT_VEC2":
            // gl.uniform2f(location, data[0], data[1]);
            gl.uniform2fv(location, data);
            break;
        case "FLOAT_VEC3":
            // gl.uniform3f(location, data[0], data[1], data[2]);
            gl.uniform3fv(location, data);
            break;
        case "FLOAT_VEC4":
            // gl.uniform4f(location, data[0], data[1], data[2], data[3]);
            gl.uniform4fv(location, data);
            break;
        case "FLOAT_MAT2":
            gl.uniformMatrix2fv(location, false, data);
            break;
        case "FLOAT_MAT3":
            gl.uniformMatrix3fv(location, false, data);
            break;
        case "FLOAT_MAT4":
            gl.uniformMatrix4fv(location, false, data);
            break;
        case "UNSIGNED_INT":
            (gl as any as WebGL2RenderingContext).uniform1ui(location, data);
            (gl as any as WebGL2RenderingContext).uniform1uiv(location, [data]);
            break;
        case "UNSIGNED_INT_VEC2":
            // (gl as any as WebGL2RenderingContext).uniform2ui(location, data[0], data[1]);
            (gl as any as WebGL2RenderingContext).uniform2uiv(location, data);
            break;
        case "UNSIGNED_INT_VEC3":
            // (gl as any as WebGL2RenderingContext).uniform3ui(location, data[0], data[1], data[2]);
            (gl as any as WebGL2RenderingContext).uniform3uiv(location, data);
            break;
        case "UNSIGNED_INT_VEC4":
            // (gl as any as WebGL2RenderingContext).uniform4ui(location, data[0], data[1], data[2], data[3]);
            (gl as any as WebGL2RenderingContext).uniform4uiv(location, data);
            break;
        case "FLOAT_MAT2x3":
            (gl as any as WebGL2RenderingContext).uniformMatrix2x3fv(location, false, data);
            break;
        case "FLOAT_MAT2x4":
            (gl as any as WebGL2RenderingContext).uniformMatrix2x4fv(location, false, data);
            break;
        case "FLOAT_MAT3x2":
            (gl as any as WebGL2RenderingContext).uniformMatrix3x2fv(location, false, data);
            break;
        case "FLOAT_MAT3x4":
            (gl as any as WebGL2RenderingContext).uniformMatrix3x4fv(location, false, data);
            break;
        case "FLOAT_MAT4x2":
            (gl as any as WebGL2RenderingContext).uniformMatrix4x2fv(location, false, data);
            break;
        case "FLOAT_MAT4x3":
            (gl as any as WebGL2RenderingContext).uniformMatrix4x3fv(location, false, data);
            break;
        default:
            console.error(`无法识别的uniform类型 ${uniformInfo.paths} ${type}`);
    }
}
