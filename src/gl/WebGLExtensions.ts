/* eslint-disable camelcase */
import { GL } from './GL';
import { WebGLCapabilities } from './WebGLCapabilities';

declare global
{
    interface WebGLExtensionMap
    {
        'EXT_blend_minmax': EXT_blend_minmax | null;
        'EXT_color_buffer_float': EXT_color_buffer_float | null;
        'EXT_color_buffer_half_float': EXT_color_buffer_half_float | null;
        'EXT_float_blend': EXT_float_blend | null;
        'EXT_texture_filter_anisotropic': EXT_texture_filter_anisotropic | null;
        'EXT_frag_depth': EXT_frag_depth | null;
        'EXT_shader_texture_lod': EXT_shader_texture_lod | null;
        'EXT_sRGB': EXT_sRGB | null;
        'KHR_parallel_shader_compile': KHR_parallel_shader_compile | null;
        'OES_vertex_array_object': OES_vertex_array_object | null;
        'OVR_multiview2': OVR_multiview2 | null;
        'WEBGL_color_buffer_float': WEBGL_color_buffer_float | null;
        'WEBGL_compressed_texture_astc': WEBGL_compressed_texture_astc | null;
        'WEBGL_compressed_texture_etc': WEBGL_compressed_texture_etc | null;
        'WEBGL_compressed_texture_etc1': WEBGL_compressed_texture_etc1 | null;
        'WEBGL_compressed_texture_s3tc_srgb': WEBGL_compressed_texture_s3tc_srgb | null;
        'WEBGL_debug_shaders': WEBGL_debug_shaders | null;
        'WEBGL_draw_buffers': WEBGL_draw_buffers | null;
        'WEBGL_lose_context': WEBGL_lose_context | null;
        'WEBGL_depth_texture': WEBGL_depth_texture | null;
        'WEBGL_debug_renderer_info': WEBGL_debug_renderer_info | null;
        'WEBGL_compressed_texture_s3tc': WEBGL_compressed_texture_s3tc | null;
        'OES_texture_half_float_linear': OES_texture_half_float_linear | null;
        'OES_texture_half_float': OES_texture_half_float | null;
        'OES_texture_float_linear': OES_texture_float_linear | null;
        'OES_texture_float': OES_texture_float | null;
        'OES_standard_derivatives': OES_standard_derivatives | null;
        'OES_element_index_uint': OES_element_index_uint | null;
        'ANGLE_instanced_arrays': ANGLE_instanced_arrays | null;
        'WEBGL_multisampled_render_to_texture': null;
    }
}

/**
 * GL扩展
 */
export class WebGLExtensions
{
    private gl: GL;
    private extensions: { [extensionName: string]: any } = {};

    constructor(gl: GL)
    {
        this.gl = gl;
        console.assert(!gl.extensions, `${gl} ${gl.extensions} 存在！`);
        gl.extensions = this;

        this.cacheGLQuery(gl);
    }

    init(capabilities: WebGLCapabilities)
    {
        if (capabilities.isWebGL2)
        {
            this.getExtension('EXT_color_buffer_float');
        }
        else
        {
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_vertex_array_object');
            this.getExtension('ANGLE_instanced_arrays');
        }

        this.getExtension('OES_texture_float_linear');
        this.getExtension('EXT_color_buffer_half_float');
        this.getExtension('WEBGL_multisampled_render_to_texture');
        //
        this.wrap(this.gl);
    }

    /**
     * 判断是否存在指定WebGL扩展。
     *
     * @param name WebGL扩展名称。
     * @returns 是否存在指定WebGL扩展。
     */
    has<K extends keyof WebGLExtensionMap>(name: K): boolean
    {
        return this.getExtension(name) !== null;
    }

    /**
     * 获取指定WebGL扩展。
     *
     * @param name WebGL扩展名称。
     * @returns 返回指定WebGL扩展。
     */
    get<K extends keyof WebGLExtensionMap>(name: K): WebGLExtensionMap[K]
    {
        const extension = this.getExtension(name);

        if (extension === null)
        {
            console.warn(`WebGLRenderer: ${name} extension not supported.`);
        }

        return extension;
    }

    private getExtension<K extends keyof WebGLExtensionMap>(name: K): WebGLExtensionMap[K]
    {
        const { gl, extensions } = this;
        if (extensions[name] !== undefined)
        {
            return extensions[name];
        }

        let extension: WebGLExtensionMap[K];

        switch (name)
        {
            case 'WEBGL_depth_texture':
                extension = gl.getExtension('WEBGL_depth_texture') || gl.getExtension('MOZ_WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture');
                break;

            case 'EXT_texture_filter_anisotropic':
                extension = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
                break;

            case 'WEBGL_compressed_texture_s3tc':
                extension = gl.getExtension('WEBGL_compressed_texture_s3tc') || gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
                break;

            case 'WEBGL_compressed_texture_pvrtc':
                extension = gl.getExtension('WEBGL_compressed_texture_pvrtc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
                break;

            default:
                extension = gl.getExtension(name);
        }

        extensions[name] = extension;

        return extension;
    }

    /**
     * 缓存GL查询
     * @param gl GL实例
     */
    private cacheGLQuery(gl: GL)
    {
        const oldGetExtension = gl.getExtension;
        gl.getExtension = function (name: string)
        {
            if (!gl.extensions[name])
            {
                // eslint-disable-next-line prefer-rest-params
                gl.extensions[name] = oldGetExtension.apply(gl, arguments);
            }

            return gl.extensions[name];
        };
    }

    private wrap(gl: GL)
    {
        //
        if (!gl.vertexAttribDivisor)
        {
            gl.vertexAttribDivisor = (index, divisor) =>
            {
                if (this.has('ANGLE_instanced_arrays'))
                {
                    this.get('ANGLE_instanced_arrays').vertexAttribDivisorANGLE(index, divisor);
                }
                else
                {
                    console.warn(`浏览器 不支持 drawElementsInstanced ！`);
                }
            };
        }
        if (!gl.drawElementsInstanced)
        {
            gl.drawElementsInstanced = (mode, count, type, offset, instanceCount) =>
            {
                if (this.has('ANGLE_instanced_arrays'))
                {
                    this.get('ANGLE_instanced_arrays').drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
                }
                else
                {
                    console.warn(`浏览器 不支持 drawElementsInstanced ！`);
                }
            };
        }
        if (!gl.drawArraysInstanced)
        {
            gl.drawArraysInstanced = (mode, first, count, instanceCount) =>
            {
                if (this.has('ANGLE_instanced_arrays'))
                {
                    this.get('ANGLE_instanced_arrays').drawArraysInstancedANGLE(mode, first, count, instanceCount);
                }
                else
                {
                    console.warn(`浏览器 不支持 drawArraysInstanced ！`);
                }
            };
        }
    }
}
