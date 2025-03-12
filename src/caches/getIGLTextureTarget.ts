import { TextureDimension } from "@feng3d/render-api";

/**
 * 纹理绑定点。
 *
 * * gl.TEXTURE_2D: A two-dimensional texture.
 * * gl.TEXTURE_CUBE_MAP: A cube-mapped texture.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.TEXTURE_3D: A three-dimensional texture.
 * * gl.TEXTURE_2D_ARRAY: A two-dimensional array texture.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 */
export type GLTextureTarget = "TEXTURE_2D" | "TEXTURE_CUBE_MAP" | "TEXTURE_3D" | "TEXTURE_2D_ARRAY";


export function getIGLTextureTarget(dimension: TextureDimension = "2d")
{
    const target: GLTextureTarget = dimensionMap[dimension];

    console.assert(!!target, `WebGL 不支持纹理维度 ${dimension} , 该维度只在WebGPU中支持！`);

    return target;
}

const dimensionMap: { [key: string]: GLTextureTarget } = {
    "1d": undefined,
    "2d": "TEXTURE_2D",
    "2d-array": "TEXTURE_2D_ARRAY",
    cube: "TEXTURE_CUBE_MAP",
    "cube-array": undefined,
    "3d": "TEXTURE_3D",
};