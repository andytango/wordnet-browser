import { is } from "ramda";

export const isString = is(String) as (a: any) => a is string;

export const isNumber = is(Number) as (a: any) => a is number;

export const isBoolean = is(Boolean) as (a: any) => a is boolean;
