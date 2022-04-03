import { LazyObject } from "@feng3d/polyfill";

export type LazyUniforms = LazyObject<Uniforms>;

export interface Uniforms extends MixinsUniforms
{
}

declare global
{
    interface MixinsUniforms
    {

    }
}