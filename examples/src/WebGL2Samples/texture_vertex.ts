import { mat4, vec3 } from "gl-matrix";
import { IIndexBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, VertexAttributeTypes, WebGL } from "../../../src";
import { GlTFLoader, Primitive } from "./third-party/gltf-loader";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };

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
    let primitive: Primitive;
    let vertexBuffer: IVertexBuffer;
    let indicesBuffer: IIndexBuffer;
    let vertexArray: IVertexArrayObject;

    let texture: ITexture;
    let sampler: ISampler;

    const ro: IRenderObject = {
        pipeline: program,
    };

    // -- Load model then render
    const glTFLoader = new GlTFLoader();
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
                const positionInfo = primitive.attributes.POSITION;
                const normalInfo = primitive.attributes.NORMAL;
                const texcoordInfo = primitive.attributes.TEXCOORD_0;

                //
                vertexArray = {
                    vertices: {
                        position: { buffer: vertexBuffer, numComponents: positionInfo.size, type: positionInfo.type, vertexSize: positionInfo.stride, offset: positionInfo.offset },
                        normal: { buffer: vertexBuffer, numComponents: normalInfo.size, type: normalInfo.type, vertexSize: normalInfo.stride, offset: normalInfo.offset },
                        texcoord: { buffer: vertexBuffer, numComponents: texcoordInfo.size, type: texcoordInfo.type, vertexSize: texcoordInfo.stride, offset: texcoordInfo.offset },
                    },
                    index: indicesBuffer,
                };
                vertexArrayMaps[mid].push(vertexArray);
            }
        }

        // -- Init Texture
        const imageUrl = "../../assets/img/heightmap.jpg";
        loadImage(imageUrl, function (image)
        {
            // -- Init 2D Texture
            texture = {
                target: "TEXTURE_2D",
                internalformat: "RGB8",
                format: "RGB",
                type: "UNSIGNED_BYTE",
                pixelStore: { unpackFlipY: false },
                storage: { levels: 1, width: 256, height: 256 },
                writeTextures: [{ level: 0, xoffset: 0, yoffset: 0, source: image }],
            };
            sampler = {
                minFilter: "NEAREST",
                magFilter: "NEAREST",
                wrapS: "CLAMP_TO_EDGE",
                wrapT: "CLAMP_TO_EDGE",
            };

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
        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: [],
        };

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

                rp.renderObjects.push({
                    pipeline: {
                        ...program,
                        primitive: { topology: primitive.mode }
                    },
                    vertexArray: vertexArrayMaps[mid][i],
                    uniforms: {
                        mvMatrix: localMV,
                        pMatrix: perspectiveMatrix,
                        displacementMap: { texture, sampler },
                        diffuse: { texture, sampler },
                    },
                    drawElements: { indexCount: primitive.indices.length }
                });
            }
        }
        WebGL.runRenderPass(rc, rp);

        requestAnimationFrame(render);
    }
})();