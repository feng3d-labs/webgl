import { IRenderObject, WebGL } from "@feng3d/webgl-renderer";

/**
 * 让T中以及所有键值中的所有键都是可选的
 */
export type gPartial<T> = {
    [P in keyof T]?: T[P] | gPartial<T[P]>;
};

const webglcanvas = document.createElement("canvas");
webglcanvas.id = "glcanvas";
webglcanvas.style.position = "fixed";
webglcanvas.style.left = "0px";
webglcanvas.style.top = "0px";
webglcanvas.style.width = "100%";
webglcanvas.style.height = "100%";
document.body.appendChild(webglcanvas);

const renderObject: IRenderObject = {
    vertexArray: {
        vertices: {
            position: {
                buffer: {
                    target: "ARRAY_BUFFER",
                    data: new Float32Array([
                        -1, 0,
                        0, -1,
                        1, 1
                    ])
                }, numComponents: 2
            },
        }
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
        depthStencil: { depth: { depthtest: true } },
    }
};

function draw()
{
    webglcanvas.width = webglcanvas.clientWidth;
    webglcanvas.height = webglcanvas.clientHeight;

    WebGL.runRenderPass({ canvasId: "glcanvas" }, {
        renderObjects: [renderObject]
    });

    requestAnimationFrame(draw);
}
draw();
