import type { Manager } from "../lib";
import { DrawableComponent, Vector2, WorldLocationComponent } from "../lib";

export function demoDrawables(manager: Manager) {
    const e = manager.createEntity();
    manager.setComponent(e, new WorldLocationComponent({
        loc: Vector2.new(60, -40),
    }));
    manager.setComponent(e, new DrawableComponent({
        drawables: [
            { type: "TEXT", size: 8, fontWeight: 700, color: "#fff", content: "DRAWABLES", offset: Vector2.new(0, -10) },

            { type: "RECT", color: "#f0f", width: 16, height: 32, offset: Vector2.new(0, 0) },
            { type: "RECT", color: "#0ff", width: 32, height: 8, offset: Vector2.new(0, 40) },
            { type: "RECT", strokeColor: "#f90", width: 8, height: 8, strokeWidth: 3, offset: Vector2.new(0, 54) },
            { type: "RECT", color: "#fff", width: 16, height: 16, alpha: 0.5, offset: Vector2.new(0, 58) },

            { type: "ELLIPSE", color: "#0f0", width: 8, height: 8, offset: Vector2.new(0, 88) },
            { type: "ELLIPSE", color: "#090", width: 8, height: 2, offset: Vector2.new(0, 110) },
            { type: "ELLIPSE", color: "#0f9", width: 2, height: 8, offset: Vector2.new(0, 110) },
            { type: "ELLIPSE", color: "#09f", width: 2, height: 8, rotation: Math.PI / 4, offset: Vector2.new(0, 134) },
            { type: "ELLIPSE", strokeColor: "#99f", width: 2, height: 8, rotation: -Math.PI / 4, offset: Vector2.new(0, 134) },
            { type: "ELLIPSE", strokeColor: "#90f", width: 16, height: 4, strokeWidth: 3, offset: Vector2.new(30, 88) },
            { type: "ELLIPSE", color: "#fff", width: 8, height: 8, alpha: 0.5, offset: Vector2.new(20, 96) },

            { type: "SPRITE", width: 40, height: 30, imageSrc: "/assets/img/bars.jpg", offset: Vector2.new(38, 0) },
            { type: "SPRITE", width: 30, height: 30, imageSrc: "/assets/img/frog.png", alpha: 0.5, offset: Vector2.new(38, 16) },

            { type: "TEXT", content: "default text TEXT 123", offset: Vector2.new(38, 60) },
            { type: "TEXT", content: "size 4, monospace, center, bold", size: 4, font: "monospace", align: "center", fontWeight: 700, offset: Vector2.new(62, 70) },
            { type: "TEXT", content: "size 3, serif, right, regular", size: 3, font: "serif", align: "right", fontWeight: 400, offset: Vector2.new(90, 80) },

            { type: "PATH", path: [[0, 0], [8, 0], [0, 6]], color: "#f99", offset: Vector2.new(20, 120) },
            { type: "PATH", path: [[0, 0], [8, 8], [0, 16], [16, 32]], strokeColor: "#f99", strokeWidth: 3, alpha: 0.5, offset: Vector2.new(34, 120) },
        ],
    }));
}
