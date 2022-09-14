import { Texture } from '../data/Texture';
import { TextureDataType } from './enums/TextureDataType';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLProperties } from './WebGLProperties';

/**
 * WebGL纹理
 */
export class WebGLTextures
{
    gl: WebGLRenderingContext;
    extensions: WebGLExtensions;
    capabilities: WebGLCapabilities;
    properties: WebGLProperties;

    /**
     * 此处用于缓存，需要获取有效数据请调用 Attribute.getBuffer
     */
    private textures = new WeakMap<Texture, WebGLTexture>();

    constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions, capabilities: WebGLCapabilities, properties: WebGLProperties)
    {
        this.gl = gl;
        this.extensions = extensions;
        this.capabilities = capabilities;
        this.properties = properties;
    }

    active(data: Texture)
    {
        const { gl } = this;

        const texture = this.getTexture(data);

        const textureType = gl[data.textureType];

        // 绑定纹理
        gl.bindTexture(textureType, texture);

        this.setTextureParameters(data);

        return texture;
    }

    private setTextureParameters(texture: Texture)
    {
        const { gl, extensions, capabilities, properties } = this;

        const textureType = gl[texture.textureType];

        // 设置纹理参数
        gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl[texture.minFilter]);
        gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl[texture.magFilter]);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl[texture.wrapS]);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl[texture.wrapT]);

        if (extensions.has('EXT_texture_filter_anisotropic') === true)
        {
            const extension = extensions.get('EXT_texture_filter_anisotropic');

            if (texture.type === TextureDataType.FLOAT && extensions.has('OES_texture_float_linear') === false) return; // verify extension for WebGL 1 and WebGL 2
            if (capabilities.isWebGL2 === false && (texture.type === TextureDataType.HALF_FLOAT && extensions.has('OES_texture_half_float_linear') === false)) return; // verify extension for WebGL 1 only

            if (texture.anisotropy > 1 || properties.get(texture).__currentAnisotropy)
            {
                gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, capabilities.maxAnisotropy));
                properties.get(texture).__currentAnisotropy = texture.anisotropy;
            }
        }
    }

    /**
     * 获取顶点属性缓冲
     * @param data 数据
     */
    private getTexture(data: Texture)
    {
        const { gl, textures } = this;

        if (data.invalid)
        {
            this.clear(data);
            data.invalid = false;
        }
        let texture = textures.get(data);
        if (!texture)
        {
            texture = gl.createTexture(); // Create a texture object
            if (!texture)
            {
                console.error('createTexture 失败！');
                throw '';
            }
            textures.set(data, texture);

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
    private clear(data: Texture)
    {
        const { gl, textures } = this;

        const tex = textures.get(data);
        if (tex)
        {
            gl.deleteTexture(tex);
            textures.delete(data);
        }
    }
}
