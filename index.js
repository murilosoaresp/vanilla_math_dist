import { CoreExtensions, List, exaustive_switch } from 'vanilla_core';

class Vec4 {
    x;
    y;
    z;
    w;
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static zero() {
        return new Vec4(0.0, 0.0, 0.0, 0.0);
    }
}

class Vec2D {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Vec2D(0.0, 0.0);
    }
    static from_json(json) {
        return new Vec2D(json.x, json.y);
    }
    to_json() {
        return {
            x: this.x,
            y: this.y,
        };
    }
    clone() {
        return new Vec2D(this.x, this.y);
    }
    to_vec4_zw(z, w) {
        return new Vec4(this.x, this.y, z, w);
    }
    tol_equals(other) {
        return this.x.deq(other.x) && this.y.deq(other.y);
    }
    tol_equals_zero() {
        return this.tol_equals(Vec2D.zero());
    }
    times_scalar(a) {
        return new Vec2D(a * this.x, a * this.y);
    }
    dot_prod(other) {
        return this.x * other.x + this.y * other.y;
    }
    norm() {
        return this.dot_prod(this).sqrt();
    }
    normalized() {
        return (1.0 / this.norm()).times_vec_2d(this);
    }
    plus(x, y) {
        return new Vec2D(this.x + x, this.y + y);
    }
    plus_vec(other) {
        return new Vec2D(this.x + other.x, this.y + other.y);
    }
    minus(x, y) {
        return new Vec2D(this.x - x, this.y - y);
    }
    minus_vec(other) {
        return new Vec2D(this.x - other.x, this.y - other.y);
    }
    shift_to(target) {
        return target.minus_vec(this);
    }
    orth_proj_factor(base_vec) {
        return this.dot_prod(base_vec) / base_vec.dot_prod(base_vec);
    }
    orth_proj(base_vec) {
        return this.orth_proj_factor(base_vec).times_vec_2d(base_vec);
    }
    perp_proj(base_vec) {
        let orthProj = this.orth_proj(base_vec);
        return this.minus_vec(orthProj);
    }
    is_parallel_with(other) {
        return this.perp_proj(other).tol_equals_zero();
    }
    flip_y() {
        return new Vec2D(this.x, -this.y);
    }
    min(other) {
        return new Vec2D(this.x.min(other.x), this.y.min(other.y));
    }
    max(other) {
        return new Vec2D(this.x.max(other.x), this.y.max(other.y));
    }
}

class Mat22 {
    a;
    b;
    c;
    d;
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    plus(other) {
        return new Mat22(this.a + other.a, this.b + other.b, this.c + other.c, this.d + other.d);
    }
    minus(other) {
        return new Mat22(this.a - other.a, this.b - other.b, this.c - other.c, this.d - other.d);
    }
    times_vec(vec) {
        return new Vec2D(this.a * vec.x + this.b * vec.y, this.c * vec.x + this.d * vec.y);
    }
    times_mat(other) {
        return new Mat22(this.a * other.a + this.b * other.c, this.a * other.b + this.b * other.d, this.c * other.a + this.d * other.c, this.c * other.b + this.d * other.d);
    }
    det() {
        return this.a * this.d - this.c * this.b;
    }
    adjoint() {
        return new Mat22(this.d, -this.b, -this.c, this.a);
    }
    inverse() {
        return (1.0 / this.det()).times_math_22(this.adjoint());
    }
}

CoreExtensions.load();
let TOL = 0.000_000_1;
var NumberExtensions;
(function (NumberExtensions) {
    function load() { }
    NumberExtensions.load = load;
})(NumberExtensions || (NumberExtensions = {}));
Number.prototype.deq = function (other) {
    return (this - other).abs() <= TOL;
};
Number.prototype.deq_zero = function () {
    return this.deq(0.0);
};
Number.prototype.times_vec_2d = function (vec) {
    return new Vec2D(this * vec.x, this * vec.y);
};
Number.prototype.times_math_22 = function (mat) {
    return new Mat22(this * mat.a, this * mat.b, this * mat.c, this * mat.d);
};
Number.prototype.cos = function () {
    return Math.cos(this);
};
Number.prototype.sin = function () {
    return Math.sin(this);
};

