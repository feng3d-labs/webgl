(function ()
{
    // -- Init Canvas
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    // -- Init WebGL Context
    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

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

    const drawTimeLocation = gl.getUniformLocation(programs[PROGRAM_DRAW], "u_time");

    const vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];

    // Transform feedback objects track output buffer state
    const transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    const vertexBuffers = new Array(vertexArrays.length);

    for (let va = 0; va < vertexArrays.length; ++va)
    {
        gl.bindVertexArray(vertexArrays[va]);
        vertexBuffers[va] = new Array(NUM_LOCATIONS);

        vertexBuffers[va][OFFSET_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][OFFSET_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceOffsets, gl.STREAM_COPY);
        gl.vertexAttribPointer(OFFSET_LOCATION, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(OFFSET_LOCATION);

        vertexBuffers[va][ROTATION_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][ROTATION_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceRotations, gl.STREAM_COPY);
        gl.vertexAttribPointer(ROTATION_LOCATION, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(ROTATION_LOCATION);

        vertexBuffers[va][POSITION_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][POSITION_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(POSITION_LOCATION);

        vertexBuffers[va][COLOR_LOCATION] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[va][COLOR_LOCATION]);
        gl.bufferData(gl.ARRAY_BUFFER, instanceColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(COLOR_LOCATION, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(COLOR_LOCATION);
        gl.vertexAttribDivisor(COLOR_LOCATION, 1); // attribute used once per instance

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Set up output
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedbacks[va]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[va][OFFSET_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertexBuffers[va][ROTATION_LOCATION]);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }

    render();

    function initPrograms()
    {
        // Setup program for transform feedback shaders
        function createShader(gl, source, type)
        {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            return shader;
        }

        const vshaderTransform = createShader(gl, getShaderSource("vs-emit"), gl.VERTEX_SHADER);
        const fshaderTransform = createShader(gl, getShaderSource("fs-emit"), gl.FRAGMENT_SHADER);

        const programTransform = gl.createProgram();
        gl.attachShader(programTransform, vshaderTransform);
        gl.deleteShader(vshaderTransform);
        gl.attachShader(programTransform, fshaderTransform);
        gl.deleteShader(fshaderTransform);

        const varyings = ["v_offset", "v_rotation"];
        gl.transformFeedbackVaryings(programTransform, varyings, gl.SEPARATE_ATTRIBS);
        gl.linkProgram(programTransform);

        // check
        let log = gl.getProgramInfoLog(programTransform);
        if (log)
        {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshaderTransform);
        if (log)
        {
            console.log(log);
        }

        // Setup program for draw shader
        const programDraw = createProgram(gl, getShaderSource("vs-draw"), getShaderSource("fs-draw"));

        const programs = [programTransform, programDraw];

        return programs;
    }

    function transform()
    {
        const programTransform = programs[PROGRAM_TRANSFORM];
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        const sourceVAO = vertexArrays[currentSourceIdx];

        const destinationTransformFeedback = transformFeedbacks[destinationIdx];

        gl.useProgram(programTransform);

        gl.bindVertexArray(sourceVAO);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destinationTransformFeedback);

        // NOTE: The following two lines shouldn't be necessary, but are required to work in ANGLE
        // due to a bug in its handling of transform feedback objects.
        // https://bugs.chromium.org/p/angleproject/issues/detail?id=2051
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexBuffers[destinationIdx][OFFSET_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertexBuffers[destinationIdx][ROTATION_LOCATION]);

        // Attributes per-vertex when doing transform feedback needs setting to 0 when doing transform feedback
        gl.vertexAttribDivisor(OFFSET_LOCATION, 0);
        gl.vertexAttribDivisor(ROTATION_LOCATION, 0);

        // Turn off rasterization - we are not drawing
        gl.enable(gl.RASTERIZER_DISCARD);

        // Update position and rotation using transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, NUM_INSTANCES);
        gl.endTransformFeedback();

        // Restore state
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;
    }

    function render()
    {
        // Rotate triangles
        transform();

        // Set the viewport
        gl.viewport(0, 0, canvas.width, canvas.height - 10);

        // Clear color buffer
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindVertexArray(vertexArrays[currentSourceIdx]);

        // Attributes per-instance when drawing sets back to 1 when drawing instances
        gl.vertexAttribDivisor(OFFSET_LOCATION, 1);
        gl.vertexAttribDivisor(ROTATION_LOCATION, 1);

        gl.useProgram(programs[PROGRAM_DRAW]);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        // Set uniforms
        const time = Date.now();
        gl.uniform1f(drawTimeLocation, time);

        gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, NUM_INSTANCES);

        requestAnimationFrame(render);
    }

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
