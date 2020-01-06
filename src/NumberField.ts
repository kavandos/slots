import * as PIXI from "pixi.js";
//@ts-ignore
import TWEEN from "@tweenjs/tween.js";

export default class NumberField extends PIXI.Container {
    value: number;
    bgr: PIXI.Graphics;
    title: PIXI.Text;
    name: string;
    style: object;
    animation: TWEEN.Tween;
    _active: boolean = true;

    constructor (name:string, balance: number) {
        super();

        const style = this.style = {
            fontFamily: "Arial",
            fontSize: 20,
            fill: "white",
            align: "center"
        };
        const width = 100;
        const height = 60;
        this.bgr = this.addChild(new PIXI.Graphics().beginFill(0x555555).drawRect(0,0,width,height));
        this.name = name;
        this.title = this.bgr.addChild(new PIXI.Text( "", style));
        this.title.anchor.set(0.5);
        this.title.position.set(width/2, height/2);
        this.setValue(balance);
    }

    showInactive ():void {
        this._active = false;
        this.title.tint =
            this.bgr.tint = 0x222222;
    }
    showActive ():void {
        this._active = true;
        this.title.tint =
            this.bgr.tint = 0xffffff;
    }
    get active () {return this._active}
    set active (isActive:boolean) {
        isActive ? this.showActive() : this.showInactive();
    }

    setValue (val:number):void {
        this.value = val;
        this.updateTitle();
    }

    updateTitle ():void {
        const valText = this.value.toString();
        this.title.text = `${this.name}:\n ${valText}`;
    }

    animate ():void {
        this.animation && this.animation.stop().end();
        this.animation = new TWEEN.Tween(this.scale)
            .to({
                x: [this.scale.x+0.3, this.scale.x],
                y: [this.scale.y+0.3, this.scale.y]
            }, 1600)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .interpolation(TWEEN.Interpolation.Bezier)
            .start();
    }
}