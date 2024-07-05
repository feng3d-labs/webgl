import { mat4, vec3 } from "gl-matrix";
import { IIndexBuffer, IProgram, IRenderObject, IRenderingContext, IVertexArrayObject, IVertexBuffer, VertexAttributeTypes } from "../../../src";
import { MinimalGLTFLoader } from "./third-party/gltf-loader";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const gl = canvas.getContext("webgl2", { antialias: false });

    // -- Init program
    const program: IProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        depthStencil: { depth: { depthtest: true, depthCompare: "LESS" } },
    };

    // -- Initialize vertex array
    const POSITION_LOCATION = 0; // set with GLSL layout qualifier
    const TEXCOORD_LOCATION = 4; // set with GLSL layout qualifier
    const NORMAL_LOCATION = 1; // set with GLSL layout qualifier

    const vertexArrayMaps = {};

    // var in loop
    let mesh;
    let primitive: {
        attributes: {
            POSITION: { size: 1 | 2 | 3 | 4, type?: VertexAttributeTypes, stride: number, offset: number },
            NORMAL: { size: 1 | 2 | 3 | 4, type?: VertexAttributeTypes, stride: number, offset: number },
        }
    };
    let vertexBuffer: IVertexBuffer;
    let indicesBuffer: IIndexBuffer;
    let vertexArray: IVertexArrayObject;

    let texture;

    const ro: IRenderObject = {
        pipeline: program,
    };

    gl.uniform1i(diffuseLocation, 0);
    gl.uniform1i(displacementMapLocation, 0);

    // -- Load model then render
    const glTFLoader = new MinimalGLTFLoader.glTFLoader();
    let curScene;
    const gltfUrl = "../../assets/gltf/plane.gltf";
    glTFLoader.loadGLTF(gltfUrl, function (glTF)
    {
        curScene = glTF.scenes[glTF.defaultScene];

        let i; let len;

        for (const mid in curScene.meshes)
        {
            mesh = curScene.meshes[mid];
            vertexArrayMaps[mid] = [];

            for (i = 0, len = mesh.primitives.length; i < len; ++i)
            {
                primitive = mesh.primitives[i];

                // -- Initialize buffer
                const vertices = primitive.vertexBuffer;
                vertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

                const indices = primitive.indices;
                indicesBuffer = { target: "ELEMENT_ARRAY_BUFFER", data: indices, usage: "STATIC_DRAW" };

                // -- VertexAttribPointer
                gl.bindVertexArray(vertexArray);

                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

                const positionInfo = primitive.attributes.POSITION;
                gl.vertexAttribPointer(
                    POSITION_LOCATION,
                    positionInfo.size,
                    positionInfo.type,
                    false,
                    positionInfo.stride,
                    positionInfo.offset
                );
                gl.enableVertexAttribArray(POSITION_LOCATION);

                const normalInfo = primitive.attributes.NORMAL;
                gl.vertexAttribPointer(
                    NORMAL_LOCATION,
                    normalInfo.size,
                    normalInfo.type,
                    false,
                    normalInfo.stride,
                    normalInfo.offset
                );
                gl.enableVertexAttribArray(NORMAL_LOCATION);

                const texcoordInfo = primitive.attributes.TEXCOORD_0;
                gl.vertexAttribPointer(
                    TEXCOORD_LOCATION,
                    texcoordInfo.size,
                    texcoordInfo.type,
                    false,
                    texcoordInfo.stride,
                    texcoordInfo.offset
                );
                gl.enableVertexAttribArray(TEXCOORD_LOCATION);

                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

                gl.bindVertexArray(null);

                //
                vertexArray = {
                    vertices: {
                        position: { buffer: vertexBuffer, numComponents: positionInfo.size, type: positionInfo.type, vertexSize: positionInfo.stride, offset: positionInfo.offset }
                    }
                };
                vertexArrayMaps[mid].push(vertexArray);
            }
        }

        // -- Init Texture
        const imageUrl = "../assets/img/heightmap.jpg";
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
            gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 256, 256);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

            requestAnimationFrame(render);
        });
    });

    // -- Initialize render variables
    const orientation = [0.0, 0.0, 0.0];

    const tempMat4 = mat4.create();
    const modelMatrix = mat4.create();

    const eyeVec3 = vec3.create();
    vec3.set(eyeVec3, 4, 3, 1);
    const centerVec3 = vec3.create();
    vec3.set(centerVec3, 0, 0.5, 0);
    const upVec3 = vec3.create();
    vec3.set(upVec3, 0, 1, 0);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eyeVec3, centerVec3, upVec3);

    const mvMatrix = mat4.create();
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    const perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 0.785, 1, 1, 1000);

    // -- Mouse Behaviour

    let mouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.onmousedown = function (event)
    {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    };

    canvas.onmouseup = function (event)
    {
        mouseDown = false;
    };

    canvas.onmousemove = function (event)
    {
        const newX = event.clientX;
        const newY = event.clientY;

        const deltaX = newX - lastMouseX;
        const deltaY = newY - lastMouseY;

        const m = mat4.create();
        mat4.rotateX(m, m, deltaX / 100.0);
        mat4.rotateY(m, m, deltaY / 100.0);

        mat4.multiply(tempMat4, mvMatrix, m);
        mat4.copy(mvMatrix, tempMat4);

        lastMouseX = newX;
        lastMouseY = newY;
    };

    const localMV = mat4.create();
    function render()
    {
        // -- Render

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        orientation[0] = 0.00020; // yaw
        orientation[1] = 0.00010; // pitch
        orientation[2] = 0.00005; // roll

        mat4.rotateX(mvMatrix, mvMatrix, orientation[0] * Math.PI);
        mat4.rotateY(mvMatrix, mvMatrix, orientation[1] * Math.PI);
        mat4.rotateZ(mvMatrix, mvMatrix, orientation[2] * Math.PI);

        let i; let len;
        for (const mid in curScene.meshes)
        {
            mesh = curScene.meshes[mid];

            for (i = 0, len = mesh.primitives.length; i < len; ++i)
            {
                primitive = mesh.primitives[i];

                mat4.multiply(localMV, mvMatrix, primitive.matrix);

                gl.uniformMatrix4fv(mvMatrixLocation, false, localMV);
                gl.uniformMatrix4fv(pMatrixLocation, false, perspectiveMatrix);

                gl.bindVertexArray(vertexArrayMaps[mid][i]);

                gl.drawElements(primitive.mode, primitive.indices.length, primitive.indicesComponentType, 0);

                gl.bindVertexArray(null);
            }
        }

        requestAnimationFrame(render);
    }
})();
