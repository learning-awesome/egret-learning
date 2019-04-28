/**
*  文 件 ScrollView.ts
*  功    能： 滚动组件
*  内    容： 自定义组件，支持多张图片水平(垂直)切换滚动
* 
* Example:
* 1. 从自定义组件中找到ScrollView，并拖动到exml上
* 2. 将需要显示对象(图片等)拖动到ScrollView的Group下
* 3. 设置Group的布局为垂直or水平
*
* see https://www.cnblogs.com/gamedaybyday/p/6251346.html
* see https://developer.egret.com/cn/article/index/id/611
*/
class ScrollView extends eui.Scroller {
    /**页面总数*/
    public itemNum: number;
    /**单页尺寸*/
    public itemSize: number;
    /**当前第几项  0表示第1项*/
    public curItemCount: number = 0;
    /**滚动时间 从一页滑动到另一页的时间*/
    public delayScroll: number = 200;
    /**是否是水平滚动*/
    public isHScroller: Boolean;
    /**触摸起始位置*/
    private touchStartPos: number;
    /**记录开始划动时间*/
    private startTime:number;
    /**翻页时间阈值，在阈值内完成划动，划动距离不需要大于屏幕1/3，也会向手指划动方向翻页 */
    private immediatelyTime:number = 80;
    //是否第一次移动，用于记录移动开始时间
    private bFirstMove:boolean = true;


    /**
     * 初始化
     */
    public init(){
        //立即验证，获取width、height
        this.validateNow();
        
        //判断是垂直还是水平滚动
        var widthDist: number = this.viewport.contentWidth - this.viewport.width;
        console.log('>>widthDist', this.viewport.contentWidth, this.viewport.width, this.viewport);
        if(widthDist > 0) {
            this.isHScroller = true;
            this.itemSize = this.viewport.width;
            this.itemNum = this.viewport.contentWidth / this.viewport.width;
        } else {
            this.isHScroller = false;
            this.itemSize = this.viewport.height;
            this.itemNum = this.viewport.contentHeight / this.viewport.height;
        }
        
        //滚动容器设置
        this.throwSpeed = 0;
        this.bounces = true;
        this.addEventListener(eui.UIEvent.CHANGE_START,this.onChangeStartHandler,this);
        this.addEventListener(eui.UIEvent.CHANGE, this.onChangeHanlder, this);
        this.addEventListener(eui.UIEvent.CHANGE_END,this.onChangeEndHandler,this);
    }


    /**拖动开始*/
    private onChangeStartHandler() {
        this.bFirstMove = true;
    }

    //第一次移动开始，记录开始时间
    private onChangeHanlder(e:eui.UIEvent){
        if(this.bFirstMove){
            this.bFirstMove = false;
            this.startTime = egret.getTimer();
            if(this.isHScroller) {
                this.touchStartPos = this.viewport.scrollH;
            } else {
                this.touchStartPos = this.viewport.scrollV;
            }
            egret.Tween.removeTweens(this.viewport);
        }
    }
    
    /**拖动结束*/
    private onChangeEndHandler(): void {
        if(this.touchStartPos == -1){ //防点击触发changeend，因为如果不禁止，单纯点击touch_tap也能触发change_end事件，也会翻页
            return;
        }
        var dict: number; //手指划动距离
        if(this.isHScroller) {
            dict = this.viewport.scrollH - this.touchStartPos;
        } else {
            dict = this.viewport.scrollV - this.touchStartPos;
        }

        //短时间内划动，划动距离小于1/3屏幕也能翻页
        if(egret.getTimer() - this.startTime < this.immediatelyTime){
            if(dict > 10) {
                this.scrollToNext();
            } else if(dict < 10) {
                this.scrollToLast();
            }
        //计算划动距离大过1/3屏幕，才会翻页，否会回弹到当前页面
        }else{
            if(dict > this.viewport.width/3) {
                this.scrollToNext();
            } else if(dict < -this.viewport.width/3) {
                this.scrollToLast();
            }else{
                this.scrollToItem(this.curItemCount);
            }
        }
        //防touch_tap触发change_end
        this.touchStartPos = -1;
    }
    
    /**滑动到下一项*/
    public scrollToNext(): void {
        var item: number = this.curItemCount;
        if(item < this.itemNum - 1) {
            item++;
        }
        this.scrollToItem(item);
    }
    
    /**滑动到上一项*/
    public scrollToLast(): void {
        var item: number = this.curItemCount;
        if(item > 0) {
            item--;
        }
        this.scrollToItem(item);
    }
    /**
     * 滚动到指定项 (0是第一项)
     * @item 指定项
     */
    public scrollToItem(item: number): void {
        if(item >= 0 && item < this.itemNum) {
            this.curItemCount = item;
            egret.Tween.removeTweens(this.viewport);
            if(this.isHScroller) {
                egret.Tween.get(this.viewport).to({ scrollH: item * this.itemSize,ease: egret.Ease.quadOut },this.delayScroll);
            } else {
                egret.Tween.get(this.viewport).to({ scrollV: item * this.itemSize,ease: egret.Ease.quadOut },this.delayScroll);
            }
        }
    }
    
    /**启用组件触摸 */
    public enableTouch(){
        this.touchEnabled = true;
        this.touchChildren = true;
    }
    
    /**禁用组件触摸 */
    public disableTouch(){
        this.touchChildren = false;
        this.touchEnabled = false;
    }
    
    /**销毁*/
    public destroy() {

    }
}