class Triangle4D {
    a;
    b;
    c;
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    static of_gl_color(gl_color) {
        let vec4 = this.gl_color_to_vec4(gl_color);
        return new Triangle4D(vec4, vec4, vec4);
    }
    get_vertices() {
        return [this.a, this.b, this.c];
    }
    static gl_color_to_vec4(color) {
        return new Vec4(color.r, color.g, color.b, color.a);
    }
}

class Triangle2D {
    a;
    b;
    c;
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    get_vertices() {
        return List.of([this.a.clone(), this.b.clone(), this.c.clone()]);
    }
    to_vec4_zw(z, w) {
        return new Triangle4D(this.a.to_vec4_zw(z, w), this.b.to_vec4_zw(z, w), this.c.to_vec4_zw(z, w));
    }
}

class Dimension2D {
    width;
    height;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    static zero() {
        return new Dimension2D(0.0, 0.0);
    }
    clone() {
        return new Dimension2D(this.width, this.height);
    }
}

class AlRect2D {
    bl_vec;
    width;
    height;
    constructor(bl_vec, width, height) {
        this.bl_vec = bl_vec;
        this.width = width;
        this.height = height;
    }
    static zero() {
        let blVec = Vec2D.zero();
        return new AlRect2D(blVec, 0.0, 0.0);
    }
    static with_center(center_cec, width, height) {
        let blVec = center_cec.minus(0.5 * width, 0.5 * height);
        return new AlRect2D(blVec, width, height);
    }
    static of_opposing_vecs(a_vec, b_vec) {
        let min_vec = a_vec.min(b_vec);
        let max_vec = a_vec.max(b_vec);
        return new AlRect2D(min_vec, max_vec.x - min_vec.x, max_vec.y - min_vec.y);
    }
    static from_json(json) {
        return new AlRect2D(Vec2D.from_json(json.bl_vec), json.width, json.height);
    }
    to_json() {
        return {
            bl_vec: this.bl_vec.to_json(),
            width: this.width,
            height: this.height,
        };
    }
    dimensions() {
        return new Dimension2D(this.width, this.height);
    }
    with_center(center) {
        return AlRect2D.with_center(center, this.width, this.height);
    }
    scale_to_contain(other) {
        let width_factor = other.width / this.width;
        let height_factor = other.height / this.height;
        let factor = width_factor.max(height_factor);
        return new AlRect2D(this.bl_vec, factor * this.width, factor * this.height);
    }
    scale_to_fit(other) {
        let width_factor = other.width / this.width;
        let height_factor = other.height / this.height;
        let factor = width_factor.min(height_factor);
        return new AlRect2D(this.bl_vec, factor * this.width, factor * this.height);
    }
    clone() {
        return new AlRect2D(this.bl_vec.clone(), this.width, this.height);
    }
    center() {
        return this.bl_vec.plus(0.5 * this.width, 0.5 * this.height);
    }
    contains(vec) {
        let shift = vec.minus_vec(this.bl_vec);
        return 0.0 <= shift.x && shift.x <= this.width
            && 0.0 <= shift.y && shift.y <= this.height;
    }
    vertices() {
        let list = new List();
        list.push(this.bl_vec.clone());
        list.push(this.bl_vec.plus(this.width, 0.0));
        list.push(this.bl_vec.plus(this.width, this.height));
        list.push(this.bl_vec.plus(0.0, this.height));
        return list;
    }
    vertex(index) {
        switch (index) {
            case 0: return this.bl_vec.clone();
            case 1: return this.bl_vec.plus(this.width, 0.0);
            case 2: return this.bl_vec.plus(this.width, this.height);
            case 3: return this.bl_vec.plus(0.0, this.height);
            default: throw new Error();
        }
    }
    vertex_by_corner(corner) {
        switch (corner.tag) {
            case "BL": return this.bl_vec.clone();
            case "BR": return this.bl_vec.plus(this.width, 0.0);
            case "TR": return this.bl_vec.plus(this.width, this.height);
            case "TL": return this.bl_vec.plus(0.0, this.height);
        }
    }
    triangles() {
        let vertices = this.vertices();
        return [
            new Triangle2D(vertices.get(0), vertices.get(1), vertices.get(2)),
            new Triangle2D(vertices.get(0), vertices.get(2), vertices.get(3)),
        ];
    }
}

