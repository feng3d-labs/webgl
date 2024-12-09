import { TextureCubeMapTarget } from "../data/IGLTexture";

export function getTextureCubeMapTarget(depthOrArrayLayers: number)
{
    const textureCubeMapTarget: TextureCubeMapTarget = textureCubeMapTargetMap[depthOrArrayLayers];

    console.assert(!!textureCubeMapTarget, `CubeMap的depthOrArrayLayers值应在[0-5]之间！`);

    return textureCubeMapTarget;
}

const textureCubeMapTargetMap: TextureCubeMapTarget[] = [
    "TEXTURE_CUBE_MAP_POSITIVE_X",
    "TEXTURE_CUBE_MAP_NEGATIVE_X",
    "TEXTURE_CUBE_MAP_POSITIVE_Y",
    "TEXTURE_CUBE_MAP_NEGATIVE_Y",
    "TEXTURE_CUBE_MAP_POSITIVE_Z",
    "TEXTURE_CUBE_MAP_NEGATIVE_Z",
];