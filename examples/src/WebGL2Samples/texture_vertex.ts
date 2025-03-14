import { CanvasContext, GLVertexAttributeTypes, IIndicesDataTypes, RenderPassObject, PrimitiveTopology, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes, VertexDataTypes, VertexFormat, vertexFormatMap } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { mat4, vec3 } from "gl-matrix";
import { GlTFLoader, Primitive } from "./third-party/gltf-loader";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const IDrawMode2Name: { [key: string]: PrimitiveTopology } = {
        0: "point-list",
        3: "line-strip",
        2: "LINE_LOOP",
        1: "line-list",
        5: "triangle-strip",
        6: "TRIANGLE_FAN",
        4: "triangle-list",
    };

    const VertexAttributeType2Name = Object.freeze({
        5126: "FLOAT",
        5120: "BYTE",
        5122: "SHORT",
        5121: "UNSIGNED_BYTE",
        5123: "UNSIGNED_SHORT",
        5131: "HALF_FLOAT",
        5124: "INT",
        5125: "UNSIGNED_INT",
        36255: "INT_2_10_10_10_REV",
        33640: "UNSIGNED_INT_2_10_10_10_REV"
    });

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false }};
    const webgl = new WebGL(rc);

    // -- Init program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        depthStencil: { depthCompare: "less" },
    };

    const vertexArrayMaps: { [key: string]: { vertices?: VertexAttributes, indices: IIndicesDataTypes }[] } = {};

    // var in loop
    let mesh;
    let primitive: Primitive;
    let vertexBuffer: VertexDataTypes;
    let indicesBuffer: IIndicesDataTypes;

    let texture: Texture;
    let sampler: Sampler;

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
                vertexBuffer = vertices;

                const indices = primitive.indices;
                indicesBuffer = indices;

                // -- VertexAttribPointer
                const positionInfo = primitive.attributes.POSITION;
                const normalInfo = primitive.attributes.NORMAL;
                const texcoordInfo = primitive.attributes.TEXCOORD_0;

                //
                vertexArrayMaps[mid].push({
                    vertices: {
                        position: { data: vertexBuffer, format: getIVertexFormat(positionInfo.size, VertexAttributeType2Name[positionInfo.type]), arrayStride: positionInfo.stride, offset: positionInfo.offset },
                        normal: { data: vertexBuffer, format: getIVertexFormat(normalInfo.size, VertexAttributeType2Name[normalInfo.type]), arrayStride: normalInfo.stride, offset: normalInfo.offset },
                        texcoord: { data: vertexBuffer, format: getIVertexFormat(texcoordInfo.size, VertexAttributeType2Name[texcoordInfo.type]), arrayStride: texcoordInfo.stride, offset: texcoordInfo.offset },
                    }, indices: indicesBuffer
                });
            }
        }

        // -- Init Texture
        const imageUrl = "../../assets/img/heightmap.jpg";
        loadImage(imageUrl, function (image)
        {
            // -- Init 2D Texture
            texture = {
                format: "rgba8unorm",
                mipLevelCount: 1,
                size: [256, 256],
                sources: [{ image, flipY: false }],
            };
            sampler = {
                minFilter: "nearest",
                magFilter: "nearest",
                addressModeU: "clamp-to-edge",
                addressModeV: "clamp-to-edge",
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
        const renderObjects: RenderPassObject[] = [];
        // -- Render
        const rp: RenderPass = {
            descriptor: {
                colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
                depthStencilAttachment: { depthLoadOp: "clear" }
            },
            renderObjects,
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

                renderObjects.push({
                    pipeline: {
                        ...program,
                    },
                    uniforms: {
                        mvMatrix: localMV,
                        pMatrix: perspectiveMatrix,
                        displacementMap: { texture, sampler },
                        diffuse: { texture, sampler },
                    },
                    geometry:{
                        primitive: { topology: IDrawMode2Name[primitive.mode] },
                        vertices: vertexArrayMaps[mid][i].vertices,
                        indices: vertexArrayMaps[mid][i].indices,
                        draw: { __type__: "DrawIndexed", indexCount: primitive.indices.length }
                    }
                });
            }
        }

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);
    }
})();

function getIVertexFormat(numComponents: 1 | 2 | 3 | 4, type: GLVertexAttributeTypes = "FLOAT", normalized = false): VertexFormat
{
    for (const key in vertexFormatMap)
    {
        const element = vertexFormatMap[key];
        if (
            element.numComponents === numComponents
            && element.type === type
            && !element.normalized === !normalized
        )
        {
            return key as VertexFormat;
        }
    }

    console.error(`没有找到与 ${JSON.stringify({ numComponents, type, normalized })} 对应的顶点数据格式！`);

    return undefined;
}