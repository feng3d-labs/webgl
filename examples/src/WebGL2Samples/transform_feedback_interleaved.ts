import { CanvasContext, IndicesDataTypes, RenderPipeline, VertexAttributes, VertexDataTypes } from "@feng3d/render-api";
import { getIGLBuffer, TransformFeedback, TransformFeedbackPipeline, WebGL } from "@feng3d/webgl";
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
    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_FEEDBACK = 1;

    const programTransform = (function (vertexShaderSourceTransform, fragmentShaderSourceTransform)
    {
        const programTransform: TransformFeedbackPipeline = {
            vertex: { code: vertexShaderSourceTransform },
            transformFeedbackVaryings: { varyings: ["gl_Position", "v_color"], bufferMode: "INTERLEAVED_ATTRIBS" },
        };

        return programTransform;
    })(getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback: RenderPipeline = {
        vertex: { code: getShaderSource("vs-feedback") }, fragment: { code: getShaderSource("fs-feedback") },
    };

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

    const buffers: VertexDataTypes[] = [
        // Transform buffer
        vertices,
        // Feedback empty buffer
        new Float32Array(SIZE_V4C4 * VERTEX_COUNT / Float32Array.BYTES_PER_ELEMENT),
    ];

    // -- Init Vertex Array
    const vertexArrays: { vertices?: VertexAttributes, indices?: IndicesDataTypes }[] = [
        {
            vertices: {
                position: { data: buffers[PROGRAM_TRANSFORM], format: "float32x4" },
            }
        },
        {
            vertices: {
                position: { data: buffers[PROGRAM_FEEDBACK], format: "float32x4", arrayStride: SIZE_V4C4, offset: 0 },
                color: { data: buffers[PROGRAM_FEEDBACK], format: "float32x4", arrayStride: SIZE_V4C4, offset: SIZE_V4C4 / 2 },
            }
        },
    ];

    // -- Init TransformFeedback
    const transformFeedback: TransformFeedback = {
        bindBuffers: [
            { index: 0, data: buffers[PROGRAM_FEEDBACK] }
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

    webgl.submit({
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
                    ],
                },
                {
                    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
                    renderPassObjects: [
                        // Second draw, reuse captured attributes
                        {
                            pipeline: programFeedback,
                            vertices: vertexArrays[PROGRAM_FEEDBACK].vertices,
                            indices: vertexArrays[PROGRAM_FEEDBACK].indices,
                            draw: { __type__: "DrawVertex", vertexCount: VERTEX_COUNT },
                        }
                    ],
                }]
        }]
    });

    // -- Delete WebGL resources
    webgl.deleteTransformFeedback(transformFeedback);
    webgl.deleteBuffer(getIGLBuffer(buffers[PROGRAM_TRANSFORM]));
    webgl.deleteBuffer(getIGLBuffer(buffers[PROGRAM_FEEDBACK]));
    webgl.deleteProgram(programTransform);
    webgl.deleteProgram(programFeedback);
})();
