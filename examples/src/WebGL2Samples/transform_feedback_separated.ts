import { CanvasContext, IndicesDataTypes, VertexDataTypes, RenderPipeline, Submit, VertexAttributes } from "@feng3d/render-api";
import { TransformFeedback, TransformFeedbackPipeline, WebGL } from "@feng3d/webgl";

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
    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc);

    // -- Init Program
    const programTransform = (function (vertexShaderSourceTransform, fragmentShaderSourceTransform)
    {
        const transformFeedbackPipeline: TransformFeedbackPipeline = {
            vertex: { code: vertexShaderSourceTransform },
            transformFeedbackVaryings: { varyings: ["gl_Position", "v_color"], bufferMode: "SEPARATE_ATTRIBS" },
        };

        return transformFeedbackPipeline;
    })(getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback: RenderPipeline = {
        vertex: { code: getShaderSource("vs-feedback") }, fragment: { code: getShaderSource("fs-feedback") },
    };

    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_FEEDBACK = 1;
    const programs = [programTransform, programFeedback];

    // -- Init Buffer

    const VERTEX_COUNT = 6;
    const positions = new Float32Array([
        -1.0, -1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0
    ]);

    const BufferType = {
        VERTEX: 0,
        POSITION: 1,
        COLOR: 2,
        MAX: 3
    };

    const buffers: VertexDataTypes[] = [
        // Transform buffer
        positions,
        // Feedback empty buffers
        positions.slice(),
        positions.slice(),
    ];

    // -- Init Transform Vertex Array
    const vertexArrays: { vertices?: VertexAttributes, indices?: IndicesDataTypes }[] = [
        {
            vertices: {
                position: { data: buffers[BufferType.VERTEX], format: "float32x4" },
            }
        },
        {
            vertices: {
                position: { data: buffers[BufferType.POSITION], format: "float32x4" },
                color: { data: buffers[BufferType.COLOR], format: "float32x4" },
            }
        },
    ];

    // -- Init TransformFeedback
    const transformFeedback: TransformFeedback = {
        bindBuffers: [
            { index: 0, data: buffers[BufferType.POSITION] },
            { index: 1, data: buffers[BufferType.COLOR] },
        ]
    };

    // First draw, capture the attributes
    // Disable rasterization, vertices processing only

    const matrix = new Float32Array([
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const submit: Submit = {
        commandEncoders: [{
            passEncoders: [
                {
                    __type__: "TransformFeedbackPass",
                    transformFeedbackObjects: [
                        {
                            pipeline: programTransform,
                            vertices: vertexArrays[PROGRAM_TRANSFORM].vertices,
                            uniforms: { MVP: matrix },
                            transformFeedback,
                            draw: { __type__: "DrawVertex", vertexCount: VERTEX_COUNT },
                        }
                    ]
                },
                {
                    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
                    renderPassObjects: [
                        // Second draw, reuse captured attributes
                        {
                            pipeline: programs[PROGRAM_FEEDBACK],
                            vertices: vertexArrays[PROGRAM_FEEDBACK].vertices,
                            indices: vertexArrays[PROGRAM_FEEDBACK].indices,
                            draw: { __type__: "DrawVertex", vertexCount: VERTEX_COUNT },
                        }
                    ],
                }
            ]
        }]
    };

    webgl.submit(submit);

    // -- Delete WebGL resources
    // gl.deleteTransformFeedback(transformFeedback);
    // gl.deleteBuffer(buffers[BufferType.VERTEX]);
    // gl.deleteBuffer(buffers[BufferType.POSITION]);
    // gl.deleteBuffer(buffers[BufferType.COLOR]);
    // gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    // gl.deleteProgram(programs[PROGRAM_FEEDBACK]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_FEEDBACK]);
})();
