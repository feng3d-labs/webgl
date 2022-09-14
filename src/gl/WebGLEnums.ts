/**
 * 渲染模式，默认 TRIANGLES，每三个顶点绘制一个三角形。
 *
 * * POINTS 绘制单个点。
 * * LINE_LOOP 绘制循环连线。
 * * LINE_STRIP 绘制连线
 * * LINES 每两个顶点绘制一条线段。
 * * TRIANGLES 每三个顶点绘制一个三角形。
 * * TRIANGLE_STRIP 绘制三角形条带。
 * * TRIANGLE_FAN  绘制三角扇形。
 *
 * A GLenum specifying the type primitive to render. Possible values are:
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export type RenderMode = 'POINTS' | 'LINE_LOOP' | 'LINE_STRIP' | 'LINES' | 'TRIANGLES' | 'TRIANGLE_STRIP' | 'TRIANGLE_FAN';

/**
 * 剔除面，默认 BACK，剔除背面。
 *
 * 默认情况下，逆时针的顶点连接顺序被定义为三角形的正面。
 * 使用gl.frontFace(gl.CW);调整顺时针为正面
 *
 * * NONE 关闭裁剪面
 * * FRONT 正面
 * * BACK 背面
 * * FRONT_AND_BACK 正面与背面
 *
 * @see http://www.jianshu.com/p/ee04165f2a02
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 */
export type CullFace = 'NONE' | 'FRONT' | 'BACK' | 'FRONT_AND_BACK';

/**
 * 正面方向枚举
 *
 * * CW 顺时钟方向
 * * CCW 逆时钟方向
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
export type FrontFace = 'CW' | 'CCW';

/**
 * 混合方法
 *
 * * FUNC_ADD 源 + 目标
 * * FUNC_SUBTRACT 源 - 目标
 * * FUNC_REVERSE_SUBTRACT 目标 - 源
 * * MIN 源与目标的最小值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MIN_EXT 值。
 * * MAX 源与目标的最大值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MAX_EXT 值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 */
export type BlendEquation = 'FUNC_ADD' | 'FUNC_SUBTRACT' | 'FUNC_REVERSE_SUBTRACT' | 'MIN' | 'MAX';

/**
 * 混合因子（R分量系数，G分量系数，B分量系数）
 *
 * 混合颜色的公式可以这样描述：color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor)。这里的 RGBA 值均在0与1之间。
 *
 * The formula for the blending color can be described like this: color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor). The RBGA values are between 0 and 1.
 *
 * * `ZERO` Factor: (0,0,0,0); 把所有颜色都乘以0。
 * * `ONE` Factor: (1,1,1,1); 把所有颜色都乘以1。
 * * `SRC_COLOR` Factor: (Rs, Gs, Bs, As); 将所有颜色乘以源颜色。
 * * `ONE_MINUS_SRC_COLOR` Factor: (1-Rs, 1-Gs, 1-Bs, 1-As); 将所有颜色乘以1减去每个源颜色。
 * * `DST_COLOR` Factor: (Rd, Gd, Bd, Ad); 将所有颜色乘以目标颜色。
 * * `ONE_MINUS_DST_COLOR` Factor: (1-Rd, 1-Gd, 1-Bd, 1-Ad); 将所有颜色乘以1减去每个目标颜色。
 * * `SRC_ALPHA` Factor: (As, As, As, As); 将所有颜色乘以源alpha值。
 * * `ONE_MINUS_SRC_ALPHA` Factor: (1-As, 1-As, 1-As, 1-As); 将所有颜色乘以1减去源alpha值。
 * * `DST_ALPHA` Factor: (Ad, Ad, Ad, Ad); 将所有颜色乘以目标alpha值。
 * * `ONE_MINUS_DST_ALPHA` Factor: (1-Ad, 1-Ad, 1-Ad, 1-Ad); 将所有颜色乘以1减去目标alpha值。
 * * `CONSTANT_COLOR` Factor: (Rc, Gc, Bc, Ac); 将所有颜色乘以一个常数颜色。
 * * `ONE_MINUS_CONSTANT_COLOR` Factor: (1-Rc, 1-Gc, 1-Bc, 1-Ac); 所有颜色乘以1减去一个常数颜色。
 * * `CONSTANT_ALPHA` Factor: (Ac, Ac, Ac, Ac); 将所有颜色乘以一个常量alpha值。
 * * `ONE_MINUS_CONSTANT_ALPHA` Factor: (1-Ac, 1-Ac, 1-Ac, 1-Ac); 将所有颜色乘以1减去一个常数alpha值。
 * * `SRC_ALPHA_SATURATE` Factor: (min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad), 1); 将RGB颜色乘以源alpha值与1减去目标alpha值的较小值。alpha值乘以1。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 */
