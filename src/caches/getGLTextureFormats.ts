import { TextureFormat } from '@feng3d/render-api';

export function getGLTextureFormats(format: TextureFormat = 'rgba8unorm')
{
    const glTextureFormat: GLTextureFormats = formatMap[format];

    console.assert(!!glTextureFormat, `未处理格式 ${format}；或者WebGL不支持纹理， 该格式只在WebGPU中支持！`);

    return glTextureFormat;
}

export interface GLTextureFormats
{
    /**
     * 内部纹理格式。
     *
     * 默认 "RGBA"。
     */
    readonly internalformat?: GLTextureInternalFormat,

    /**
     * 纹理格式。
     *
     * 默认 "RGBA"。
     */
    readonly format?: GLTextureFormat;

    /**
     * 数据类型。
     *
     * 默认 "UNSIGNED_BYTE"。
     */
    readonly type?: GLTextureDataType;
}

const formatMap: { [key: string]: GLTextureFormats } = {
    r8unorm: { internalformat: 'R8', format: 'RED', type: 'UNSIGNED_BYTE' },
    r8snorm: undefined,
    r8uint: { internalformat: 'R8', format: 'RED', type: 'UNSIGNED_BYTE' },
    r8sint: undefined,
    r16uint: undefined,
    r16sint: undefined,
    r16float: { internalformat: 'R16F', format: 'RED', type: 'HALF_FLOAT' },
    rg8unorm: { internalformat: 'RG8', format: 'RG', type: 'UNSIGNED_BYTE' },
    rg8snorm: undefined,
    rg8uint: { internalformat: 'RG8UI', format: 'RG_INTEGER', type: 'UNSIGNED_BYTE' },
    rg8sint: undefined,
    r32uint: undefined,
    r32sint: undefined,
    r32float: { internalformat: 'R32F', format: 'RED', type: 'FLOAT' },
    rg16uint: undefined,
    rg16sint: undefined,
    rg16float: { internalformat: 'RG16F', format: 'RG', type: 'HALF_FLOAT' },
    rgba8unorm: { internalformat: 'RGBA8', format: 'RGBA', type: 'UNSIGNED_BYTE' },
    'rgba8unorm-srgb': { internalformat: 'SRGB8_ALPHA8', format: 'RGBA', type: 'UNSIGNED_BYTE' },
    rgba8snorm: undefined,
    rgba8uint: { internalformat: 'RGBA8UI', format: 'RGBA_INTEGER', type: 'UNSIGNED_BYTE' },
    rgba8sint: undefined,
    bgra8unorm: { internalformat: 'RGBA8', format: 'RGBA', type: 'UNSIGNED_BYTE' }, // WebGL不支持bgra8unorm，但WebGPU支持。navigator.gpu.getPreferredCanvasFormat() 返回的是 bgra8unorm, 暂时使用RGBA8代替，解决一部分问题。（参考 示例 https://github.com/feng3d-labs/tsl/tree/master/examples/src/fractalCube/index.ts）
    'bgra8unorm-srgb': undefined,
    rgb9e5ufloat: { internalformat: 'RGB9_E5', format: 'RGB', type: 'HALF_FLOAT' },
    rgb10a2uint: undefined,
    rgb10a2unorm: { internalformat: 'RGB10_A2', format: 'RGBA', type: 'UNSIGNED_INT_2_10_10_10_REV' },
    rg11b10ufloat: { internalformat: 'R11F_G11F_B10F', format: 'RGB', type: 'UNSIGNED_INT_10F_11F_11F_REV' },
    rg32uint: undefined,
    rg32sint: undefined,
    rg32float: { internalformat: 'RG32F', format: 'RG', type: 'FLOAT' },
    rgba16uint: undefined,
    rgba16sint: undefined,
    rgba16float: { internalformat: 'RGBA16F', format: 'RGBA', type: 'HALF_FLOAT' },
    rgba32uint: undefined,
    rgba32sint: undefined,
    rgba32float: { internalformat: 'RGBA32F', format: 'RGBA', type: 'FLOAT' },
    stencil8: undefined,
    depth16unorm: { internalformat: 'DEPTH_COMPONENT16', format: 'DEPTH_COMPONENT', type: 'UNSIGNED_SHORT' },
    depth24plus: undefined,
    'depth24plus-stencil8': undefined,
    depth32float: undefined,
    'depth32float-stencil8': undefined,
    'bc1-rgba-unorm': undefined,
    'bc1-rgba-unorm-srgb': undefined,
    'bc2-rgba-unorm': undefined,
    'bc2-rgba-unorm-srgb': undefined,
    'bc3-rgba-unorm': undefined,
    'bc3-rgba-unorm-srgb': undefined,
    'bc4-r-unorm': undefined,
    'bc4-r-snorm': undefined,
    'bc5-rg-unorm': undefined,
    'bc5-rg-snorm': undefined,
    'bc6h-rgb-ufloat': undefined,
    'bc6h-rgb-float': undefined,
    'bc7-rgba-unorm': undefined,
    'bc7-rgba-unorm-srgb': undefined,
    'etc2-rgb8unorm': undefined,
    'etc2-rgb8unorm-srgb': undefined,
    'etc2-rgb8a1unorm': undefined,
    'etc2-rgb8a1unorm-srgb': undefined,
    'etc2-rgba8unorm': undefined,
    'etc2-rgba8unorm-srgb': undefined,
    'eac-r11unorm': undefined,
    'eac-r11snorm': undefined,
    'eac-rg11unorm': undefined,
    'eac-rg11snorm': undefined,
    'astc-4x4-unorm': undefined,
    'astc-4x4-unorm-srgb': undefined,
    'astc-5x4-unorm': undefined,
    'astc-5x4-unorm-srgb': undefined,
    'astc-5x5-unorm': undefined,
    'astc-5x5-unorm-srgb': undefined,
    'astc-6x5-unorm': undefined,
    'astc-6x5-unorm-srgb': undefined,
    'astc-6x6-unorm': undefined,
    'astc-6x6-unorm-srgb': undefined,
    'astc-8x5-unorm': undefined,
    'astc-8x5-unorm-srgb': undefined,
    'astc-8x6-unorm': undefined,
    'astc-8x6-unorm-srgb': undefined,
    'astc-8x8-unorm': undefined,
    'astc-8x8-unorm-srgb': undefined,
    'astc-10x5-unorm': undefined,
    'astc-10x5-unorm-srgb': undefined,
    'astc-10x6-unorm': undefined,
    'astc-10x6-unorm-srgb': undefined,
    'astc-10x8-unorm': undefined,
    'astc-10x8-unorm-srgb': undefined,
    'astc-10x10-unorm': undefined,
    'astc-10x10-unorm-srgb': undefined,
    'astc-12x10-unorm': undefined,
    'astc-12x10-unorm-srgb': undefined,
    'astc-12x12-unorm': undefined,
    'astc-12x12-unorm-srgb': undefined,
};

