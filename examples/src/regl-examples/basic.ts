import { IRenderObject } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

/**
 * 让T中以及所有键值中的所有键都是可选的
 */
export type gPartial<T> = {
    [P in keyof T]?: T[P] | gPartial<T[P]>;
};

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const webgl = new WebGL({ canvasId: "glcanvas" });

const renderObject: IRenderObject = {
    geometry: {
        vertices: {
            position: {
                data: new Float32Array([
                    -1, 0,
                    0, -1,
                    1, 1
                ]),
                format: "float32x2",
            },
        },
        draw: { __type: "DrawVertex", vertexCount: 3 },
    },
    uniforms: { color: [1, 0, 0, 1] },
    pipeline: {
        vertex: {
            code: `
                    precision mediump float;
                    attribute vec2 position;
                    void main () {
                      gl_Position = vec4(position, 0, 1);
                    }
            ` },
        fragment: {
            code: `
            precision mediump float;
            uniform vec4 color;
            void main () {
              gl_FragColor = color;
            }
            `,
            targets: [{ blend: {} }],
        },
        depthStencil: {},
    },
};

function draw()
{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    webgl.submit({
        commandEncoders: [{
            passEncoders: [
                {
                    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1] }], depthStencilAttachment: { depthClearValue: 1 } },
                    renderObjects: [renderObject]
                }
            ]
        }]
    });

    requestAnimationFrame(draw);
}
draw();
