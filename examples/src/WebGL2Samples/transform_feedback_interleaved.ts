import { IProgram, IRenderingContext } from "../../../src";
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

        // gl.transformFeedbackVaryings(programTransform, varyings, gl.INTERLEAVED_ATTRIBS);

        return programTransform;
    })(gl, getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback = createProgram(gl, getShaderSource("vs-feedback"), getShaderSource("fs-feedback"));

    const programs = [programTransform, programFeedback];

    const mvpLocation = gl.getUniformLocation(programs[PROGRAM_TRANSFORM], "MVP");

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

    const buffers = [gl.createBuffer(), gl.createBuffer()];

    // Transform buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[PROGRAM_TRANSFORM]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Feedback empty buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[PROGRAM_FEEDBACK]);
    gl.bufferData(gl.ARRAY_BUFFER, SIZE_V4C4 * VERTEX_COUNT, gl.STATIC_COPY);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // -- Init TransformFeedback: Track output buffer
    const transformFeedback = gl.createTransformFeedback();

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[PROGRAM_FEEDBACK]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    // -- Init Vertex Array
    const vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
    gl.bindVertexArray(vertexArrays[PROGRAM_TRANSFORM]);

    const vertexPosLocation = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[PROGRAM_TRANSFORM]);
    gl.vertexAttribPointer(vertexPosLocation, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(vertexPosLocation);

    gl.bindVertexArray(null);

    gl.bindVertexArray(vertexArrays[PROGRAM_FEEDBACK]);

    const vertexPosLocationFeedback = 0;
    const vertexColorLocationFeedback = 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[PROGRAM_FEEDBACK]);
    gl.vertexAttribPointer(vertexPosLocationFeedback, 4, gl.FLOAT, false, SIZE_V4C4, 0);
    gl.vertexAttribPointer(vertexColorLocationFeedback, 4, gl.FLOAT, false, SIZE_V4C4, SIZE_V4C4 / 2);
    gl.enableVertexAttribArray(vertexPosLocationFeedback);
    gl.enableVertexAttribArray(vertexColorLocationFeedback);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // -- Render
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

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
