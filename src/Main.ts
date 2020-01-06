import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import Slots from "./Slots";
import Button from "./Button";


export default class Main {
    static base = {width: 600, height: 600};
    static app: PIXI.Application;
    static width = Main.base.width;
    static height = Main.base.height;
    static container: HTMLElement;
    static stage: PIXI.Container;
    static slots: Slots;
    static startButton: Button;
    static stopButton: Button;

    static init (container : HTMLElement|undefined) {
        container = container || document.body;
        Main.container = container;

        Main.app = new PIXI.Application({
            width: Main.base.width,
            height: Main.base.height,
            antialias: true,
        });
        Main.app.ticker.add( Main.tick );

        Main.app.view.style.position = "absolute";
        Main.app.view.style.left = "0";
        Main.app.view.style.top = "0";
        document.body.appendChild( Main.app.view );

        Main.stage = Main.app.stage;

        // // DEBUG RECTANGLE
        // Main.stage.addChild(new PIXI.Graphics().beginFill(255).drawRect(-300,-300,600,600));


        Main.slots = Main.stage.addChild(new Slots());

        // UI
        // todo balance, total win, stake selector

        Main.startButton = Main.stage.addChild(new Button("Start", 0x00cc00));
        Main.startButton.on("action", Main.onStart);

        Main.stopButton = Main.stage.addChild(new Button("Stop", 0xcc0000));
        Main.stopButton.on("action", Main.stopSlots);
        Main.stopButton.deactivate();

        Main.slots.on("stopReels", Main.onStop);

        Main.resize();
    }

    static onStop() {
        Main.startButton.activate();
        Main.stopButton.deactivate();
    }

    static onStart () {
        const length = Main.slots.reelLength;
        const rollNumbers = [
            Math.floor(Math.random()*length) + length,
            Math.floor(Math.random()*length) + 2*length,
            Math.floor(Math.random()*length) + 3*length,
        ];
        Main.slots.rollByTiles(rollNumbers);
        Main.stopButton.activate()
    }

    static stopSlots () {
        Main.stopButton.deactivate();
        Main.slots.stopNow();
    }

    static resize(){
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = w/h;

        Main.container.style.width = w+"px";
        Main.container.style.height = h+"px";
        Main.app.view.style.width = w+"px";
        Main.app.view.style.height = h+"px";

        let appW = Main.base.width,
            appH = Main.base.height;

        if (ratio > appW/appH) {
            appW = appH * ratio;
        } else {
            appH = appW / ratio;
        }

        Main.app.renderer.resize(appW, appH);
        Main.width = appW;
        Main.height = appH;
        Main.stage.position.set(0.5*appW, 0.5*appH);

        Main.startButton.position.set(
            -Main.startButton.width/2-10,
            appH/2-Main.startButton.height*0.6
        );
        Main.stopButton.position.set(
            Main.stopButton.width/2+10,
            appH/2-Main.stopButton.height*0.6
        );
    }

    static tick(){
        // let elapsedMS = Main.app.ticker.elapsedMS;
        TWEEN.update();
    }
}