import { watcher } from "@feng3d/watcher";
import { isPowerOfTwo } from "../utils/mathUtils";
import { Texture2D } from "./Texture2D";
import { TextureFormat, TextureMinFilter, TextureMagFilter } from "../data/Texture";

/**
 * 渲染目标纹理
 */
export class RenderTargetTexture2D extends Texture2D
{
    width = 1024;

    height = 1024;

    format: TextureFormat = "RGBA";

    minFilter: TextureMinFilter = "NEAREST";

    magFilter: TextureMagFilter = "NEAREST";

    /**
     * 是否为2的幂贴图
     */
    get isPowerOfTwo()
    {
        if (this.width === 0 || !isPowerOfTwo(this.width))
        {
            return false;
        }
        if (this.height === 0 || !isPowerOfTwo(this.height))
        {
            return false;
        }

        return true;
    }

    constructor()
    {
        super();
        watcher.watch(this as RenderTargetTexture2D, "width", this.invalidate, this);
        watcher.watch(this as RenderTargetTexture2D, "height", this.invalidate, this);
    }

    /**
     * 纹理尺寸
     */
    getSize()
    {
        return { x: this.width, y: this.height };
    }

    setTextureData(gl: WebGLRenderingContext): void
    {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[this.format], this.width, this.height, 0, gl[this.format], gl[this.type], null);
    }
}
