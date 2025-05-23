import { RenderObject, Submit } from "@feng3d/render-api";
import { SamplerTexture, WebGL } from "@feng3d/webgl";
import * as mat4 from "./stackgl/gl-mat4";
import { reactive } from "@feng3d/reactivity";

(async () =>
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const webgl = new WebGL({ canvasId: "glcanvas" });

    const cubePosition = [
        [-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5], // positive z face.
        [+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], // positive x face
        [+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], // negative z face
        [-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], // negative x face.
        [-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5], // top face
        [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5] // bottom face
    ];

    const cubeUv = [
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive z face.
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive x face.
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative z face.
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative x face.
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // top face
        [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0] // bottom face
    ];

    const cubeElements = [
        [2, 1, 0], [2, 0, 3], // positive z face.
        [6, 5, 4], [6, 4, 7], // positive x face.
        [10, 9, 8], [10, 8, 11], // negative z face.
        [14, 13, 12], [14, 12, 15], // negative x face.
        [18, 17, 16], [18, 16, 19], // top face.
        [20, 21, 22], [23, 20, 22] // bottom face
    ];

    const positions = cubePosition.reduce((pv: number[], cv: number[]) =>
    {
        cv.forEach((v) => { pv.push(v); });

        return pv;
    }, []);

    const uvs = cubeUv.reduce((pv: number[], cv: number[]) =>
    {
        cv.forEach((v) => { pv.push(v); });

        return pv;
    }, []);

    const indices = cubeElements.reduce((pv: number[], cv: number[]) =>
    {
        cv.forEach((v) => { pv.push(v); });

        return pv;
    }, []);

    let tick = 0;
    let viewportWidth = 1;
    let viewportHeight = 1;

    const renderObject: RenderObject = {
        vertices: {
            position: { data: new Float32Array(positions), format: "float32x3" },
            uv: { data: new Float32Array(uvs), format: "float32x2" },
        },
        indices: new Uint16Array(indices),
        draw: { __type__: "DrawIndexed", indexCount: indices.length },
        bindingResources: {},
        pipeline: {
            vertex: {
                code: `precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUv;
        uniform mat4 projection, view;
        void main() {
          vUv = uv;
          gl_Position = projection * view * vec4(position, 1);
        }` },
            fragment: {
                code: `precision mediump float;
        varying vec2 vUv;
        uniform sampler2D tex;
        void main () {
          gl_FragColor = texture2D(tex,vUv);
        }`,
                targets: [{ blend: {} }],
            },
            depthStencil: { depthWriteEnabled: true },
        }
    };

    const submit: Submit = {
        commandEncoders: [{
            passEncoders: [
                {
                    renderPassObjects: [renderObject]
                }
            ]
        }]
    };

    function draw()
    {
        tick++;

        viewportWidth = canvas.width = canvas.clientWidth;
        viewportHeight = canvas.height = canvas.clientHeight;

        const t = 0.01 * tick;
        reactive(renderObject.bindingResources).view = mat4.lookAt([],
            [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)],
            [0, 0.0, 0],
            [0, 1, 0]);
        reactive(renderObject.bindingResources).projection
            = mat4.perspective([],
                Math.PI / 4,
                viewportWidth / viewportHeight,
                0.01,
                10);

        webgl.submit(submit);

        requestAnimationFrame(draw);
    }

    const img = new Image();
    img.src = "../../assets/peppers.png";
    await img.decode();

    const diffuse: SamplerTexture = {
        texture: {
            size: [img.width, img.height],
            sources: [{ image: img }]
        }, sampler: { minFilter: "linear" }
    };
    reactive(renderObject.bindingResources).tex = diffuse;

    draw();
})();