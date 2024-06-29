import { IRenderPassColorAttachment } from "../data/IRenderPassColorAttachment";
import { defaultRenderPassColorAttachment } from "../defaults/defaultRenderPassColorAttachment";

export function getRenderPassColorAttachment(colorAttachment: IRenderPassColorAttachment)
{
    colorAttachment = Object.assign({}, defaultRenderPassColorAttachment, colorAttachment);

    return colorAttachment;
}