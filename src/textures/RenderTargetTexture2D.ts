import { Vector2 } from "@feng3d/math";
import { mathUtil } from "@feng3d/polyfill";
import { watcher } from "@feng3d/watcher";
import { WebGLRenderer } from "../WebGLRenderer";
import { TextureFormat, TextureMagFilter, TextureMinFilter } from "../gl/WebGLEnums";
import { Texture2D } from "./Texture2D";

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
        if (this.width === 0 || !mathUtil.isPowerOfTwo(this.width))
        {
            return false;
        }
        if (this.height === 0 || !mathUtil.isPowerOfTwo(this.height))
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
        return new Vector2(this.width, this.height);
    }

    setTextureData(webGLRenderer: WebGLRenderer): void
    {
        const { gl } = webGLRenderer;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[this.format], this.width, this.height, 0, gl[this.format], gl[this.type], null);
    }
}
