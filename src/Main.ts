import * as PIXI from "pixi.js";
//@ts-ignore
import TWEEN from "@tweenjs/tween.js";
import Slots from "./Slots";
import Button from "./Button";
import NumberField from "./NumberField";
import Tile from "./Tile";


export default class Main {
    static base = {width: 600, height: 600};
    static app: PIXI.Application;
    static width = Main.base.width;
    static height = Main.base.height;
    static container: HTMLElement;
    static stage: PIXI.Container;
    static slots: Slots;
    static winRow: number = 1;
    static currentTilesMap: Tile[][];

    static startButton: Button;
    static stopButton: Button;

    static balance: NumberField;
    static currentWin: NumberField;
    static stake: NumberField;

    static plus: PIXI.Graphics;
    static minus: PIXI.Graphics;
    static isEnoughMoney: boolean = false;
    static isRolling: boolean = false;

    static init (container : HTMLElement|undefined) {

        Object.defineProperty(window, "main", {value: Main});

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


        // YOU MIGHT MOVE PARAMS TO CONFIG IF NEEDED
        Main.slots = Main.stage.addChild(new Slots());

        Main.balance =      Main.stage.addChild(new NumberField("Balance", 100));
        Main.stake =        Main.stage.addChild(new NumberField("Bet", 5));
        Main.currentWin =   Main.stage.addChild(new NumberField("Win", 0));

        Main.plus =   Main.stake.addChild(new PIXI.Graphics().beginFill(0xbb00)
            .drawRect(-12,-4,24,8)
            .drawRect(-4,-12,8,24)
        );
        Main.plus.position.set(Main.stake.width - Main.plus.width*.5, Main.stake.height/2 - Main.plus.width*.6);
        Main.plus.interactive = true;
        Main.plus.buttonMode = true;
        Main.plus.on("pointerdown", Main.onPlus);

        Main.minus =  Main.stake.addChild(new PIXI.Graphics().beginFill(0xbb0000)
            .drawRect(-12,-4,24,8)
        );
        Main.minus.position.set(Main.plus.x, Main.stake.height/2 + Main.minus.width*.6);
        Main.minus.interactive = true;
        Main.minus.buttonMode = true;
        Main.minus.on("pointerdown", Main.onMinus);


        Main.startButton = Main.stage.addChild(new Button("Start", 0x00cc00));
        Main.startButton.on("action", Main.onStart);

        Main.stopButton = Main.stage.addChild(new Button("Stop", 0xcc0000));
        Main.stopButton.on("action", Main.stopSlots);
        Main.stopButton.deactivate();

        Main.resize();
    }

    static onPlus () {
        Main.stake.setValue( Main.stake.value+1 );
        Main.checkState();
    };
    static onMinus () {
        Main.stake.setValue( Main.stake.value-1 );
        Main.checkState();
    };
    static checkState ():void {
        console.log("check balance");
        Main.isEnoughMoney = (Main.balance.value > Main.stake.value);

        Main.balance.active = Main.isEnoughMoney;
        Main.startButton.active = !Main.isRolling && Main.isEnoughMoney;
    }

    static onStop() {
        Main.isRolling = false;
        Main.stopButton.deactivate();
        Main.checkWin();
        Main.checkState();
    }

    static onStart () {
        Main.isRolling = true;
        Main.stopButton.activate();

        Main.balance.setValue( Main.balance.value - Main.stake.value );
        Main.currentWin.setValue( 0 );
        Main.checkState();

        const length = Main.slots.reelLength;
        const rollNumbers = [
            Math.floor(Math.random()*length) + length,
            Math.floor(Math.random()*length) + 2*length,
            Math.floor(Math.random()*length) + 3*length,
        ];
        const promise = Main.slots.rollByTiles(rollNumbers);
        promise.then(function(results: Tile[][]){
            Main.currentTilesMap = results;
            Main.onStop();
        });
    }

    static stopSlots () {
        Main.stopButton.deactivate();
        Main.slots.stopNow();
    }

    static checkWin(){
        const matchNum = Main.calculateMatchNumber();
        console.log(matchNum);
        if (matchNum > 1) {
            Main.currentWin.setValue( Main.stake.value*matchNum );
            Main.balance.setValue( Main.balance.value + Main.currentWin.value );
            Main.balance.animate();
        } else {
            Main.currentWin.setValue(0);
        }
    }

    static calculateMatchNumber(): number {
        // GET THE ROW AND CHECK FOR MATCHES

        const groupTypes: Tile[][] = [];
        const row: Tile[] = [];
        Main.currentTilesMap.forEach( reel => {
            const tile = reel[Main.winRow];
            let currType = groupTypes.find(tiles=> (tiles.length && tiles[0].typeId === tile.typeId ));
            if (!currType) {
                currType = [];
                groupTypes.push(currType);
            }
            currType.push(tile);
        });
        const quantities = groupTypes.map(tt=>tt.length)
        return Math.max.apply(null, quantities);
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

        Main.balance.position.set( -appW*0.48, -appH/2);
        Main.stake.position.set( -appW*0.48, -appH/2 + 80);
        Main.currentWin.position.set( -appW*0.48, -appH/2 + 80*2);
    }

    static tick(){
        // let elapsedMS = Main.app.ticker.elapsedMS;

        TWEEN.update();
    }
}