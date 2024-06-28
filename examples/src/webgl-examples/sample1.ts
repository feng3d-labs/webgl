// see https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample1/webgl-demo.js
// https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/

import { WebGLRenderer } from "../../../src";

function main()
{
    const webglRenderer = WebGLRenderer.init({ canvasId: "glcanvas", contextId: "webgl" });

    webglRenderer.submit({
        renderPasss: [
            {
                passDescriptor: {
                    colorAttachments: [{
                        clearValue: [1, 0, 0, 0.5],
                        loadOp: "clear",
                    }],
                },
            }
        ],
    });
    webglRenderer.submit({
        renderPasss: [
            {
                passDescriptor: {
                    colorAttachments: [{
                        clearValue: [1, 1, 0, 0.5],
                        loadOp: "clear",
                    }],
                    clearMask: [],
                },
            }
        ],
    });
}

window.onload = main;
