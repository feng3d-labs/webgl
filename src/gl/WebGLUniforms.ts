import { RenderAtomic } from '../data/RenderAtomic';
import { UniformInfo } from '../data/Shader';
import { Texture } from '../data/Texture';
import { WebGLCache } from './WebGLCache';
import { WebGLTextures } from './WebGLTextures';

/**
 * WebGL统一变量
 */
export class WebGLUniforms
{
    gl: WebGLRenderingContext;

    /**
     * WebGL纹理
     */
    textures: WebGLTextures;

    cache: WebGLCache;

    constructor(gl: WebGLRenderingContext, textures: WebGLTextures, cache: WebGLCache)
    {
        this.gl = gl;
        this.textures = textures;
        this.cache = cache;
    }

    /**
     * 激活常量
     */
    activeUniforms(renderAtomic: RenderAtomic, uniformInfos: { [name: string]: UniformInfo })
    {
        for (const name in uniformInfos)
        {
            const activeInfo = uniformInfos[name];
            const paths = activeInfo.paths;
            let uniformData = renderAtomic.getUniformByKey(paths[0]);
            for (let i = 1; i < paths.length; i++)
            {
                uniformData = uniformData[paths[i]];
            }
            this.setContext3DUniform(activeInfo, uniformData);
        }
    }

    /**
     * 设置环境Uniform数据
     */
    private setContext3DUniform(activeInfo: UniformInfo, data)
    {
        const { gl, textures, cache } = this;

        let vec: number[] = data;
        if (data.toArray) vec = data.toArray();
        const location = activeInfo.location;
        switch (activeInfo.type)
        {
            case gl.BOOL:
            case gl.INT:
                gl.uniform1i(location, data);
                break;
            case gl.FLOAT_MAT3:
                gl.uniformMatrix3fv(location, false, vec);
                break;
            case gl.FLOAT_MAT4:
                gl.uniformMatrix4fv(location, false, vec);
                break;
            case gl.FLOAT:
                gl.uniform1f(location, data);
                break;
            case gl.FLOAT_VEC2:
                gl.uniform2f(location, vec[0], vec[1]);
                break;
            case gl.FLOAT_VEC3:
                gl.uniform3f(location, vec[0], vec[1], vec[2]);
                break;
            case gl.FLOAT_VEC4:
                gl.uniform4f(location, vec[0], vec[1], vec[2], vec[3]);
                break;
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                const textureInfo = data as Texture;
                // 激活纹理编号
                gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);
                textures.active(textureInfo, cache);
                // 设置纹理所在采样编号
                gl.uniform1i(location, activeInfo.textureID);
                break;
            default:
                console.error(`无法识别的uniform类型 ${activeInfo.name} ${data}`);
        }
    }
}
