import { mat4, vec3 } from "gl-matrix";
import { IBuffer, IIndexBuffer, IProgram, IRenderPass, IRenderingContext, IVertexArrayObject, WebGL } from "../../../src";
import { IPrimitive, MinimalGLTFLoader } from "./gltf-loader";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

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

const viewport: { x: number, y: number, width: number, height: number }[] = new Array(VIEWPORTS.MAX);

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
const programs: IProgram[] = [
    {
        vertex: { code: getShaderSource("vs-flat") }, fragment: { code: getShaderSource("fs-flat") },
        primitive: { topology: "TRIANGLES" },
        depthStencil: { depth: { depthtest: true, depthCompare: "LEQUAL" } },
    },
    {
        vertex: { code: getShaderSource("vs-smooth") }, fragment: { code: getShaderSource("fs-smooth") },
        primitive: { topology: "TRIANGLES" },
        depthStencil: { depth: { depthtest: true, depthCompare: "LEQUAL" } },
    }
];
// -- Load gltf then render
const gltfUrl = "../../assets/gltf/di_model_tri.gltf";
const glTFLoader = new MinimalGLTFLoader.glTFLoader();

glTFLoader.loadGLTF(gltfUrl, function (glTF)
{
    const curScene = glTF.scenes[glTF.defaultScene];

    // -- Initialize vertex array
    const vertexArrayMaps: {
        [key: string]: IVertexArrayObject[]
    } = {};

    // var in loop
    let mesh: {
        primitives: IPrimitive[];
    };
    let primitive: IPrimitive;
    //  { matrix: mat4, attributes: { [key: string]: { size: number, type: number, stride: number, offset: number } }, vertexBuffer, indices };
    let vertexBuffer: IBuffer;
    let indicesBuffer: IIndexBuffer;
    let vertexArray: IVertexArrayObject;

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
            vertexBuffer = { data: vertices, usage: "STATIC_DRAW" };

            const indices = primitive.indices;
            indicesBuffer = { data: indices, usage: "STATIC_DRAW" };

            // -- VertexAttribPointer
            const positionInfo = primitive.attributes.POSITION;
            const normalInfo = primitive.attributes.NORMAL;

            vertexArray = {
                vertices: {
                    position: {
                        buffer: vertexBuffer, numComponents: positionInfo.size, normalized: false,
                        vertexSize: positionInfo.stride, offset: positionInfo.offset
                    },
                    normal: {
                        buffer: vertexBuffer, numComponents: normalInfo.size, normalized: false,
                        vertexSize: normalInfo.stride, offset: normalInfo.offset
                    },
                },
                index: indicesBuffer,
            };
            vertexArrayMaps[mid].push(vertexArray);
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
        const rp: IRenderPass = {
            passDescriptor: {
                colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }],
                depthStencilAttachment: { depthLoadOp: "clear" }
            },
            renderObjects: [],
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

                for (i = 0; i < VIEWPORTS.MAX; ++i)
                {
                    rp.renderObjects.push({
                        pipeline: programs[i],
                        vertexArray: vertexArrayMaps[mid][i],
                        uniforms: {
                            mvp: localMVP,
                            mvNormal: localMVNormal,
                        },
                        viewport: viewport[i],
                        drawElements: { indexCount: primitive.indices.length, firstIndex: 0 },
                    });
                }
            }
        }
        WebGL.runRenderPass(rc, rp);

        requestAnimationFrame(render);
    })();
});

