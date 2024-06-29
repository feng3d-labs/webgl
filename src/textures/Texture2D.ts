import { watcher } from "@feng3d/watcher";
import { Texture, TextureTarget } from "../data/Texture";

declare module "../data/Uniforms"
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
export class Texture2D extends Texture
{
    textureTarget: TextureTarget = "TEXTURE_2D";

    /**
     * One of the following objects can be used as a pixel source for the texture.
     */
    source: TexImageSource;

    constructor()
    {
        super();
        watcher.watch(this as Texture2D, "source", this.invalidate, this);
    }

    setTextureData(gl: WebGLRenderingContext)
    {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[this.format], gl[this.format], gl[this.type], this.source);
    }

    getSize()
    {
        return { x: this.source?.["width"] || 0, y: this.source?.["height"] || 0 };
    }
}
