import { Buffer } from "@feng3d/render-api";

/**
 * WebGL 统一缓冲区。
 */
export class IGLUniformBuffer extends Buffer
{
    target: "UNIFORM_BUFFER" = "UNIFORM_BUFFER";
}
