var ViewsNavigator = {
	
	views:{},
	currentViewData:null,
	
	init:function()
	{
		this.hideViews();
	},
	
	go:function(id)
	{
		var viewData = this.views[id];
		if (viewData == null) return;
		this.hideViews ();
		
		if (this.currentViewData && this.currentViewData.hide) this.currentViewData.hide();
		
		setTimeout (function(){
			viewData.view.style.display = "block";
			this.currentViewData = viewData;
			if (this.currentViewData.show) this.currentViewData.show();
		}, 100);
		
	},
	
	add:function(id, showCallback, hideCallback)
	{
		var view = document.getElementById(id);
		this.views[id] = {view:view, show:showCallback, hide:hideCallback};
	},
	
	hideViews:function ()
	{
		for (var i in this.views)
		{
			this.views[i].view.style.display = "none";
		}
	}
}