export type BlendFactor = 'ZERO' | 'ONE' | 'SRC_COLOR' | 'ONE_MINUS_SRC_COLOR' | 'DST_COLOR' | 'ONE_MINUS_DST_COLOR' | 'SRC_ALPHA' | 'ONE_MINUS_SRC_ALPHA' | 'DST_ALPHA' | 'ONE_MINUS_DST_ALPHA' | 'SRC_ALPHA_SATURATE';
/**
 * 指定深度比较函数的枚举，该函数设置绘制像素的条件，默认 LESS，如果传入值小于深度缓冲区值则通过。
 *
 * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果传入值小于深度缓冲区值则通过。
 * * `EQUAL` 如果传入值等于深度缓冲区值则通过。
 * * `LEQUAL` 如果传入值小于或等于深度缓冲区值则通过。
 * * `GREATER` 如果传入值大于深度缓冲区值则通过。
 * * `NOTEQUAL` 如果传入值不等于深度缓冲区值则通过。
 * * `GEQUAL` 如果传入值大于或等于深度缓冲区值则通过。
 * * `ALWAYS` 总是通过。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 */
export type DepthFunc = 'NEVER' | 'LESS' | 'EQUAL' | 'LEQUAL' | 'GREATER' | 'NOTEQUAL' | 'GEQUAL' | 'ALWAYS';

/**
 * A GLenum specifying the test function. The default function is gl.ALWAYS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果 (ref & mask) <  (stencil & mask) 则通过。
 * * `EQUAL` 如果 (ref & mask) = (stencil & mask) 则通过。
 * * `LEQUAL` 如果 (ref & mask) <= (stencil & mask) 则通过。
 * * `GREATER` 如果 (ref & mask) > (stencil & mask) 则通过。
 * * `NOTEQUAL` 如果 (ref & mask) != (stencil & mask) 则通过。
 * * `GEQUAL` 如果 (ref & mask) >= (stencil & mask) 则通过。
 * * `ALWAYS` 总是通过。
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
 */
export type StencilFunc = 'NEVER' | 'LESS' | 'EQUAL' | 'LEQUAL' | 'GREATER' | 'NOTEQUAL' | 'GEQUAL' | 'ALWAYS';
/**
 * The WebGLRenderingContext.stencilOp() method of the WebGL API sets both the front and back-facing stencil test actions.
 *
 * * `KEEP` 保持当前值。
 * * `ZERO` 设置模板缓冲值为0
 * * `REPLACE` 将模板缓冲区的值设置为WebGLRenderingContext.stencilFunc()指定的参考值。
 * * `INCR` 增加当前模板缓冲区的值。最大到可表示的无符号值的最大值。
 * * `INCR_WRAP` 增加当前模板缓冲区的值。当增加最大的可表示无符号值时，将模板缓冲区值包装为零。
 * * `DECR` 递减当前模板缓冲区的值。最小为0。
 * * `DECR_WRAP` 递减当前模板缓冲区的值。当模板缓冲区值减为0时，将模板缓冲区值包装为可表示的最大无符号值。
 * * `INVERT` 按位反转当前模板缓冲区值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
 */
export type StencilOp = 'KEEP' | 'ZERO' | 'REPLACE' | 'INCR' | 'INCR_WRAP' | 'DECR' | 'DECR_WRAP' | 'INVERT';

/**
 * A GLenum specifying the intended usage pattern of the data store for optimization purposes.
 *
 * 指定数据存储区的使用方法。
 *
 * * `STATIC_DRAW` 内容由应用程序指定一次，并多次用作WebGL绘图和图像规范命令的源。缓冲区的内容可能经常使用，而不会经常更改。内容被写入缓冲区，但不被读取。
 * * `DYNAMIC_DRAW` 这些内容将由应用程序反复重新指定，并多次用作WebGL绘图和图像规范命令的源。
 * * `STREAM_DRAW` 内容由应用程序指定一次，最多几次用作WebGL绘图和图像规范命令的源。
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/bufferData
 */
export type AttributeUsage = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW';

