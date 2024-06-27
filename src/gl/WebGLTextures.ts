import { WebGLRenderer } from '../WebGLRenderer';
import { Texture } from '../data/Texture';
import { TextureMagFilter, TextureMinFilter, TextureWrap } from './WebGLEnums';
import { WebGLUniform } from './WebGLUniforms';

/**
 * WebGL纹理
 */
export class WebGLTextures
{
    private _webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this._webGLRenderer = webGLRenderer;
    }

    /**
     * 此处用于缓存
     */
    private _texturesCache = new WeakMap<Texture, {
        texture: WebGLTexture,
        version: number,
        minFilter?: TextureMinFilter,
        magFilter?: TextureMagFilter,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        anisotropy?: number,
    }>();

    active(data: Texture, activeInfo?: WebGLUniform)
    {
        const { gl } = this._webGLRenderer;

        if (activeInfo)
        {
            // 激活纹理编号
            gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);
        }

        const texture = this.get(data);

        // 绑定纹理
        gl.bindTexture(gl[data.textureTarget], texture);

        this.setTextureParameters(data);

        if (activeInfo)
        {
            // 设置纹理所在采样编号
            gl.uniform1i(activeInfo.location, activeInfo.textureID);
        }

        return texture;
    }

    private setTextureParameters(texture: Texture)
    {
        const { capabilities, gl } = this._webGLRenderer;
        const { _texturesCache: textures } = this;

        const { textureTarget, type, minFilter, magFilter, wrapS, wrapT, anisotropy } = texture;

        const cache = textures.get(texture);

        // 设置纹理参数
        if (cache.minFilter !== minFilter)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_MIN_FILTER, gl[minFilter]);
            cache.minFilter = minFilter;
        }
        if (cache.magFilter !== magFilter)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_MAG_FILTER, gl[magFilter]);
            cache.magFilter = magFilter;
        }
        if (cache.wrapS !== wrapS)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_S, gl[wrapS]);
            cache.wrapS = wrapS;
        }
        if (cache.wrapT !== wrapT)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_T, gl[wrapT]);
            cache.wrapT = wrapT;
        }

        if (cache.anisotropy !== anisotropy)
        {
            const extension = gl.getExtension('EXT_texture_filter_anisotropic');
            if (extension)
            {
                const ext1 = gl.getExtension('OES_texture_float_linear');

                if (type === 'FLOAT' && !ext1) return; // verify extension for WebGL 1 and WebGL 2
                // verify extension for WebGL 1 only
                if (!(gl instanceof WebGL2RenderingContext) && type === 'HALF_FLOAT')
                {
                    const ext2 = gl.getExtension('OES_texture_half_float_linear');
                    if (!ext2)
                    {
                        return;
                    }
                }

                if (anisotropy > 1)
                {
                    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
                    gl.texParameterf(gl[textureTarget], ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, capabilities.maxAnisotropy));
                }
            }
            cache.anisotropy = anisotropy;
        }
    }

    /**
     * 获取顶点属性缓冲
     * @param data 数据
     */
    get(data: Texture)
    {
        const { gl } = this._webGLRenderer;
        const { _texturesCache: textures } = this;

        let cache = textures.get(data);
        if (cache && data.version !== cache.version)
        {
            this.clear(data);
            cache = null;
        }
        if (!cache)
        {
            const texture = gl.createTexture(); // Create a texture object

            // 设置图片y轴方向
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, data.flipY);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, data.premulAlpha);
            // 绑定纹理
            gl.bindTexture(gl[data.textureTarget], texture);

            // 设置纹理图片
            data.setTextureData(this._webGLRenderer);

            if (data.generateMipmap)
            {
                gl.generateMipmap(gl[data.textureTarget]);
            }

            cache = { texture, version: data.version };
            textures.set(data, cache);
        }

        return cache.texture;
    }

    /**
     * 清除纹理
     */
    private clear(data: Texture)
    {
        const { gl } = this._webGLRenderer;
        const { _texturesCache: textures } = this;

        const tex = textures.get(data);
        if (tex)
        {
            gl.deleteTexture(tex.texture);
            textures.delete(data);
        }
    }
}
