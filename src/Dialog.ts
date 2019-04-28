class Dialog extends eui.Component implements  eui.UIComponent {
    private timer: egret.Timer;

	private btnOk: eui.Button;
    private btnCancel: eui.Button;
    private dialog: eui.Group;
    
	public constructor() {
		super();
		this.skinName = "resource/eui_skins/Dialog.exml";
		this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.width = this.stage.stageWidth;
            this.height = this.stage.stageHeight;
        }, this)
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.close();
        }, this)

        this.btnCancel.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.close();
        }, this)
	}

	public show(view: egret.DisplayObjectContainer) {
        if (!view.contains(this)) {
            view.addChild(this);
            const onChange = () => {
              console.log(12121212, this.dialog.x, this.dialog.y);
            };
            egret.Tween.get(this.dialog, { loop: false, onChange, onChangeObj: this.stage }).to({ bottom: 0 }, 300, egret.Ease.sineIn);
        }
    }

    public close() {
        if (this.parent != null)
            egret.Tween.get(this.dialog, { loop: false, onChange: null, onChangeObj: this.stage }).to({ 
                bottom: -300 
            }, 300, egret.Ease.sineIn).call(() => {
                this.parent.removeChild(this);
            });
    }

}