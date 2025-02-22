import { IIndicesDataTypes, RenderObject, Material, Submit, VertexAttributes, IVertexDataTypes } from "@feng3d/render-api";
import { GLCanvasContext, IGLTransformFeedback, IGLTransformFeedbackObject, IGLTransformFeedbackPipeline, WebGL } from "@feng3d/webgl";

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
    const rc: GLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    canvas.addEventListener("webglcontextlost", function (event)
    {
        event.preventDefault();
    }, false);

    // -- Declare variables for the particle system

    const NUM_PARTICLES = 1000;
    const ACCELERATION = -1.0;

    const appStartTime = Date.now();
    let currentSourceIdx = 0;

    const [transformFeedbackPipeline, program] = initProgram();

    // -- Initialize particle data

    const particlePositions = new Float32Array(NUM_PARTICLES * 2);
    const particleVelocities = new Float32Array(NUM_PARTICLES * 2);
    const particleSpawntime = new Float32Array(NUM_PARTICLES);
    const particleLifetime = new Float32Array(NUM_PARTICLES);
    const particleIDs = new Float32Array(NUM_PARTICLES);

    for (let p = 0; p < NUM_PARTICLES; ++p)
    {
        particlePositions[p * 2] = 0.0;
        particlePositions[p * 2 + 1] = 0.0;
        particleVelocities[p * 2] = 0.0;
        particleVelocities[p * 2 + 1] = 0.0;
        particleSpawntime[p] = 0.0;
        particleLifetime[p] = 0.0;
        particleIDs[p] = p;
    }

    const POSITION_LOCATION = 0;
    const VELOCITY_LOCATION = 1;
    const SPAWNTIME_LOCATION = 2;
    const LIFETIME_LOCATION = 3;
    const ID_LOCATION = 4;
    const NUM_LOCATIONS = 5;

    // -- Init Vertex Arrays and Buffers
    const vertexArrays: { vertices?: VertexAttributes, indices?: IIndicesDataTypes }[][] = [];

    // Transform feedback objects track output buffer state
    const transformFeedbacks: IGLTransformFeedback[] = [];

    const vertexBuffers: IVertexDataTypes[][] = new Array(vertexArrays.length);

    for (let i = 0; i < 2; ++i)
    {
        vertexBuffers[i] = new Array(NUM_LOCATIONS);

        // Set up input
        vertexBuffers[i][POSITION_LOCATION] = particlePositions.slice();

        vertexBuffers[i][VELOCITY_LOCATION] = particleVelocities.slice();

        vertexBuffers[i][SPAWNTIME_LOCATION] = particleSpawntime.slice();

        vertexBuffers[i][LIFETIME_LOCATION] = particleLifetime.slice();

        vertexBuffers[i][ID_LOCATION] = particleIDs;

        vertexArrays[i] = [];
        vertexArrays[i][0] = {
            vertices: {
                a_position: { data: vertexBuffers[i][POSITION_LOCATION], format: "float32x2" },
                a_velocity: { data: vertexBuffers[i][VELOCITY_LOCATION], format: "float32x2" },
                a_spawntime: { data: vertexBuffers[i][SPAWNTIME_LOCATION], format: "float32" },
                a_lifetime: { data: vertexBuffers[i][LIFETIME_LOCATION], format: "float32" },
                a_ID: { data: vertexBuffers[i][ID_LOCATION], format: "float32" },
            }
        };

        vertexArrays[i][1] = {
            vertices: {
                a_position: { data: vertexBuffers[i][POSITION_LOCATION], format: "float32x2" },
            }
        };

        // Set up output
        transformFeedbacks[i] = {
            bindBuffers: [
                { index: 0, data: vertexBuffers[i][POSITION_LOCATION] },
                { index: 1, data: vertexBuffers[i][VELOCITY_LOCATION] },
                { index: 2, data: vertexBuffers[i][SPAWNTIME_LOCATION] },
                { index: 3, data: vertexBuffers[i][LIFETIME_LOCATION] },
            ]
        };
    }

    function initProgram(): [IGLTransformFeedbackPipeline, Material]
    {
        const transformFeedbackPipeline: IGLTransformFeedbackPipeline = {
            vertex: { code: getShaderSource("vs-emit") },
            transformFeedbackVaryings: { varyings: ["v_position", "v_velocity", "v_spawntime", "v_lifetime"], bufferMode: "SEPARATE_ATTRIBS" },
        };

        const program: Material = {
            vertex: { code: getShaderSource("vs-draw") },
            fragment: {
                code: getShaderSource("fs-draw"),
                targets: [{
                    blend: {
                        color: { srcFactor: "src-alpha", dstFactor: "one" },
                        alpha: { srcFactor: "src-alpha", dstFactor: "one" },
                    }
                }]
            },
        };

        return [transformFeedbackPipeline, program];
    }

    const transformRO: IGLTransformFeedbackObject = {
        pipeline: transformFeedbackPipeline,
        vertices: null,
        transformFeedback: null,
        uniforms: {
            u_acceleration: [0.0, ACCELERATION],
        },
        draw: { __type__: "DrawVertex", vertexCount: NUM_PARTICLES },
    };

    const renderRO: RenderObject = {
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height - 10 },
        material: program,
        uniforms: {
            u_color: [0.0, 1.0, 1.0, 1.0],
        },
        geometry:{
            draw: { __type__: "DrawVertex", vertexCount: NUM_PARTICLES },
            primitive: { topology: "point-list" },
        }
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
                    renderObjects: [renderRO],
                }
            ]
        }]
    };

    function transform()
    {
        const time = Date.now() - appStartTime;
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        transformRO.vertices = vertexArrays[currentSourceIdx][0].vertices;
        transformRO.transformFeedback = transformFeedbacks[destinationIdx];

        transformRO.uniforms.u_time = time;

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;
    }

    function render()
    {
        transform();

        //
        renderRO.geometry.vertices = vertexArrays[currentSourceIdx][1].vertices;
        renderRO.geometry.indices = vertexArrays[currentSourceIdx][1].indices;

        webgl.submit(submit);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
