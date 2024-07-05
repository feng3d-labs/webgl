(function ()
{
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    // -- Init program
    const program = createProgram(gl, getShaderSource("vs"), getShaderSource("fs"));
    const unifModel = gl.getUniformLocation(program, "u_model");
    const unifModelInvTrans = gl.getUniformLocation(program, "u_modelInvTrans");
    const unifViewProj = gl.getUniformLocation(program, "u_viewProj");
    const unifLightPosition = gl.getUniformLocation(program, "u_lightPosition");

    const unifTex2D = gl.getUniformLocation(program, "s_tex2D");
    const unifAmbient = gl.getUniformLocation(program, "u_ambient");

    // -- Init geometries
    const positions = new Float32Array([
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ]);
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const normals = HalfFloat.Float16Array([
        // Front face
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // Back face
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // Top face
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // Bottom face
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // Right face
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // Left face
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0
    ]);
    const vertexNorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const texCoords = HalfFloat.Float16Array([
        // Front face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Back face
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,

        // Top face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Bottom face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Right face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Left face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0
    ]);
    const vertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Element buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const cubeVertexIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23 // left
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

    // -- Init VertexArray

    const POSITION_LOCATION = 1;
    const TEXCOORD_LOCATION = 2;
    const NORMAL_LOCATION = 3;

    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.enableVertexAttribArray(POSITION_LOCATION);
    gl.vertexAttribPointer(POSITION_LOCATION, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNorBuffer);
    gl.enableVertexAttribArray(NORMAL_LOCATION);
    gl.vertexAttribPointer(NORMAL_LOCATION, 3, gl.HALF_FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.enableVertexAttribArray(TEXCOORD_LOCATION);
    gl.vertexAttribPointer(TEXCOORD_LOCATION, 2, gl.HALF_FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bindVertexArray(null);

    // -- Init Texture

    const imageUrl = "../assets/img/Di-3d.png";
    let texture;
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // -- Allocate storage for the texture
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 512, 512);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

        requestAnimationFrame(render);
    });

    // -- Initialize render variables
    const orientation = [0.0, 0.0, 0.0];

    const modelMatrix = mat4.create([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const viewMatrix = mat4.create();
    const translate = vec3.create();
    vec3.set(translate, 0, 0, -10);
    mat4.translate(viewMatrix, modelMatrix, translate);
    const perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 0.785, 1, 1, 1000);
    const viewProj = mat4.create();

    const modelInvTrans = mat4.create();
    mat4.transpose(modelInvTrans, modelMatrix);
    mat4.invert(modelInvTrans, modelInvTrans);

    const lightPosition = [0.0, 0.0, 5.0];

    function render()
    {
        // -- Render
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        orientation[0] = 0.0050; // yaw
        orientation[1] = 0.0030; // pitch
        orientation[2] = 0.0009; // roll

        mat4.rotateX(viewMatrix, viewMatrix, orientation[0] * Math.PI);
        mat4.rotateY(viewMatrix, viewMatrix, orientation[1] * Math.PI);
        mat4.rotateZ(viewMatrix, viewMatrix, orientation[2] * Math.PI);

        gl.bindVertexArray(vertexArray);
        gl.useProgram(program);

        // Set uniforms
        gl.uniformMatrix4fv(unifModel, false, modelMatrix);
        gl.uniformMatrix4fv(unifModelInvTrans, false, modelInvTrans);

        mat4.multiply(viewProj, perspectiveMatrix, viewMatrix);
        gl.uniformMatrix4fv(unifViewProj, false, viewProj);

        const lP = new Float32Array(lightPosition);
        gl.uniform3fv(unifLightPosition, lP);
        gl.uniform1i(unifTex2D, 0);

        const ambient = 0.1;
        gl.uniform1f(unifAmbient, ambient);

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Draw
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, 1);

        requestAnimationFrame(render);

        // If you have a long-running page, and need to delete WebGL resources, use:
        //
        // gl.deleteBuffer(vertexPosBuffer);
        // gl.deleteBuffer(vertexTexBuffer);
        // gl.deleteBuffer(indexBuffer);
        // gl.deleteTexture(texture);
        // gl.deleteProgram(program);
        // gl.deleteVertexArray(vertexArray);
    }
})();
