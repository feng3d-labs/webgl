export interface IPrimitiveState
{
    /**
     * 图形拓扑结构。
     *
     * 默认 TRIANGLES，每三个顶点绘制一个三角形。
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
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
     */
    topology?: DrawMode;

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
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
     */
    cullMode?: CullFace;

    /**
     * 正向方向，默认 CCW。三角形逆时针方向为正面。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
     */
    frontFace?: FrontFace;
}

/**
 * 正面方向枚举
 *
 * * CW 顺时钟方向
 * * CCW 逆时钟方向
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
export type FrontFace = "CW" | "CCW";

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
export type CullFace = "NONE" | "FRONT" | "BACK" | "FRONT_AND_BACK";

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
 *
 * * gl.POINTS: Draws a single dot.
 * * gl.LINE_STRIP: Draws a straight line to the next vertex.
 * * gl.LINE_LOOP: Draws a straight line to the next vertex, and connects the last vertex back to the first.
 * * gl.LINES: Draws a line between a pair of vertices.
 * * gl.TRIANGLE_STRIP
 * * gl.TRIANGLE_FAN
 * * gl.TRIANGLES: Draws a triangle for a group of three vertices.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export type DrawMode = "POINTS" | "LINE_STRIP" | "LINE_LOOP" | "LINES" | "TRIANGLE_STRIP" | "TRIANGLE_FAN" | "TRIANGLES";
