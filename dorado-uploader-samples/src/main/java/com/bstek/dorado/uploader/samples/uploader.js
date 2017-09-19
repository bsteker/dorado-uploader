/** @Bind #autoUploadAction.beforeFileUpload */
!function( self, form){
	//动态设置参数
	var entity = form.get("entity");
	self.set("parameter", {
		param1: entity.get("param1"),
		param2: entity.get("param2")
	});
	//上面代码可以简写为
	//self.set("parameter", entity.toJSON());
};

/** @Bind #autoUploadAction.onFileUploaded */
!function(arg) {
	//获取FileResolver方法返回的信息
	var info = arg.returnValue;
	dorado.MessageBox.alert("fileName : " + info.fileName + "\n" + 
			"absolutePath : " + info.absolutePath);
};

/** @Bind #autoUploadAction.onUploadProgress */
!function(arg, autoUploadProgressBar) {
	autoUploadProgressBar.set("value", arg.total.percent);
};

/** @Bind #btnDelete.onClick */
!function(batchUploadAction, gridFiles1){
	var selections = gridFiles1.get("selection");

	if(!selections){
		return;
	}

	if(!selections.length){
		selections = [selections];
	}

	var selectionCopy = [];
	for (var i = 0; i < selections.length; i++) {
		selectionCopy.push(selections[i]);
	}

	for(var i=0;i<selectionCopy.length;i++){
		var entity = selectionCopy[i];
		batchUploadAction.removeFile(entity.get('id'));
		entity.remove();
	}
};

/** @Bind #btnStartUpload.onClick */
!function(self, btnStopUpload, batchUploadAction){
	view.set("^batch.disabled", true);
	btnStopUpload.set("disabled", false);
	batchUploadAction.start();
};

/** @Bind #btnStopUpload.onClick */
!function(self, batchUploadAction){
	batchUploadAction.stop();
	view.set("^batch.disabled", false);
	self.set("disabled", true);
};

var ProgressCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, {
    createSubControl: function(arg) {
        return new dorado.widget.ProgressBar({
            value:arg.data.get("percent")
        });
    },

    refreshSubControl: function(progressBar, arg) {
		progressBar.set("value", arg.data.get("percent"));
    }
});


/** @Bind #gridFiles1.onCreate */
/** @Bind #gridFiles2.onCreate */
!function(self){
	self.set("&percent.renderer", new ProgressCellRenderer());
};

var prettySize = function(value) {
	var _format = function(value, unit) {
		return (value.toFixed(1) + ' ' + unit).replace('.0', '');
	};
	var K = 1024;
	var M = K * K;
	var G = M * K;
	var T = G * K;
	var dividers = [ T, G, M, K, 1 ];
	var units = [ 'TB', 'GB', 'MB', 'KB', 'B' ];
	if (value == 0) {
		return '0B';
	} else if (value < 0) {
		return 'Invalid size';
	}

	var result = '';
	var temp = 0;
	for ( var i = 0; i < dividers.length; i++) {
		var divider = dividers[i];
		if (value >= divider) {
			temp = value / divider;
			if (temp < 1.05) {
				result = _format(value,
						units[((i + 1) < units.length) ? (i + 1) : i]);
			} else {
				result = _format(temp, units[i]);
			}
			break;
		}
	}
	return result;
};

/** @Bind #gridFiles1.#size.onRenderCell */
/** @Bind #gridFiles2.#size.onRenderCell */
!function(arg){
	arg.dom.innerHTML = prettySize(arg.data.get('size'));
};

var UploadCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, {
    createSubControl: function(arg) {
    	var data = arg.data;
    	var actionId = dorado.Core.newId();
    	var buttonId = dorado.Core.newId();
    	var uploadAction = new dorado.widget.UploadAction({
    		id : actionId,
    		maxFileSize: "1MB",
    		autoUpload: true,
    		iconClass: "fa fa-upload",
    		fileResolver: "myUploadProcessor#process1",
    		onFilesAdded: function(arg){
    			var file = arg.files[0];
    			data.set({
					id : file.id,
					name : file.name,
					size : file.size,
					percent : file.percent,
					status : -1
				});
    		},
    		onFileUploaded: function(arg){
    			var file = arg.file;
    			var entity = data;
    			entity.set('percent', 100);
    			entity.set('status', file.status);
    		}
    	});
    	var button = new dorado.widget.SimpleIconButton({
    		id : buttonId,
    		action : uploadAction
    	});
    	return button;
    }
});


/** @Bind #gridFiles2.onCreate */
!function(self){
	self.set("&upload.renderer", new UploadCellRenderer());
};

/** @Bind #batchUploadAction.onError */
!function(self, arg, btnStopUpload){
	view.set("^batch.disabled", false);
	btnStopUpload.set("disabled", true);
	return false;
};

/** @Bind #batchUploadAction.onUploadComplete */
!function( btnStopUpload){
	view.set("^batch.disabled", false);
	btnStopUpload.set("disabled", true);
};

/** @Bind #batchUploadAction.onFileUploaded */
!function(arg, dsFiles1){
	var file = arg.file;
	var entity = dsFiles1.getData("[@.get('id')=='"+file.id+"']");
	entity.set('percent', 100);
	entity.set('status', file.status);
};

// @Bind #batchUploadAction.onUploadProgress
!function(arg, dsFiles1){
	var file = arg.file;
	dsFiles1.getData("[@.get('id')=='"+file.id+"']").set('percent', file.percent);
};

// @Bind #batchUploadAction.onFilesAdded
!function(self, arg, dsFiles1){	
	arg.files.each(function(file){
		if (self.getFile(file.id)){
			dsFiles1.insert({
				id : file.id,
				name : file.name,
				size : file.size,
				percent : file.percent,
				status : file.status
			});
		}
	});
};

/** @Bind #batchUploadAction.beforeFileUpload */
!function( self, arg, dsFiles1){
	var entity = dsFiles1.getData("[@.get('id')=='"+arg.file.id+"']");
	//动态设置参数
	self.set("parameter", {
		fileName: entity.get("name")
	});
};

// @Bind #btnDyna.onClick
!function(panel){
	var actionId = dorado.Core.newId();
	var buttonId = dorado.Core.newId();
	var uploadAction = new dorado.widget.UploadAction({
		id : actionId,
		maxFileSize: "1MB",
		autoUpload: true,
		iconClass: "fa fa-upload",
		fileResolver: "myUploadProcessor#process1",
		onFileUploaded: function(){
			dorado.MessageBox.alert("上传成功!");
		}
	});
	var button = new dorado.widget.Button({
		id : buttonId,
		caption : "上传(动态创建)",
		action : uploadAction
	});
	
	panel.addChild(button);
};

//@Bind #onlineAction.beforeExecute
//@Bind #downloadAction.beforeExecute
!function(self, fileEditor){
	self.set("parameter",{
		file: fileEditor.get("value")
	});
}

// @View
function showImage(){
	var image = viewMain.id("image");
	var imageListBox = viewMain.id("imageListBox");
	var params = {
			file: imageListBox.get("currentItem")
	};
	var url = dorado.uploader.Common.translateImageURL("myUploadProcessor#showImage", params);
	image.set("image", url);
}

//@Bind #showImageButton.onClick
!function(){
	showImage();
}

//@Bind #imageListBox.onCreate
!function(self){
	var items = new Array();
	for (var i=1; i<18; i++){
		items.push(i+".gif");
	}
	self.set("items", items);
}

//@Bind #imageListBox.onCurrentChange
!function(autoShowImage){
	if (autoShowImage.get("value")===true){
		showImage();
	}
}