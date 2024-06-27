// see https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample1/webgl-demo.js
// https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/

import { WebGLRenderer } from "../../../../src";

function main()
{
    const webglRenderer = WebGLRenderer.init({ canvasId: "glcanvas", contextId: "webgl" });

    webglRenderer.submit({
        renderPasss: [
            {
                passDescriptor: {
                    clearColor: [0, 0, 0, 1],
                    clearMask: ["COLOR_BUFFER_BIT"],
                },
            }
        ],
    });
}

window.onload = main;
