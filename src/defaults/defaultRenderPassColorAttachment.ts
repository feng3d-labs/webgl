import { IRenderPassColorAttachment } from "../data/IRenderPassColorAttachment";

export const defaultRenderPassColorAttachment: IRenderPassColorAttachment = {
    clearValue: [0, 0, 0, 0],
    loadOp: "clear",
};