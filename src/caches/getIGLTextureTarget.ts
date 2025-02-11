import { ITextureDimension } from "@feng3d/render-api";
import { IGLTextureTarget } from "../data/IGLTexture";

export function getIGLTextureTarget(dimension: ITextureDimension = "2d")
{
    const target: IGLTextureTarget = dimensionMap[dimension];

    console.assert(!!target, `WebGL 不支持纹理维度 ${dimension} , 该维度只在WebGPU中支持！`);

    return target;
}
const dimensionMap: { [key: string]: IGLTextureTarget } = {
    "1d": undefined,
    "2d": "TEXTURE_2D",
    "2d-array": "TEXTURE_2D_ARRAY",
    "cube": "TEXTURE_CUBE_MAP",
    "cube-array": undefined,
    "3d": "TEXTURE_3D",
};