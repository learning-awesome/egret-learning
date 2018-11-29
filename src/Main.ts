//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends eui.UILayer {

    private touchStatus: boolean = false;
    private triggerScale: boolean = false;
    private scale: number = 0;
    private logo: egret.Bitmap;
    private distance: egret.Point = new egret.Point();
    private timer: egret.Timer;
    private pointer = new egret.Shape();
    private rainParticle: particle.GravityParticleSystem;
    private ballParticle: particle.GravityParticleSystem;
    private container: egret.DisplayObjectContainer;
    private rectShape: egret.Shape;


    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());


        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await this.loadTheme();
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    private textfield: egret.TextField;
    /**
     * 创建场景界面
     * Create scene interface
     */
    protected createGameScene(): void {
        this.createBitmapByName("egret_icon_png");
        this.createRemoveButton();
        // 缩放
        this.createScaleButton();
        // 时钟
        this.createCloak();
        // 下雨效果
        this.createRain();
        // 火焰效果
        this.createBall();
        // 容器
        this.createContainer();
    }

    private createContainer() {
        const button = new eui.Button();
        button.label = "容器";
        button.width = 80;
        button.height = 40;
        button.x = 420;
        button.y = 150;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, () => { 
            if (this.container == null ) {
                this.container = new egret.DisplayObjectContainer();
                this.container.x = 400;
                this.container.y = 10;
                this.addChild(this.container);
                
                this.rectShape = new egret.Shape();
                this.rectShape.graphics.lineStyle(10, 0xd71345, 1, true)
                this.rectShape.graphics.lineTo(0,0);
                this.rectShape.graphics.lineTo(130,0);
                this.rectShape.graphics.lineTo(130,130);
                this.rectShape.graphics.lineTo(0,130);
                this.rectShape.graphics.lineTo(0,0);
                this.rectShape.graphics.endFill();
                this.container.addChild(this.rectShape);
            }
          
            if (this.getChildIndex(this.logo) != -1) {
                this.removeChild(this.logo);
                this.container.addChild(this.logo);
                this.logo.scaleX = this.logo.scaleY = 0.8;
                this.logo.x = this.rectShape.width / 2 - this.logo.width / 2;
                this.logo.y = this.rectShape.height / 2 - this.logo.height / 2;
            }
        }, this);
    }

    private createBall() {
        const button = new eui.Button();
        button.label = "篝火";
        button.width = 80;
        button.height = 40;
        button.x = 320;
        button.y = 150;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (this.ballParticle == null) {
                const texture = RES.getRes("ballParticle_png");
                const config = RES.getRes("ballParticle_json");
                this.ballParticle = new particle.GravityParticleSystem(texture, config); 
                this.addChild(this.ballParticle);
                this.ballParticle.start();
                this.ballParticle.x = this.stage.stageWidth / 2;
                this.ballParticle.y = this.stage.$stageHeight / 2;
                this.ballParticle.emitterX = 0;
                this.ballParticle.emitterY = 0;
                this.ballParticle.scaleX = this.ballParticle.scaleY = 1.5;
            }
        }, this);
    }

    private createRain() {
        const button = new eui.Button();
        button.label = "下雨";
        button.width = 80;
        button.height = 40;
        button.x = 220;
        button.y = 150;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (this.rainParticle == null) {
                const texture = RES.getRes("silver_png");
                const config = RES.getRes("silverRain_json");
                this.rainParticle = new particle.GravityParticleSystem(texture, config);
                this.addChild(this.rainParticle);
            }
            this.rainParticle.start(1000);
        }, this);
    }

    private createScaleButton() {
        const button = new eui.Button();
        button.label = "缩放";
        button.width = 80;
        button.height = 40;
        button.x = 120;
        button.y = 150;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.triggerScale = !this.triggerScale;
        }, this);
        // 监听 ENTER_FRAME 将会按照帧频进行回调
        this.addEventListener(egret.Event.ENTER_FRAME, () => {
            if (this.triggerScale) {
                const scale =  0.5 + 0.5* Math.abs(Math.sin( this.scale += 0.03 ) );;
                this.logo.scaleX = scale;
                this.logo.scaleY = scale;
            }
        },this);
    }
    
    private createRemoveButton() {
        const button = new eui.Button();
        button.label = "移动";
        button.width = 80;
        button.height = 40;
        button.x = 10;
        button.y = 150;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRemoveButtonClick, this);
    }

    private createCloak() {
        /*** 生成表盘 ***/
        const circle = new egret.Shape();
        circle.graphics.lineStyle(5, 0x000000, 1, true)
        circle.graphics.drawCircle(0,0,60);
        circle.graphics.endFill();
        circle.x = this.stage.stageWidth / 2 ;
        circle.y = 70;
        this.addChild(circle);

        /*** 生成指针 ***/
        this.pointer = new egret.Shape();
        this.pointer.graphics.beginFill(0x000000);
        this.pointer.graphics.drawRect(0, 0, 55, 5);
        this.pointer.graphics.endFill();
        this.pointer.anchorOffsetY = this.pointer.height / 2;
        this.pointer.x = this.stage.stageWidth / 2 ;
        this.pointer.y = 60;
        this.addChild(this.pointer);

        this.timer = new egret.Timer(1000, 0);
        this.timer.addEventListener(egret.TimerEvent.TIMER, () => {
            this.pointer.rotation += 6;
            if(this.pointer.rotation > 360){
                this.pointer.rotation -= 360;
            }
        }, this);
        
        /*** 点击舞台的时候会调用延迟方法 ***/
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if(this.timer.running){
                this.timer.stop();
            }else{
                this.timer.start();
            }
        }, this); 
        this.timer.start();
    }

    private onRemoveButtonClick(e: egret.TouchEvent) {
        const direction: number = Math.random() > 0.5 ? -1 : 1;
        // 移动时，同时旋转 
        const onChange = () => {
            this.logo.rotation += 6 * direction;
        };
        // 缓动动画
        egret.Tween.get(this.logo, { loop: false, onChange, onChangeObj: this }).to({ x: 200, y: 400 }, 300, egret.Ease.sineIn);
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        this.logo = new egret.Bitmap();
        this.logo.texture = RES.getRes(name);
        this.logo.touchEnabled = true;
        this.logo.x = 10;
        this.logo.y = 200;
        this.logo.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.mouseDown, this);
        this.logo.addEventListener(egret.TouchEvent.TOUCH_END, this.mouseUp, this);
        this.addChild(this.logo);
        return this.logo;
    }

    private mouseDown(evt: egret.TouchEvent) {
        console.log("Mouse Down.", evt.stageX, evt.stageY, this.logo.x, this.logo.y);
        this.touchStatus = true;
        this.distance.x = evt.stageX - this.logo.x;
        this.distance.y = evt.stageY - this.logo.y;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    }

    private mouseMove(evt: egret.TouchEvent) {
        if (this.touchStatus) {
            console.log("moving now ! Mouse: [X:" + evt.stageX + ",Y:" + evt.stageY + "]");
            this.logo.x = evt.stageX - this.distance.x;
            this.logo.y = evt.stageY - this.distance.y;
        }
    }

    private mouseUp(evt: egret.TouchEvent) {
        console.log("Mouse Up.");
        this.touchStatus = false;
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    }
}