var AlRect2DCorner;
(function (AlRect2DCorner) {
    AlRect2DCorner.Enum = {
        "BL": {
            tag: "BL",
            opposing: function () { return AlRect2DCorner.Enum.TR; },
        },
        "BR": {
            tag: "BR",
            opposing: function () { return AlRect2DCorner.Enum.TL; },
        },
        "TL": {
            tag: "TL",
            opposing: function () { return AlRect2DCorner.Enum.BR; },
        },
        "TR": {
            tag: "TR",
            opposing: function () { return AlRect2DCorner.Enum.BL; },
        },
    };
})(AlRect2DCorner || (AlRect2DCorner = {}));

class Circle2D {
    center;
    radius;
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    constains(vec) {
        return this.center.shift_to(vec).norm() <= this.radius;
    }
    triangles(n) {
        let output = new List();
        let angle_step = (2.0 * Math.PI) / n;
        let angle = 0.0;
        for (let i = 0; i < n; i++) {
            let a = this.center.clone();
            let b = new Vec2D(angle.cos(), angle.sin()).times_scalar(this.radius).plus_vec(a);
            let c = new Vec2D((angle + angle_step).cos(), (angle + angle_step).sin()).times_scalar(this.radius).plus_vec(a);
            let triangle = new Triangle2D(a, b, c);
            output.push(triangle);
            angle += angle_step;
        }
        return output;
    }
}

class LineIntersection2D {
    union;
    constructor(union) {
        this.union = union;
    }
}
// export namespace LineIntersection {
//     export type Union =
//         {
//             tag: "none"
//         } | {
//             tag: "point"
//             point: Vec2
//         } | {
//             tag: "line"
//             line: Line
//         }
// }
// export class LineIntersection {
//     private constructor(union: LineIntersection.Union) { }
//     static Of(union: LineIntersection.Union) { return new LineIntersection(union) }
// }

class Line2D {
    a;
    b;
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    clone() {
        return new Line2D(this.a.clone(), this.b.clone());
    }
    contains(vec) {
        let ab = this.b.minus_vec(this.a);
        let av = vec.minus_vec(this.a);
        let av_proj = av.orth_proj(ab);
        let av_norm = ab.minus_vec(av_proj);
        return av_norm.tol_equals_zero();
    }
    intersection(other) {
        if (this.contains(other.a) && this.contains(other.b)) {
            return new LineIntersection2D({
                tag: "line",
                line: other.clone()
            });
        }
        let this_shift = this.b.minus_vec(this.a);
        let other_shift = other.b.minus_vec(other.a);
        if (this_shift.is_parallel_with(other_shift)) {
            return new LineIntersection2D({ tag: "none" });
        }
        let this_base = this.a;
        let other_base = other.a;
        let system_mat = new Mat22(this_shift.x, -other_shift.x, this_shift.y, -other_shift.y);
        let system_vec = new Vec2D(other_base.x - this_base.x, other_base.y - this_base.y);
        let system_solution = system_mat.inverse().times_vec(system_vec);
        let intersection = this_base.plus_vec(system_solution.x.times_vec_2d(this_shift));
        return new LineIntersection2D({ tag: "point", point: intersection });
    }
}

class LineSegment2D {
    a;
    b;
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    mid_vec() {
        return this.a.plus_vec(this.b).times_scalar(0.5);
    }
}

