import { $set } from "@feng3d/serialization";
import { RenderAtomic, WebGLRenderer } from "../../../src";

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

const webglRenderer = new WebGLRenderer({ canvasId: "glcanvas" });

const renderAtomic: RenderAtomic = $set(new RenderAtomic(), {
    attributes: {
        position: {
            array: [
                -1, 0,
                0, -1,
                1, 1
            ], itemSize: 2
        },
    },
    uniforms: { color: [1, 0, 0, 1] },
    renderParams: { cullFace: "NONE", enableBlend: true },
    shader: {
        vertex: `
                    precision mediump float;
                    attribute vec2 position;
                    void main () {
                      gl_Position = vec4(position, 0, 1);
                    }
            `,
        fragment: `
            precision mediump float;
            uniform vec4 color;
            void main () {
              gl_FragColor = color;
            }
            ` }
} as gPartial<RenderAtomic>);

function draw()
{
    webglcanvas.width = webglcanvas.clientWidth;
    webglcanvas.height = webglcanvas.clientHeight;
    webglRenderer.render(renderAtomic);
    requestAnimationFrame(draw);
}
draw();
