import { List } from 'vanilla_core';

declare class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x: number, y: number, z: number, w: number);
    static zero(): Vec4;
}

type Vec2DJson = {
    x: number;
    y: number;
};
declare class Vec2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static zero(): Vec2D;
    static from_json(json: Vec2DJson): Vec2D;
    to_json(): Vec2DJson;
    clone(): Vec2D;
    to_vec4_zw(z: number, w: number): Vec4;
    tol_equals(other: Vec2D): boolean;
    tol_equals_zero(): boolean;
    times_scalar(a: number): Vec2D;
    dot_prod(other: Vec2D): number;
    norm(): number;
    normalized(): Vec2D;
    plus(x: number, y: number): Vec2D;
    plus_vec(other: Vec2D): Vec2D;
    minus(x: number, y: number): Vec2D;
    minus_vec(other: Vec2D): Vec2D;
    to(target: Vec2D): Vec2D;
    orth_proj_factor(base_vec: Vec2D): number;
    orth_proj(base_vec: Vec2D): Vec2D;
    perp_proj(base_vec: Vec2D): Vec2D;
    is_parallel_with(other: Vec2D): boolean;
    flip_y(): Vec2D;
    min(other: Vec2D): Vec2D;
    max(other: Vec2D): Vec2D;
}

declare class Mat22 {
    a: number;
    b: number;
    c: number;
    d: number;
    constructor(a: number, b: number, c: number, d: number);
    plus(other: Mat22): Mat22;
    minus(other: Mat22): Mat22;
    times_vec(vec: Vec2D): Vec2D;
    times_mat(other: Mat22): Mat22;
    det(): number;
    adjoint(): Mat22;
    inverse(): Mat22;
}

declare let TOL: number;
declare namespace NumberExtensions {
    function load(): void;
}
declare global {
    interface Number {
        deq(other: number): boolean;
        deq_zero(): boolean;
        times_vec_2d(vec: Vec2D): Vec2D;
        times_math_22(mat: Mat22): Mat22;
        cos(): number;
        sin(): number;
    }
}

declare namespace Color {
    type Raw = {
        r: number;
        g: number;
        b: number;
        a: number;
    };
}
declare class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a: number);
    static white(): Color;
    static black(): Color;
    static parse_hex(hex: string): Color;
    with_alpha(alpha: number): Color;
    clone(): Color;
    mix(factor: number, b_color: Color): Color;
    rgba_str(): string;
    hex_str(): string;
    to_gl_color(): GlColor;
    times_color(other: Color): Color;
    times_vec4(vec: Vec4): Color;
    darken(pctg: number): Color;
    lighten(pctg: number): Color;
}

declare class GlColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a: number);
    static white(): GlColor;
    static black(): GlColor;
    clone(): GlColor;
    to_vec4(): Vec4;
    to_monochromatic_triangle_list(): List<GlColor>;
    to_monochromatic_quad_list(): List<GlColor>;
    with_alpha(alpha: number): GlColor;
    times(other: Color): Color;
}

declare class Triangle4D {
    a: Vec4;
    b: Vec4;
    c: Vec4;
    constructor(a: Vec4, b: Vec4, c: Vec4);
    static of_gl_color(gl_color: GlColor): Triangle4D;
    get_vertices(): [Vec4, Vec4, Vec4];
    private static gl_color_to_vec4;
}

declare class Triangle2D {
    a: Vec2D;
    b: Vec2D;
    c: Vec2D;
    constructor(a: Vec2D, b: Vec2D, c: Vec2D);
    get_vertices(): List<Vec2D>;
    to_vec4_zw(z: number, w: number): Triangle4D;
}

declare class Dimension2D {
    width: number;
    height: number;
    constructor(width: number, height: number);
    static zero(): Dimension2D;
    clone(): Dimension2D;
}

declare namespace AlRect2DCorner {
    type Tag = "BL" | "BR" | "TR" | "TL";
    type Class = {
        tag: Tag;
        opposing: () => AlRect2DCorner.Class;
    };
    const Enum: Record<Tag, Class>;
}

type AlRect2DJson = {
    bl_vec: Vec2DJson;
    width: number;
    height: number;
};
declare class AlRect2D {
    bl_vec: Vec2D;
    width: number;
    height: number;
    constructor(bl_vec: Vec2D, width: number, height: number);
    static zero(): AlRect2D;
    static with_center(center_cec: Vec2D, width: number, height: number): AlRect2D;
    static of_opposing_vecs(a_vec: Vec2D, b_vec: Vec2D): AlRect2D;
    static from_json(json: AlRect2DJson): AlRect2D;
    to_json(): AlRect2DJson;
    dimensions(): Dimension2D;
    with_center(center: Vec2D): AlRect2D;
    scale_to_contain(other: AlRect2D): AlRect2D;
    scale_to_fit(other: AlRect2D): AlRect2D;
    clone(): AlRect2D;
    center(): Vec2D;
    contains(vec: Vec2D): boolean;
    vertices(): List<Vec2D>;
    vertex(index: number): Vec2D;
    vertex_by_corner(corner: AlRect2DCorner.Class): Vec2D;
    triangles(): [Triangle2D, Triangle2D];
}

declare class Circle2D {
    center: Vec2D;
    radius: number;
    constructor(center: Vec2D, radius: number);
    constains(vec: Vec2D): boolean;
    triangles(n: number): List<Triangle2D>;
}

declare class LineIntersection2D {
    readonly union: {
        tag: "none";
    } | {
        tag: "point";
        point: Vec2D;
    } | {
        tag: "line";
        line: Line2D;
    };
    constructor(union: {
        tag: "none";
    } | {
        tag: "point";
        point: Vec2D;
    } | {
        tag: "line";
        line: Line2D;
    });
}

declare class Line2D {
    a: Vec2D;
    b: Vec2D;
    constructor(a: Vec2D, b: Vec2D);
    clone(): Line2D;
    contains(vec: Vec2D): boolean;
    intersection(other: Line2D): LineIntersection2D;
}

declare class LineSegment2D {
    a: Vec2D;
    b: Vec2D;
    constructor(a: Vec2D, b: Vec2D);
    mid_vec(): Vec2D;
}

export { AlRect2D, AlRect2DCorner, type AlRect2DJson, Circle2D, Color, Dimension2D, GlColor, Line2D, LineIntersection2D, LineSegment2D, Mat22, NumberExtensions, TOL, Triangle2D, Triangle4D, Vec2D, type Vec2DJson, Vec4 };