/**
 * internalformat	format	type
 *
 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
 */
type GLTextureTypes =
    | { internalformat: 'RGB', format: 'RGB', type: 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' }
    | { internalformat: 'RGBA', format: 'RGBA', type: 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_4_4_4_4' | 'UNSIGNED_SHORT_5_5_5_1' }
    | { internalformat: 'LUMINANCE_ALPHA', format: 'LUMINANCE_ALPHA', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'LUMINANCE', format: 'LUMINANCE', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'ALPHA', format: 'ALPHA', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'R8', format: 'RED', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'R16F', format: 'RED', type: 'HALF_FLOAT' | ' FLOAT' }
    | { internalformat: 'R32F', format: 'RED', type: 'FLOAT' }
    | { internalformat: 'R8UI', format: 'RED_INTEGER', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RG8', format: 'RG', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RG16F', format: 'RG', type: 'HALF_FLOAT' | 'FLOAT' }
    | { internalformat: 'RG32F', format: 'RG', type: 'FLOAT' }
    | { internalformat: 'RG8UI', format: 'RG_INTEGER', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RGB8', format: 'RGB', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'SRGB8', format: 'RGB', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RGB565', format: 'RGB', type: 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' }
    | { internalformat: 'R11F_G11F_B10F', format: 'RGB', type: 'UNSIGNED_INT_10F_11F_11F_REV' | 'HALF_FLOAT' | 'FLOAT' }
    | { internalformat: 'RGB9_E5', format: 'RGB', type: 'HALF_FLOAT' | 'FLOAT' }
    | { internalformat: 'RGB16F', format: 'RGB', type: 'HALF_FLOAT' | 'FLOAT' }
    | { internalformat: 'RGB32F', format: 'RGB', type: 'FLOAT' }
    | { internalformat: 'RGB8UI', format: 'RGB_INTEGER', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RGBA8', format: 'RGBA', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'SRGB8_ALPHA8', format: 'RGBA', type: 'UNSIGNED_BYTE' }
    | { internalformat: 'RGB5_A1', format: 'RGBA', type: 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_5_5_1' }
    | { internalformat: 'RGB10_A2', format: 'RGBA', type: 'UNSIGNED_INT_2_10_10_10_REV' }
    | { internalformat: 'RGBA4', format: 'RGBA', type: 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_4_4_4_4' }
    | { internalformat: 'RGBA16F', format: 'RGBA', type: 'HALF_FLOAT' | 'FLOAT' }
    | { internalformat: 'RGBA32F', format: 'RGBA', type: 'FLOAT' }
    | { internalformat: 'RGBA8UI', format: 'RGBA_INTEGER', type: 'UNSIGNED_BYTE' }
    // 深度纹理
    | { internalformat: 'DEPTH_COMPONENT16', format: 'DEPTH_COMPONENT', type: 'UNSIGNED_SHORT', }
    ;

export type GLTextureInternalFormat = GLTextureTypes['internalformat'];
export type GLTextureFormat = GLTextureTypes['format'];
export type GLTextureDataType = GLTextureTypes['type'];
