/**
 * WebGL中Uniform类型
 */
export type IWebGLUniformType = keyof typeof webGLUniformTypeValue;

/**
 * WebGL中Uniform纹理类型
 */
export type IWebGLUniformTextureType = keyof typeof webGLUniformTextureTypeValue;

/**
 * WebGL中Uniform缓冲区类型
 */
export type IWebGLUniformBufferType = keyof typeof webGLUniformBufferTypeValue;

/**
 * 获取Unifrom类型名称
 *
 * @param value WebGL中Unifrom类型对应的值。
 * @returns Unifrom类型名称
 */
export function getWebGLUniformType(value: number)
{
    const result = webGLUniformValueType[value] as IWebGLUniformType;
    console.assert(!!result);

    return result;
}

/**
 * 判断是否为纹理Unifrom类型。
 *
 * @param type Unifrom类型名称
 * @returns 是否为纹理Unifrom类型。
 */
export function isWebGLUniformTextureType(type: IWebGLUniformType): boolean
{
    return webGLUniformTextureTypeValue[type] !== undefined;
}

/**
 * WebGL中Uniform类型对应数值
 */
export class WebGLUniformTypeUtils
{
    /**
     * 获取WebGL中Unifrom类型对应的值。
     *
     * @param type Unifrom类型名称
     * @returns WebGL中Unifrom类型对应的值。
     */
    static getValue(type: IWebGLUniformType): number
    {
        const result = webGLUniformTypeValue[type];
        console.assert(!!result);

        return result as any;
    }
}

/**
 * WebGL1 缓冲区数据类型。
 */
const webGL1UniformBufferTypeValue = { FLOAT: 5126, FLOAT_VEC2: 35664, FLOAT_VEC3: 35665, FLOAT_VEC4: 35666, INT: 5124, INT_VEC2: 35667, INT_VEC3: 35668, INT_VEC4: 35669, BOOL: 35670, BOOL_VEC2: 35671, BOOL_VEC3: 35672, BOOL_VEC4: 35673, FLOAT_MAT2: 35674, FLOAT_MAT3: 35675, FLOAT_MAT4: 35676 };
/**
 * WebGL1 纹理数据类型。
 */
const webGL1UniformTextureTypeValue = { SAMPLER_2D: 35678, SAMPLER_CUBE: 35680 };

/**
 * 仅 WebGL2 缓冲区数据类型。
 */
const webGL2OnlyUniformBufferTypeValue = { UNSIGNED_INT: 5125, UNSIGNED_INT_VEC2: 36294, UNSIGNED_INT_VEC3: 36295, UNSIGNED_INT_VEC4: 36296, FLOAT_MAT2x3: 35685, FLOAT_MAT2x4: 35686, FLOAT_MAT3x2: 35687, FLOAT_MAT3x4: 35688, FLOAT_MAT4x2: 35689, FLOAT_MAT4x3: 35690 };
/**
 * 仅 WebGL2 纹理数据类型。
 */
const webGL2OnlyUniformTextureTypeValue = { SAMPLER_3D: 35679, SAMPLER_2D_SHADOW: 35682, SAMPLER_2D_ARRAY: 36289, SAMPLER_2D_ARRAY_SHADOW: 36292, SAMPLER_CUBE_SHADOW: 36293, INT_SAMPLER_2D: 36298, INT_SAMPLER_3D: 36299, INT_SAMPLER_CUBE: 36300, INT_SAMPLER_2D_ARRAY: 36303, UNSIGNED_INT_SAMPLER_2D: 36306, UNSIGNED_INT_SAMPLER_3D: 36307, UNSIGNED_INT_SAMPLER_CUBE: 36308, UNSIGNED_INT_SAMPLER_2D_ARRAY: 36311 };

/**
 * WebGL Uniform 类型与值的映射。
 */
const webGLUniformTypeValue = { ...webGL1UniformBufferTypeValue, ...webGL1UniformTextureTypeValue, ...webGL2OnlyUniformBufferTypeValue, ...webGL2OnlyUniformTextureTypeValue };

/**
 * WebGL Uniform 纹理类型与值的映射。
 */
const webGLUniformTextureTypeValue = { ...webGL1UniformTextureTypeValue, ...webGL2OnlyUniformTextureTypeValue };

/**
 * WebGL Uniform 纹理类型与值的映射。
 */
const webGLUniformBufferTypeValue = { ...webGL1UniformBufferTypeValue, ...webGL2OnlyUniformBufferTypeValue };

/**
 * WebGL Uniform 值与类型的映射。
 */
const webGLUniformValueType = Object.keys(webGLUniformTypeValue).reduce((pv, cv) =>
{
    pv[webGLUniformTypeValue[cv]] = cv;

    return pv;
}, {});

/**
 * 顶点索引数据类型对应的字节数量。
 */
export const ElementTypeMap = {
    UNSIGNED_BYTE: 1,
    UNSIGNED_SHORT: 2,
    UNSIGNED_INT: 4,
};