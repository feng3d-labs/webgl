import { CopyTextureToTexture } from "@feng3d/render-api";
import { getGLBlitFramebuffer } from "../caches/getGLBlitFramebuffer";
import { runBlitFramebuffer } from "./runBlitFramebuffer";

export function runCopyTextureToTexture(gl: WebGLRenderingContext, copyTextureToTexture: CopyTextureToTexture)
{
    const blitFramebuffer = getGLBlitFramebuffer(copyTextureToTexture);
    runBlitFramebuffer(gl, blitFramebuffer);
}