class UiAlRect {
    tl_vec;
    width;
    height;
    constructor(tl_vec, width, height) {
        this.tl_vec = tl_vec;
        this.width = width;
        this.height = height;
    }
    vertex(corner) {
        switch (corner.tag) {
            case "TL":
                return this.tl_vec.clone();
            case "TR":
                return this.tl_vec.plus(this.width, 0.0);
            case "BR":
                return this.tl_vec.plus(this.width, this.height);
            case "BL":
                return this.tl_vec.plus(0.0, this.height);
            default:
                exaustive_switch(corner.tag);
        }
    }
    vertices() {
        return [
            this.tl_vec.plus(0.0, this.height),
            this.tl_vec.plus(this.width, this.height),
            this.tl_vec.plus(this.width, 0.0),
            this.tl_vec.clone(),
        ];
    }
    center() {
        return this.tl_vec.plus(0.5 * this.width, 0.5 * this.height);
    }
}

class GlColor {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static white() {
        return new GlColor(1.0, 1.0, 1.0, 1.0);
    }
    static black() {
        return new GlColor(0.0, 0.0, 0.0, 0.0);
    }
    clone() {
        return new GlColor(this.r, this.g, this.b, this.a);
    }
    to_vec4() {
        return new Vec4(this.r, this.g, this.b, this.a);
    }
    to_monochromatic_triangle_list() {
        return List.of([this.clone(), this.clone(), this.clone()]);
    }
    to_monochromatic_quad_list() {
        return List.of([this.clone(), this.clone(), this.clone(), this.clone()]);
    }
    with_alpha(alpha) {
        return new GlColor(this.r, this.g, this.b, alpha);
    }
    times(other) {
        return new Color(this.r * other.r, this.g * other.g, this.b * other.b, this.a * other.a);
    }
}

class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static white() { return new Color(255, 255, 255, 1.0); }
    static black() { return new Color(0, 0, 0, 1.0); }
    static parse_hex(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        return new Color(r, g, b, 1);
    }
    with_alpha(alpha) {
        return new Color(this.r, this.g, this.b, alpha);
    }
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
    mix(factor, b_color) {
        let comp_factor = 1.0 - factor;
        return new Color((factor * this.r) + (comp_factor * b_color.r), (factor * this.g) + (comp_factor * b_color.g), (factor * this.b) + (comp_factor * b_color.b), (factor * this.a) + (comp_factor * b_color.a));
    }
    rgba_str() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    hex_str() {
        let r = this.r.toString(16);
        let g = this.g.toString(16);
        let b = this.b.toString(16);
        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;
        return "#" + r + g + b;
    }
    to_gl_color() {
        return new GlColor(this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a);
    }
    times_color(other) {
        let thisArray = [this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a];
        let otherArray = [other.r / 255.0, other.g / 255.0, other.b / 255.0, other.a];
        let mulArray = [thisArray[0] * otherArray[0], thisArray[1] * otherArray[1], thisArray[2] * otherArray[2], thisArray[3] * otherArray[3]];
        return new Color(255.0 * mulArray[0], 255.0 * mulArray[1], 255.0 * mulArray[2], mulArray[3]);
    }
    times_vec4(vec) {
        return new Color(this.r * vec.x, this.g * vec.y, this.b * vec.z, this.a * vec.w);
    }
    darken(pctg) {
        return new Color((1.0 - pctg) * this.r, (1.0 - pctg) * this.g, (1.0 - pctg) * this.b, this.a);
    }
    lighten(pctg) {
        return new Color(this.r + (pctg * (255 - this.r)), this.g + (pctg * (255 - this.g)), this.b + (pctg * (255 - this.b)), this.a);
    }
}

export { AlRect2D, AlRect2DCorner, Circle2D, Color, Dimension2D, GlColor, Line2D, LineIntersection2D, LineSegment2D, Mat22, NumberExtensions, TOL, Triangle2D, Triangle4D, UiAlRect, Vec2D, Vec4 };
