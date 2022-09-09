import { BufferAttribute } from './Index';

export interface Attributes
{
    /**
     * 坐标
     */
    a_position: BufferAttribute;

    /**
     * 颜色
     */
    a_color: BufferAttribute;

    /**
     * 法线
     */
    a_normal: BufferAttribute;

    /**
     * 切线
     */
    a_tangent: BufferAttribute;

    /**
     * uv（纹理坐标）
     */
    a_uv: BufferAttribute;

    /**
     * 关节索引
     */
    a_skinIndices: BufferAttribute;

    /**
     * 关节权重
     */
    a_skinWeights: BufferAttribute;

    /**
     * 关节索引
     */
    a_skinIndices1: BufferAttribute;

    /**
     * 关节权重
     */
    a_skinWeights1: BufferAttribute;

    [attributeName: string]: BufferAttribute;
}
