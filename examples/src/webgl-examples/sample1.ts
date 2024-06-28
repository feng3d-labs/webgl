// see https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample1/webgl-demo.js
// https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/

import { WebGLRenderer } from "../../../src";

function main()
{
    WebGLRenderer.submit({
        canvasContext: { canvasId: "glcanvas", contextId: "webgl" },
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
}

window.onload = main;
