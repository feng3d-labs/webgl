import { watcher } from "@feng3d/watcher";
import { TextureDataType, TextureFormat, TextureMagFilter, TextureMinFilter, TextureTarget, TextureWrap } from "../gl/WebGLEnums";

/**
 * 纹理
 */
export abstract class Texture
{
    name: string;

    /**
     * 纹理类型
     */
    textureTarget: TextureTarget;

    /**
     * 格式
     */
    format: TextureFormat = "RGBA";

    /**
     * 数据类型
     */
    type: TextureDataType = "UNSIGNED_BYTE";

    /**
     * 是否生成mipmap
     */
    generateMipmap = true;

    /**
     * 对图像进行Y轴反转。默认值为false
     */
    flipY = false;

    /**
     * 将图像RGB颜色值得每一个分量乘以A。默认为false
     */
    premulAlpha = false;

    minFilter: TextureMinFilter = "LINEAR_MIPMAP_LINEAR";

    magFilter: TextureMagFilter = "LINEAR";

    /**
     * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
     */
    wrapS: TextureWrap = "REPEAT";

    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式。
     */
    wrapT: TextureWrap = "REPEAT";

    /**
     * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为1。
     */
    anisotropy = 1;

    /**
     * 是否失效，值为true时重新创建 WebGLTexture
     */
    version = 0;

    constructor()
    {
        watcher.watch(this as Texture, "format", this.invalidate, this);
        watcher.watch(this as Texture, "type", this.invalidate, this);
        watcher.watch(this as Texture, "generateMipmap", this.invalidate, this);
        watcher.watch(this as Texture, "flipY", this.invalidate, this);
        watcher.watch(this as Texture, "premulAlpha", this.invalidate, this);
    }

    /**
     * 使纹理失效
     */
    invalidate()
    {
        this.version++;
    }

    abstract setTextureData(gl: WebGLRenderingContext): void;

    /**
     * 纹理尺寸。
     */
    abstract getSize(): { x: number, y: number };
}
