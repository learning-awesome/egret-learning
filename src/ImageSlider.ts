class ImageSlider extends eui.Component implements  eui.UIComponent {
    private timer: egret.Timer;

    private btnClose: eui.Image;
	private btnOk: eui.Button;
    private btnCancel: eui.Button;
    private dialog: eui.Group;
    private scrollView: ScrollView;

	public constructor() {
		super();
		this.skinName = "resource/eui_skins/ImageSlider.exml";
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
	}

	public init(view: egret.DisplayObjectContainer) {
        if (!view.contains(this)) {
            view.addChild(this);
			this.scrollView.init();
        }
    }

}