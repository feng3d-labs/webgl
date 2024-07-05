(function () {
    'use strict';

    // -- Init Canvas
    var canvas = document.createElement('canvas');
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    // -- Init WebGL Context
    var gl = canvas.getContext('webgl2', { antialias: false });
    var isWebGL2 = !!gl;
    if(!isWebGL2) {
        document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
        return;
    }

    // -- Init Program
    var programTransform = (function(gl, vertexShaderSourceTransform, fragmentShaderSourceTransform) {
        function createShader(gl, source, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        var vshaderTransform = createShader(gl, vertexShaderSourceTransform, gl.VERTEX_SHADER);
        var fshaderTransform = createShader(gl, fragmentShaderSourceTransform, gl.FRAGMENT_SHADER);

        var programTransform = gl.createProgram();
        gl.attachShader(programTransform, vshaderTransform);
        gl.deleteShader(vshaderTransform);
        gl.attachShader(programTransform, fshaderTransform);
        gl.deleteShader(fshaderTransform);

        var varyings = ['gl_Position', 'v_color'];
        gl.transformFeedbackVaryings(programTransform, varyings, gl.SEPARATE_ATTRIBS);
        gl.linkProgram(programTransform);

        // check
        var log = gl.getProgramInfoLog(programTransform);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshaderTransform);
        if (log) {
            console.log(log);
        }

        return programTransform;
    })(gl, getShaderSource('vs-transform'), getShaderSource('fs-transform'));

    var programFeedback = createProgram(gl, getShaderSource('vs-feedback'), getShaderSource('fs-feedback'));

    var mvpLocation = gl.getUniformLocation(programTransform, 'MVP');

    var PROGRAM_TRANSFORM = 0;
    var PROGRAM_FEEDBACK = 1;
    var programs = [programTransform, programFeedback];

    // -- Init Buffer

    var VERTEX_COUNT = 6;
    var positions = new Float32Array([
        -1.0, -1.0, 0.0, 1.0,
         1.0, -1.0, 0.0, 1.0,
         1.0, 1.0, 0.0, 1.0,
         1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0
    ]);

    var BufferType = {
        VERTEX: 0,
        POSITION: 1,
        COLOR: 2,
        MAX: 3
    };

    var buffers = new Array(BufferType.MAX);
    for (var i = 0; i < BufferType.MAX; ++i) {
        buffers[i] = gl.createBuffer();
    }

    // Transform buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.VERTEX]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Feedback empty buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.POSITION]);
    gl.bufferData(gl.ARRAY_BUFFER, positions.length * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_COPY);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.COLOR]);
    gl.bufferData(gl.ARRAY_BUFFER, positions.length * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_COPY);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // -- Init Transform Vertex Array
    var vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
    gl.bindVertexArray(vertexArrays[PROGRAM_TRANSFORM]);

    var vertexPosLocation = 0; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.VERTEX]);
    gl.vertexAttribPointer(vertexPosLocation, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(vertexPosLocation);

    gl.bindVertexArray(null);

    // -- Init TransformFeedback
    var transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[BufferType.POSITION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffers[BufferType.COLOR]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

    // -- Init Feedback Vertex Array 
    gl.bindVertexArray(vertexArrays[PROGRAM_FEEDBACK]);

    var vertexPosLocationFeedback = 0; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.POSITION]);
    gl.vertexAttribPointer(vertexPosLocationFeedback, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosLocationFeedback);

    var vertexColorLocationFeedback = 3; // set with GLSL layout qualifier
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[BufferType.COLOR]);
    gl.vertexAttribPointer(vertexColorLocationFeedback, 4, gl.FLOAT, false, 0, 0);
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
    var matrix = new Float32Array([
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
    gl.deleteBuffer(buffers[BufferType.VERTEX]);
    gl.deleteBuffer(buffers[BufferType.POSITION]);
    gl.deleteBuffer(buffers[BufferType.COLOR]);
    gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    gl.deleteProgram(programs[PROGRAM_FEEDBACK]);
    gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    gl.deleteVertexArray(vertexArrays[PROGRAM_FEEDBACK]);
})();
