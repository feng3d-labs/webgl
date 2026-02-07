import { IAddressMode, IFilterMode, Sampler } from '@feng3d/render-api';
import { getGLCompareFunction } from '../runs/getGLCompareFunction';

export type GLSamplerCompareMode = 'NONE' | 'COMPARE_REF_TO_TEXTURE';

export function getGLSampler(gl: WebGLRenderingContext, sampler?: Sampler)
{
    let webGLSampler = gl._samplers.get(sampler);
    if (webGLSampler) return webGLSampler;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLSampler = gl.createSampler();
        gl._samplers.set(sampler, webGLSampler);

        const minFilter: GLTextureMinFilter = getIGLTextureMinFilter(sampler.minFilter, sampler.mipmapFilter);
        const magFilter: GLTextureMagFilter = getIGLTextureMagFilter(sampler.magFilter);
        const wrapS: GLTextureWrap = getIGLTextureWrap(sampler.addressModeU);
        const wrapT: GLTextureWrap = getIGLTextureWrap(sampler.addressModeV);
        const wrapR: GLTextureWrap = getIGLTextureWrap(sampler.addressModeW);
        const lodMinClamp = sampler.lodMinClamp || 0;
        const lodMaxClamp = sampler.lodMaxClamp || 16;
        const compareMode: GLSamplerCompareMode = sampler.compare ? 'COMPARE_REF_TO_TEXTURE' : 'NONE';
        const compare = getGLCompareFunction(sampler.compare ?? 'less-equal');

        //
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_MIN_FILTER, gl[minFilter]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_MAG_FILTER, gl[magFilter]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_S, gl[wrapS]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_T, gl[wrapT]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_R, gl[wrapR]);
        gl.samplerParameterf(webGLSampler, gl.TEXTURE_MIN_LOD, lodMinClamp);
        gl.samplerParameterf(webGLSampler, gl.TEXTURE_MAX_LOD, lodMaxClamp);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_COMPARE_MODE, gl[compareMode]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_COMPARE_FUNC, gl[compare]);
    }

    return webGLSampler;
}

export function deleteSampler(gl: WebGLRenderingContext, sampler?: Sampler)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLSampler = gl._samplers.get(sampler);
        gl._samplers.delete(sampler);
        gl.deleteSampler(webGLSampler);
    }
}

/**
 * 纹理坐标s包装函数枚举
 * Wrapping function for texture coordinate s
 *
 * * `REPEAT`
 * * `CLAMP_TO_EDGE`
 * * `MIRRORED_REPEAT`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type GLTextureWrap = 'REPEAT' | 'CLAMP_TO_EDGE' | 'MIRRORED_REPEAT';

export function getIGLTextureWrap(addressMode: IAddressMode = 'repeat')
{
    const textureWrap: GLTextureWrap = addressModeMap[addressMode];

    console.assert(!!textureWrap, `接收到错误值，请从 ${Object.keys(addressModeMap).toString()} 中取值！`);

    return textureWrap;
}

const addressModeMap: { [key: string]: GLTextureWrap } = {
    'clamp-to-edge': 'CLAMP_TO_EDGE',
    repeat: 'REPEAT',
    'mirror-repeat': 'MIRRORED_REPEAT',
};

/**
 * 纹理缩小过滤器
 * Texture minification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 * * `NEAREST_MIPMAP_NEAREST`
 * * `LINEAR_MIPMAP_NEAREST`
 * * `NEAREST_MIPMAP_LINEAR`
 * * `LINEAR_MIPMAP_LINEAR`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type GLTextureMinFilter = 'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR';

export function getIGLTextureMinFilter(minFilter: IFilterMode = 'nearest', mipmapFilter?: IFilterMode): GLTextureMinFilter
{
    let glMinFilter: GLTextureMinFilter;
    if (minFilter === 'linear')
    {
        if (mipmapFilter === 'linear')
        {
            glMinFilter = 'LINEAR_MIPMAP_LINEAR';
        }
        else if (mipmapFilter === 'nearest')
        {
            glMinFilter = 'LINEAR_MIPMAP_NEAREST';
        }
        else
        {
            glMinFilter = 'LINEAR';
        }
    }
    else
    {
        if (mipmapFilter === 'linear')
        {
            glMinFilter = 'NEAREST_MIPMAP_LINEAR';
        }
        else if (mipmapFilter === 'nearest')
        {
            glMinFilter = 'NEAREST_MIPMAP_NEAREST';
        }
        else
        {
            glMinFilter = 'NEAREST';
        }
    }

    return glMinFilter;
}
/**
 * 纹理放大滤波器
 * Texture magnification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type GLTextureMagFilter = 'LINEAR' | 'NEAREST';

export function getIGLTextureMagFilter(magFilter: IFilterMode = 'nearest')
{
    const glMagFilter: GLTextureMagFilter = magFilterMap[magFilter];

    console.assert(!!glMagFilter, `接收到错误值，请从 ${Object.keys(magFilterMap).toString()} 中取值！`);

    return glMagFilter;
}

const magFilterMap: { [key: string]: GLTextureMagFilter } = {
    nearest: 'NEAREST',
    linear: 'LINEAR',
};