import { ICullFace, IFrontFace, IPrimitiveTopology } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    export interface IPrimitiveTopologyMap
    {
        /**
         * 绘制循环连线。
         */
        "LINE_LOOP": "LINE_LOOP",

        /**
         * 绘制三角扇形。
         */
        "TRIANGLE_FAN": "TRIANGLE_FAN",
    }

    export interface IPrimitiveState
    {
        /**
         * 图形拓扑结构。
         *
         * 以下仅在WebGL生效
         * * LINE_LOOP 绘制循环连线。
         * * TRIANGLE_FAN  绘制三角扇形。
         */
        readonly topology?: IPrimitiveTopology;

        /**
         * * `FRONT_AND_BACK` 剔除正面与背面，仅在WebGL中生效！
         * 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
         */
        readonly cullFace?: ICullFace;

        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
         */
        readonly frontFace?: IFrontFace;
    }
}

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
export type IGLDrawMode = "POINTS" | "LINE_STRIP" | "LINE_LOOP" | "LINES" | "TRIANGLE_STRIP" | "TRIANGLE_FAN" | "TRIANGLES";
