import { Texture } from '../data/Texture';
import { WebGLRenderer } from '../WebGLRenderer';
import { GL } from './GL';
import { WebGLExtensions } from './WebGLExtensions';

/**
 * WebGL纹理
 */
export class WebGLTextures
{
    gl: GL;
    extensions: WebGLExtensions;

    constructor(gl: GL, extensions: WebGLExtensions)
    {
        this.gl = gl;
        this.extensions = extensions;
    }

    active(data: Texture)
    {
        const { gl } = this;

        const texture = WebGLTextures.getTexture(gl, data);

        const textureType = gl[data.textureType];

        // 绑定纹理
        gl.bindTexture(textureType, texture);
        // 设置纹理参数
        gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl[data.minFilter]);
        gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl[data.magFilter]);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl[data.wrapS]);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl[data.wrapT]);

        //
        gl.texParameterfAnisotropy(textureType, data.anisotropy);
        // if()

        return texture;
    }

    /**
     * 获取顶点属性缓冲
     * @param data 数据
     */
    static getTexture(gl: GL, data: Texture)
    {
        if (data.invalid)
        {
            this.clear(data);
            data.invalid = false;
        }
        let texture = gl.cache.textures.get(data);
        if (!texture)
        {
            texture = gl.createTexture(); // Create a texture object
            if (!texture)
            {
                console.error('createTexture 失败！');
                throw '';
            }
            gl.cache.textures.set(data, texture);

            //
            const textureType = gl[data.textureType];
            const format = gl[data.format];
            const type = gl[data.type];

            // 设置图片y轴方向
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, data.flipY ? 1 : 0);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, data.premulAlpha ? 1 : 0);
            // 绑定纹理
            gl.bindTexture(textureType, texture);
            // 设置纹理图片
            switch (textureType)
            {
                case gl.TEXTURE_CUBE_MAP:
                    const pixels: TexImageSource[] = data.activePixels as any;
                    const faces = [
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                    ];
                    for (let i = 0; i < faces.length; i++)
                    {
                        if (data.isRenderTarget)
                        {
                            gl.texImage2D(faces[i], 0, format, data.OFFSCREEN_WIDTH, data.OFFSCREEN_HEIGHT, 0, format, type, null);
                        }
                        else
                        {
                            gl.texImage2D(faces[i], 0, format, format, type, pixels[i]);
                        }
                    }
                    break;
                case gl.TEXTURE_2D:
                    const _pixel: TexImageSource = data.activePixels as any;
                    if (data.isRenderTarget)
                    {
                        gl.texImage2D(textureType, 0, format, data.OFFSCREEN_WIDTH, data.OFFSCREEN_HEIGHT, 0, format, type, null);
                    }
                    else
                    {
                        gl.texImage2D(textureType, 0, format, format, type, _pixel);
                    }
                    break;
                default:
                    throw '';
            }
            if (data.generateMipmap)
            {
                gl.generateMipmap(textureType);
            }
        }

        return texture;
    }

    /**
     * 清除纹理
     *
     * @param data
     */
    static clear(data: Texture)
    {
        WebGLRenderer.glList.forEach((gl) =>
        {
            const tex = gl.cache.textures.get(data);
            if (tex)
            {
                gl.deleteTexture(tex);
                gl.cache.textures.delete(data);
            }
        });
    }
}
