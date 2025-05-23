import { CanvasContext, IndicesDataTypes, RenderPass, RenderPassObject, RenderPipeline, VertexAttributes, VertexFormat, Viewport } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { GlTFLoader, Primitive } from "./third-party/gltf-loader";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
const webgl = new WebGL(rc);

// -- Divide viewport
const canvasSize = {
    x: canvas.width,
    y: canvas.height
};

const VIEWPORTS = {
    LEFT: 0,
    RIGHT: 1,
    MAX: 2
};

const viewport: Viewport[] = new Array(VIEWPORTS.MAX);

viewport[VIEWPORTS.LEFT] = {
    x: 0,
    y: canvasSize.y - canvasSize.x / 2 - 50,
    width: canvasSize.x / 2,
    height: canvasSize.x / 2
};

viewport[VIEWPORTS.RIGHT] = {
    x: canvasSize.x / 2,
    y: canvasSize.y - canvasSize.x / 2 - 50,
    width: canvasSize.x / 2,
    height: canvasSize.x / 2
};

// -- Initialize program
const programs: RenderPipeline[] = [
    {
        vertex: { code: getShaderSource("vs-flat") }, fragment: { code: getShaderSource("fs-flat") },
        depthStencil: { depthCompare: "less-equal" },
        primitive: { topology: "triangle-list" },
    },
    {
        vertex: { code: getShaderSource("vs-smooth") }, fragment: { code: getShaderSource("fs-smooth") },
        depthStencil: { depthCompare: "less-equal" },
        primitive: { topology: "triangle-list" },
    }
];
// -- Load gltf then render
const gltfUrl = "../../assets/gltf/di_model_tri.gltf";
const glTFLoader = new GlTFLoader();

glTFLoader.loadGLTF(gltfUrl, function (glTF)
{
    const curScene = glTF.scenes[glTF.defaultScene];

    // -- Initialize vertex array
    const vertexArrayMaps: {
        [key: string]: { vertexArray: { vertices?: VertexAttributes }, indices: IndicesDataTypes }[]
    } = {};

    // var in loop
    let mesh: {
        primitives: Primitive[];
    };
    let primitive: Primitive;
    //  { matrix: mat4, attributes: { [key: string]: { size: number, type: number, stride: number, offset: number } }, vertexBuffer, indices };
    let vertexArray: { vertices?: VertexAttributes };

    let i: number; let len: number;

    for (const mid in curScene.meshes)
    {
        mesh = curScene.meshes[mid];
        vertexArrayMaps[mid] = [];

        for (i = 0, len = mesh.primitives.length; i < len; ++i)
        {
            primitive = mesh.primitives[i];

            // create buffers

            // WebGL2: create vertexArray

            // -- Initialize buffer
            const vertices = primitive.vertexBuffer;

            const indices = primitive.indices;

            // -- VertexAttribPointer
            const positionInfo = primitive.attributes.POSITION;
            const normalInfo = primitive.attributes.NORMAL;

            vertexArray = {
                vertices: {
                    position: {
                        data: vertices, format: (["float32", "float32x2", "float32x3", "float32x4"] as VertexFormat[])[positionInfo.size],
                        arrayStride: positionInfo.stride, offset: positionInfo.offset
                    },
                    normal: {
                        data: vertices, format: (["float32", "float32x2", "float32x3", "float32x4"] as VertexFormat[])[normalInfo.size],
                        arrayStride: normalInfo.stride, offset: normalInfo.offset
                    },
                },
            };
            vertexArrayMaps[mid].push({ vertexArray, indices });
        }
    }

    // -- Render preparation
    const translate = vec3.create();
    vec3.set(translate, 0, -18, -60);
    const scale = vec3.create();
    const s = 0.3;
    vec3.set(scale, s, s, s);
    const modelView = mat4.create();
    mat4.translate(modelView, modelView, translate);
    mat4.scale(modelView, modelView, scale);

    const rotatationSpeedY = 0.01;

    const perspective = mat4.create();
    mat4.perspective(perspective, 0.785, 1, 1, 1000);

    const localMV = mat4.create();
    const localMVP = mat4.create();
    const localMVNormal = mat4.create();

    // -- Render loop
    (function render()
    {
        const renderObjects: RenderPassObject[] = [];
        const rp: RenderPass = {
            descriptor: {
                colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
                depthStencilAttachment: { depthLoadOp: "clear" }
            },
            renderPassObjects: renderObjects,
        };

        mat4.rotateY(modelView, modelView, rotatationSpeedY);

        for (const mid in curScene.meshes)
        {
            mesh = curScene.meshes[mid];

            for (i = 0, len = mesh.primitives.length; i < len; ++i)
            {
                primitive = mesh.primitives[i];

                mat4.multiply(localMV, modelView, primitive.matrix);
                mat4.multiply(localMVP, perspective, localMV);

                mat4.invert(localMVNormal, localMV);
                mat4.transpose(localMVNormal, localMVNormal);

                const vertexArray = vertexArrayMaps[mid][i].vertexArray;
                const indices = vertexArrayMaps[mid][i].indices;

                for (i = 0; i < VIEWPORTS.MAX; ++i)
                {
                    renderObjects.push(
                        {
                            viewport: viewport[i],
                            pipeline: programs[i],
                            bindingResources: {
                                mvp: localMVP,
                                mvNormal: localMVNormal,
                            },
                            vertices: vertexArray.vertices,
                            indices,
                            draw: { __type__: "DrawIndexed", indexCount: primitive.indices.length, firstIndex: 0 },
                        });
                }
            }
        }

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);
    })();
});

