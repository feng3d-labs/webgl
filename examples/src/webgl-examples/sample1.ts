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
                        clearColor: [1, 0, 0, 0.5],
                    }],
                    clearMask: ["COLOR_BUFFER_BIT"],
                },
            }
        ],
    });
}

window.onload = main;
