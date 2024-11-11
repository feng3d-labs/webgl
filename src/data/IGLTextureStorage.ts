/**
 * 初始纹理时指定纹理存储的各个级别。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage3D
 */
export interface IGLTextureStorage
{
    levels: number, width: number, height: number;
    /**
     * 3D纹理深度。
     */
    depth?: number
}