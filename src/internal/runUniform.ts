import { UniformItemInfo } from '../caches/getGLProgram';
import { GLUniformBufferType } from '../const/GLUniformType';

/**
 * 设置环境Uniform数据
 */
export function runUniform(gl: WebGLRenderingContext, type: GLUniformBufferType, uniformInfo: UniformItemInfo, data: any)
{
    if (typeof data === 'number')
    {
        data = [data];
    }
    if (data.toArray) data = data.toArray();
    const location = uniformInfo.location;
    switch (type)
    {
        case 'BOOL':
        case 'INT':
            gl.uniform1iv(location, data);
            break;
        case 'BOOL_VEC2':
        case 'INT_VEC2':
            gl.uniform2iv(location, data);
            break;
        case 'BOOL_VEC3':
        case 'INT_VEC3':
            gl.uniform3iv(location, data);
            break;
        case 'BOOL_VEC4':
        case 'INT_VEC4':
            gl.uniform4iv(location, data);
            break;
        case 'FLOAT':
            gl.uniform1fv(location, [data]);
            break;
        case 'FLOAT_VEC2':
            gl.uniform2fv(location, data);
            break;
        case 'FLOAT_VEC3':
            gl.uniform3fv(location, data);
            break;
        case 'FLOAT_VEC4':
            gl.uniform4fv(location, data);
            break;
        case 'FLOAT_MAT2':
            gl.uniformMatrix2fv(location, false, data);
            break;
        case 'FLOAT_MAT3':
            gl.uniformMatrix3fv(location, false, data);
            break;
        case 'FLOAT_MAT4':
            gl.uniformMatrix4fv(location, false, data);
            break;
        case 'UNSIGNED_INT':
            (gl as any as WebGL2RenderingContext).uniform1uiv(location, data);
            break;
        case 'UNSIGNED_INT_VEC2':
            (gl as any as WebGL2RenderingContext).uniform2uiv(location, data);
            break;
        case 'UNSIGNED_INT_VEC3':
            (gl as any as WebGL2RenderingContext).uniform3uiv(location, data);
            break;
        case 'UNSIGNED_INT_VEC4':
            (gl as any as WebGL2RenderingContext).uniform4uiv(location, data);
            break;
        case 'FLOAT_MAT2x3':
            (gl as any as WebGL2RenderingContext).uniformMatrix2x3fv(location, false, data);
            break;
        case 'FLOAT_MAT2x4':
            (gl as any as WebGL2RenderingContext).uniformMatrix2x4fv(location, false, data);
            break;
        case 'FLOAT_MAT3x2':
            (gl as any as WebGL2RenderingContext).uniformMatrix3x2fv(location, false, data);
            break;
        case 'FLOAT_MAT3x4':
            (gl as any as WebGL2RenderingContext).uniformMatrix3x4fv(location, false, data);
            break;
        case 'FLOAT_MAT4x2':
            (gl as any as WebGL2RenderingContext).uniformMatrix4x2fv(location, false, data);
            break;
        case 'FLOAT_MAT4x3':
            (gl as any as WebGL2RenderingContext).uniformMatrix4x3fv(location, false, data);
            break;
        default:
            console.error(`无法识别的uniform类型 ${uniformInfo.paths} ${type}`);
    }
}

