import { RenderPass, Material, Submit, RenderObject, VertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

(function ()
{
    // --Init Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    // --Init WebGL Context
    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: Material = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init Buffer
    const elementData = new Uint16Array([
        0, 1, 2,
        2, 3, 0
    ]);

    //vec3 position, vec3 normal, vec4 color
    const vertices = new Float32Array([
        -1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ]);

    //mat4 P, mat4 MV, mat3 Mnormal
    const transforms = {
        transform: {
            P: [1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
            MV: [0.5, 0.0, 0.0, 0.0,
                0.0, 0.5, 0.0, 0.0,
                0.0, 0.0, 0.5, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
            Mnormal: [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
        }
    };

    const lightPos = {
        light: {
            position: [0.0, 0.0, 0.0]
        }
    };

    //vec3 ambient, diffuse, specular, float shininess
    const material = {
        material: {
            ambient: [0.1, 0.0, 0.0],
            diffuse: [0.5, 0.0, 0.0],
            specular: [1.0, 1.0, 1.0],
            shininess: 4.0,
        }
    };

    // -- Init Vertex Array
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: vertices, format: "float32x3", arrayStride: 40, offset: 0 },
            normal: { data: vertices, format: "float32x3", arrayStride: 40, offset: 12 },
            color: { data: vertices, format: "float32x4", arrayStride: 40, offset: 24 },
        },
    };

    const ro: RenderObject = {
        pipeline: program,
        uniforms: {
            PerDraw: transforms,
            PerPass: lightPos,
            PerScene: material,
        },
        geometry:{
            vertices: vertexArray.vertices,
            indices: elementData,
            draw: { __type: "DrawIndexed", indexCount: 6, firstIndex: 0 }
        },
    };

    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    const submit: Submit = { commandEncoders: [{ passEncoders: [rp] }] };

    let uTime = 0;
    function render()
    {
        uTime += 0.01;

        // -- update uniform buffer
        transforms.transform.MV[0] = 0.1 * Math.cos(uTime) + 0.4;
        transforms.transform.MV = transforms.transform.MV; // 强制更新

        lightPos.light.position[0] = Math.cos(3 * uTime);
        lightPos.light.position[1] = Math.sin(6 * uTime);
        lightPos.light.position = lightPos.light.position; // 强制更新

        webgl.submit(submit);

        requestAnimationFrame(render);
    }

    render();
})();