/**
 * 纹理数据类型
 * A GLenum specifying the data type of the texel data
 *
 * * `UNSIGNED_BYTE` 8 bits per channel for gl.RGBA
 * * `UNSIGNED_SHORT_5_6_5` 5 red bits, 6 green bits, 5 blue bits.
 * * `UNSIGNED_SHORT_4_4_4_4` 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
 * * `UNSIGNED_SHORT_5_5_5_1` 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
 * * `UNSIGNED_SHORT` When using the WEBGL_depth_texture extension:
 * * `UNSIGNED_INT` When using the WEBGL_depth_texture extension:
 * * `UNSIGNED_INT_24_8_WEBGL` When using the WEBGL_depth_texture extension:(constant provided by the extension)
 * * `FLOAT` When using the OES_texture_float extension:
 * * `HALF_FLOAT_OES` When using the OES_texture_half_float extension:(constant provided by the extension)
 * * `BYTE` using a WebGL 2 context
 * * `SHORT` using a WebGL 2 context
 * * `INT` using a WebGL 2 context
 * * `HALF_FLOAT` using a WebGL 2 context
 * * `UNSIGNED_INT_2_10_10_10_REV` using a WebGL 2 context
 * * `UNSIGNED_INT_10F_11F_11F_REV` using a WebGL 2 context
 * * `UNSIGNED_INT_5_9_9_9_REV` using a WebGL 2 context
 * * `UNSIGNED_INT_24_8` using a WebGL 2 context
 * * `FLOAT_32_UNSIGNED_INT_24_8_REV` using a WebGL 2 context(pixels must be null)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type TextureDataType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' | 'UNSIGNED_SHORT_4_4_4_4' | 'UNSIGNED_SHORT_5_5_5_1' | 'UNSIGNED_SHORT'
    | 'UNSIGNED_INT' | 'UNSIGNED_INT_24_8_WEBGL' | 'FLOAT' | 'HALF_FLOAT_OES' | 'BYTE' | 'SHORT' | 'INT'
    | 'HALF_FLOAT' | 'UNSIGNED_INT_2_10_10_10_REV' | 'UNSIGNED_INT_10F_11F_11F_REV' | 'UNSIGNED_INT_5_9_9_9_REV' | 'UNSIGNED_INT_24_8' | 'FLOAT_32_UNSIGNED_INT_24_8_REV'
    ;

/**
 * 纹理颜色格式
 * A GLint specifying the color components in the texture
 *
 * * `ALPHA` Discards the red, green and blue components and reads the alpha component.
 * * `RGB` Discards the alpha components and reads the red, green and blue components.
 * * `RGBA` Red, green, blue and alpha components are read from the color buffer.
 * * `LUMINANCE` Each color component is a luminance component, alpha is 1.0.
 * * `LUMINANCE_ALPHA` Each component is a luminance/alpha component.
 * * `DEPTH_COMPONENT` When using the WEBGL_depth_texture extension:
 * * `DEPTH_STENCIL` When using the WEBGL_depth_texture extension:
 * * `SRGB_EXT` When using the EXT_sRGB extension:
 * * `SRGB_ALPHA_EXT` When using the EXT_sRGB extension:
 * * `R8` using a WebGL 2 context
 * * `R16F` using a WebGL 2 context
 * * `R32F` using a WebGL 2 context
 * * `R8UI` using a WebGL 2 context
 * * `RG8` using a WebGL 2 context
 * * `RG16F` using a WebGL 2 context
 * * `RG32F` using a WebGL 2 context
 * * `RG8UI` using a WebGL 2 context
 * * `RG16UI` using a WebGL 2 context
 * * `RG32UI` using a WebGL 2 context
 * * `RGB8` using a WebGL 2 context
 * * `SRGB8` using a WebGL 2 context
 * * `RGB565` using a WebGL 2 context
 * * `R11F_G11F_B10F` using a WebGL 2 context
 * * `RGB9_E5` using a WebGL 2 context
 * * `RGB16F` using a WebGL 2 context
 * * `RGB32F` using a WebGL 2 context
 * * `RGB8UI` using a WebGL 2 context
 * * `RGBA8` using a WebGL 2 context
 * * `RGB5_A1` using a WebGL 2 context
 * * `RGB10_A2` using a WebGL 2 context
 * * `RGBA4` using a WebGL 2 context
 * * `RGBA16F` using a WebGL 2 context
 * * `RGBA32F` using a WebGL 2 context
 * * `RGBA8UI` using a WebGL 2 context
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type TextureFormat = 'ALPHA' | 'RGB' | `RGBA` | `LUMINANCE` | `LUMINANCE_ALPHA` | `DEPTH_COMPONENT`
    | `DEPTH_STENCIL` | `SRGB_EXT` | `SRGB_ALPHA_EXT` | `R8` | `R16F` | `R32F`
    | `R8UI` | `RG8` | `RG16F` | `RG32F` | `RG8UI` | `RG16UI`
    | `RG32UI` | `RGB8` | `SRGB8` | `RGB565`
    | `R11F_G11F_B10F` | `RGB9_E5` | `RGB16F` | `RGB32F`
    | `RGB8UI` | `RGBA8` | `RGB5_A1` | `RGB10_A2`
    | `RGBA4` | `RGBA16F` | `RGBA32F` | `RGBA8UI`;

/**
 * 纹理放大滤波器
 * Texture magnification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type TextureMagFilter = 'LINEAR' | 'NEAREST';

/**
 * 纹理缩小过滤器
 * Texture minification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 * * `NEAREST_MIPMAP_NEAREST`
 * * `LINEAR_MIPMAP_NEAREST`
 * * `NEAREST_MIPMAP_LINEAR`
 * * `LINEAR_MIPMAP_LINEAR`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type TextureMinFilter = 'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR';
