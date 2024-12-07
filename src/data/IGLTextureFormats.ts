import { IGLTextureDataType, IGLTextureFormat, IGLTextureInternalFormat } from "./IGLTexture";

export interface IGLTextureFormats
{
    /**
     * 内部纹理格式。
     *
     * 默认 "RGBA"。
     */
    readonly internalformat?: IGLTextureInternalFormat,

    /**
     * 纹理格式。
     *
     * 默认 "RGBA"。
     */
    readonly format?: IGLTextureFormat;

    /**
     * 数据类型。
     *
     * 默认 "UNSIGNED_BYTE"。
     */
    readonly type?: IGLTextureDataType;
}