import { mat4, vec3 } from "gl-matrix";
import { IProgram, IRenderingContext } from "../../../src";
import { IPrimitive, MinimalGLTFLoader } from "./gltf-loader";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
const gl = canvas.getContext("webgl2", { antialias: false });

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
    { vertex: { code: getShaderSource("vs-flat") }, fragment: { code: getShaderSource("fs-flat") } },
    { vertex: { code: getShaderSource("vs-smooth") }, fragment: { code: getShaderSource("fs-smooth") } }
];
const uniformMvpLocations = [gl.getUniformLocation(programs[VIEWPORTS.LEFT], "mvp"), gl.getUniformLocation(programs[VIEWPORTS.RIGHT], "mvp")];
const uniformMvNormalLocations = [gl.getUniformLocation(programs[VIEWPORTS.LEFT], "mvNormal"), gl.getUniformLocation(programs[VIEWPORTS.RIGHT], "mvNormal")];

// -- Load gltf then render
const gltfUrl = "../../assets/gltf/di_model_tri.gltf";
const glTFLoader = new MinimalGLTFLoader.glTFLoader();

glTFLoader.loadGLTF(gltfUrl, function (glTF)
{
    const curScene = glTF.scenes[glTF.defaultScene];

    // -- Initialize vertex array
    const POSITION_LOCATION = 0; // set with GLSL layout qualifier
    const NORMAL_LOCATION = 1; // set with GLSL layout qualifier

    const vertexArrayMaps = {};

    // var in loop
    let mesh: {
        primitives: IPrimitive[];
    };
    let primitive: IPrimitive;
    //  { matrix: mat4, attributes: { [key: string]: { size: number, type: number, stride: number, offset: number } }, vertexBuffer, indices };
    let vertexBuffer;
    let indicesBuffer;
    let vertexArray;

    let i; let len;

    for (const mid in curScene.meshes)
    {
        mesh = curScene.meshes[mid];
        vertexArrayMaps[mid] = [];

        for (i = 0, len = mesh.primitives.length; i < len; ++i)
        {
            primitive = mesh.primitives[i];

            // create buffers
            vertexBuffer = gl.createBuffer();
            indicesBuffer = gl.createBuffer();

            // WebGL2: create vertexArray
            vertexArray = gl.createVertexArray();
            vertexArrayMaps[mid].push(vertexArray);

            // -- Initialize buffer
            const vertices = primitive.vertexBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            const indices = primitive.indices;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            // -- VertexAttribPointer
            const positionInfo = primitive.attributes.POSITION;

            gl.bindVertexArray(vertexArray);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

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

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

            gl.bindVertexArray(null);
        }
    }

    // -- Render preparation
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

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
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

                gl.bindVertexArray(vertexArrayMaps[mid][i]);

                for (i = 0; i < VIEWPORTS.MAX; ++i)
                {
                    gl.useProgram(programs[i]);
                    gl.uniformMatrix4fv(uniformMvpLocations[i], false, localMVP);
                    gl.uniformMatrix4fv(uniformMvNormalLocations[i], false, localMVNormal);

                    gl.viewport(viewport[i].x, viewport[i].y, viewport[i].width, viewport[i].height);

                    gl.drawElements(primitive.mode, primitive.indices.length, primitive.indicesComponentType, 0);
                }

                gl.bindVertexArray(null);
            }
        }

        requestAnimationFrame(render);
    })();
});

