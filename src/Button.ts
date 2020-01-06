import * as PIXI from "pixi.js";

export default class Button extends PIXI.Container {
    bgr: PIXI.Graphics;
    inactiveTitle: PIXI.Text;
    activated: PIXI.Graphics;
    _active:boolean;

    constructor(title: string, activeColor: number|undefined) {
        super();

        if (activeColor === undefined) activeColor = 0x00ff00;

        const bgr = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRoundedRect(-100, -35, 200, 70, 20);
        const style = {
            fontFamily: "Arial",
            fontSize: 36,
            fill: "black"
        };

        this.bgr = this.addChild( bgr.clone() );
        this.bgr.tint = 0x555555;
        this.inactiveTitle = this.bgr.addChild(new PIXI.Text(title, style));
        this.inactiveTitle.anchor.set(0.5);

        this.activated = this.addChild( bgr.clone());
        this.activated.tint = activeColor;
        this.activated.addChild(
            new PIXI.Text(title, Object.assign({}, style, {fill:0xffffff}))
        ).anchor.set(0.5);

        this.interactive = true;
        this.buttonMode = true;
        this.on("pointerdown", this.deactivate, this);
        this.on("pointerdown", this.onAction, this);
    }

    onAction () {
        this.emit("action", this);
    }

    activate () {
        this._active = true;
        this.interactive = true;
        this.activated.visible = true;
    }
    deactivate () {
        this._active = false;
        this.interactive = false;
        this.activated.visible = false;
    }
    get active () {
        return this._active;
    }
    set active (isActive:boolean) {
        isActive ? this.activate() : this.deactivate();
    }
}