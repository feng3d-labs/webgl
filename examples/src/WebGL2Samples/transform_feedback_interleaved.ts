import { IProgram, IRenderPass, IRenderingContext, ITransformFeedback, IVertexArrayObject, IVertexBuffer } from "../../../src";
import { getShaderSource } from "./utility";

(function ()
{
    // -- Init Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    // -- Init WebGL Context
    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const gl = canvas.getContext("webgl2", { antialias: false });

    // -- Init Program
    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_FEEDBACK = 1;

    const programTransform = (function (gl, vertexShaderSourceTransform, fragmentShaderSourceTransform)
    {
        const varyings = ["gl_Position", "v_color"];

        const programTransform: IProgram = {
            vertex: { code: vertexShaderSourceTransform },
            fragment: { code: fragmentShaderSourceTransform },
            transformFeedbackVaryings: { varyings, bufferMode: "INTERLEAVED_ATTRIBS" },
        };

        return programTransform;
    })(gl, getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback: IProgram = {
        vertex: { code: getShaderSource("vs-feedback") }, fragment: { code: getShaderSource("fs-feedback") },
    };

    const programs = [programTransform, programFeedback];

    // -- Init Buffer
    const SIZE_V4C4 = 32;
    const VERTEX_COUNT = 6;
    const vertices = new Float32Array([
        -1.0, -1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0
    ]);

    const buffers: IVertexBuffer[] = [
        // Transform buffer
        { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" },
        // Feedback empty buffer
        { target: "ARRAY_BUFFER", size: SIZE_V4C4 * VERTEX_COUNT, usage: "STATIC_COPY" },
    ];

    // -- Init TransformFeedback: Track output buffer
    const transformFeedback: ITransformFeedback = { index: 0, buffer: buffers[PROGRAM_FEEDBACK] };

    // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[PROGRAM_FEEDBACK]);
    // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    // -- Init Vertex Array
    const vertexArrays: IVertexArrayObject[] = [
        {
            vertices: {
                position: { buffer: buffers[PROGRAM_TRANSFORM], numComponents: 4 },
            }
        },
        {
            vertices: {
                position: { buffer: buffers[PROGRAM_FEEDBACK], numComponents: 4, vertexSize: SIZE_V4C4, offset: 0 },
                color: { buffer: buffers[PROGRAM_FEEDBACK], numComponents: 4, vertexSize: SIZE_V4C4, offset: SIZE_V4C4 / 2 },
            }
        },
    ];

    // -- Render
    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
    };

    // First draw, capture the attributes
    // Disable rasterization, vertices processing only
    gl.enable(gl.RASTERIZER_DISCARD);

    gl.useProgram(programs[PROGRAM_TRANSFORM]);
    const matrix = new Float32Array([
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    gl.uniformMatrix4fv(mvpLocation, false, matrix);

    gl.bindVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    gl.beginTransformFeedback(gl.TRIANGLES);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, VERTEX_COUNT, 1);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    gl.disable(gl.RASTERIZER_DISCARD);

    // Second draw, reuse captured attributes
    gl.useProgram(programs[PROGRAM_FEEDBACK]);
    gl.bindVertexArray(vertexArrays[PROGRAM_FEEDBACK]);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, VERTEX_COUNT, 1);
    gl.bindVertexArray(null);

    // -- Delete WebGL resources
    gl.deleteTransformFeedback(transformFeedback);
    gl.deleteBuffer(buffers[PROGRAM_TRANSFORM]);
    gl.deleteBuffer(buffers[PROGRAM_FEEDBACK]);
    gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    gl.deleteProgram(programs[PROGRAM_FEEDBACK]);
    gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    gl.deleteVertexArray(vertexArrays[PROGRAM_FEEDBACK]);
})();
