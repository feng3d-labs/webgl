import { reactive } from "@feng3d/reactivity";
import { CanvasContext, IndicesDataTypes, RenderObject, RenderPipeline, Submit, VertexAttributes, VertexDataTypes } from "@feng3d/render-api";
import { TransformFeedback, TransformFeedbackObject, TransformFeedbackPipeline, WebGL } from "@feng3d/webgl";
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

    canvas.addEventListener("webglcontextlost", function (event)
    {
        event.preventDefault();
    }, false);

    // -- Init Program

    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_DRAW = 1;

    const programs = initPrograms();

    // -- Initialize data
    const NUM_INSTANCES = 1000;

    let currentSourceIdx = 0;

    const trianglePositions = new Float32Array([
        0.015, 0.0,
        -0.010, 0.010,
        -0.010, -0.010,
    ]);

    const instanceOffsets = new Float32Array(NUM_INSTANCES * 2);
    const instanceRotations = new Float32Array(Number(NUM_INSTANCES));
    const instanceColors = new Float32Array(NUM_INSTANCES * 3);

    for (let i = 0; i < NUM_INSTANCES; ++i)
    {
        const oi = i * 2;
        const ri = i;
        const ci = i * 3;

        instanceOffsets[oi] = Math.random() * 2.0 - 1.0;
        instanceOffsets[oi + 1] = Math.random() * 2.0 - 1.0;

        instanceRotations[i] = Math.random() * 2 * Math.PI;

        instanceColors[ci] = Math.random();
        instanceColors[ci + 1] = Math.random();
        instanceColors[ci + 2] = Math.random();
    }

    // -- Init Vertex Array
    const OFFSET_LOCATION = 0;
    const ROTATION_LOCATION = 1;
    const POSITION_LOCATION = 2; // this is vertex position of the instanced geometry
    const COLOR_LOCATION = 3;
    const NUM_LOCATIONS = 4;

    const vertexArrays: { vertices?: VertexAttributes, indices?: IndicesDataTypes }[][] = [];

    // Transform feedback objects track output buffer state
    const transformFeedbacks: TransformFeedback[] = [];

    const vertexBuffers: VertexDataTypes[][] = new Array(vertexArrays.length);

    for (let i = 0; i < 2; ++i)
    {
        vertexBuffers[i] = new Array(NUM_LOCATIONS);

        vertexBuffers[i][OFFSET_LOCATION] = instanceOffsets.slice();
        vertexBuffers[i][ROTATION_LOCATION] = instanceRotations.slice();
        vertexBuffers[i][POSITION_LOCATION] = trianglePositions;
        vertexBuffers[i][COLOR_LOCATION] = instanceColors;

        vertexArrays[i] = [];
        vertexArrays[i][0] = {
            vertices: {
                a_offset: { data: vertexBuffers[i][OFFSET_LOCATION], format: "float32x2" },
                a_rotation: { data: vertexBuffers[i][ROTATION_LOCATION], format: "float32" },
            }
        };
        vertexArrays[i][1] = {
            vertices: {
                a_offset: { data: vertexBuffers[i][OFFSET_LOCATION], format: "float32x2", stepMode: "instance" },
                a_rotation: { data: vertexBuffers[i][ROTATION_LOCATION], format: "float32", stepMode: "instance" },
                a_position: { data: vertexBuffers[i][POSITION_LOCATION], format: "float32x2" },
                a_color: { data: vertexBuffers[i][COLOR_LOCATION], format: "float32x3", stepMode: "instance" },
            }
        };

        transformFeedbacks[i] = {
            bindBuffers: [
                { index: 0, data: vertexBuffers[i][OFFSET_LOCATION] },
                { index: 1, data: vertexBuffers[i][ROTATION_LOCATION] },
            ]
        };
    }

    function initPrograms()
    {
        const programTransform: TransformFeedbackPipeline = {
            vertex: { code: getShaderSource("vs-emit") },
            transformFeedbackVaryings: { varyings: ["v_offset", "v_rotation"], bufferMode: "SEPARATE_ATTRIBS" },
        };

        // Setup program for draw shader
        const programDraw: RenderPipeline = {
            vertex: { code: getShaderSource("vs-draw") }, fragment: {
                code: getShaderSource("fs-draw"),
                targets: [{
                    blend: {
                        color: { srcFactor: "src-alpha", dstFactor: "one" },
                        alpha: { srcFactor: "src-alpha", dstFactor: "one" },
                    }
                }]
            },
            primitive: { topology: "triangle-list" },
        };

        const programs: [TransformFeedbackPipeline, RenderPipeline] = [programTransform, programDraw];

        return programs;
    }

    const transformRO: TransformFeedbackObject = {
        pipeline: programs[PROGRAM_TRANSFORM],
        vertices: null,
        transformFeedback: null,
        uniforms: {},
        draw: { __type__: "DrawVertex", vertexCount: NUM_INSTANCES },
    };

    const renderRO: RenderObject = {
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height - 10 },
        pipeline: programs[PROGRAM_DRAW],
        bindingResources: {},
        draw: { __type__: "DrawVertex", vertexCount: 3, instanceCount: NUM_INSTANCES },
    };

    const submit: Submit = {
        commandEncoders: [{
            passEncoders: [
                {
                    __type__: "TransformFeedbackPass",
                    transformFeedbackObjects: [transformRO],
                },
                {
                    descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
                    renderPassObjects: [renderRO],
                }
            ]
        }]
    };

    function transform()
    {
        const time = Date.now();
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        transformRO.vertices = vertexArrays[currentSourceIdx][0].vertices;
        transformRO.transformFeedback = transformFeedbacks[destinationIdx];

        reactive(transformRO.uniforms).u_time = time;

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;
    }

    function render()
    {
        // Rotate triangles
        transform();

        reactive(renderRO).vertices = vertexArrays[currentSourceIdx][1].vertices;
        reactive(renderRO).indices = vertexArrays[currentSourceIdx][1].indices;

        webgl.submit(submit);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    // gl.deleteProgram(programs[PROGRAM_DRAW]);
    // for (var i = 0; i < 2; ++i) {
    //     for (var j = 0; j < Particle.MAX; ++j) {
    //         gl.deleteBuffer(vertexBuffers[i][j]);
    //     }
    // }
    // gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_DRAW]);
    // gl.deleteTransformFeedback(transformFeedbacks[0]);
    // gl.deleteTransformFeedback(transformFeedbacks[1]);
})();
