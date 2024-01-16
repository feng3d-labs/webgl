import { Texture } from '../data/Texture';
import { TextureTarget } from '../gl/WebGLEnums';

declare module '../data/Texture'
{
    interface TextureMap extends Texture2DMap { }
}

export interface Texture2DMap
{
    Texture2D: Texture2D;
}

export type Texture2DLike = Texture2DMap[keyof Texture2DMap];

declare module '../data/Uniforms'
{
    interface UniformTypeMap
    {
        texture2D: Texture2D;
        texture2DArray: Texture2D[];
    }
}

/**
 * 2D纹理
 */
export abstract class Texture2D extends Texture
{
    textureTarget: TextureTarget = 'TEXTURE_2D';
}

