(function() {

	var ensureInitalized = function() {
		if (!this._uploader) {
			throw new dorado.Exception('Uninitialized');
		}
	}

	var uploaderAttr = {
		readOnly : true,
		getter : function(attr, value) {
			ensureInitalized.call(this);
			var val = this._uploader[attr];
			if(jQuery.isArray(val)) {
				return val.slice();
			}else {
				return val;
			}
		}
	}

	var initUploader = function(component) {
		if (!this._uploaderInitialized) {
			window.plupload.addI18n({'File extension error.':$resource("dorado.uploader.FileExtensionError")});
			window.plupload.addI18n({'File size error.':$resource("dorado.uploader.FileSizeError")});

			var resPre = dorado.Setting["common.contextPath"]
					+ 'dorado/client/resources/';

			var ID_PREFIX =  "uploader_",
				browse_button_id = ID_PREFIX + dorado.Core.newId(), 
				browse_button_wrap_id,
				$button, $wrap;

			if (dorado.widget.menu && component instanceof dorado.widget.menu.MenuItem) {
				$wrap = jQuery(component.getDom());
				$button = jQuery('.menu-item-content', $wrap).attr('id',
						browse_button_id);
			} else {
				$button = jQuery(component.getDom()).attr('id',
						browse_button_id);
				$wrap = $button.parent();
			}

			if ($wrap.hasClass('toolbar-left')) {
				$wrap = $wrap.parent();			
			} 
			
			var oldId = $wrap.attr('id');
			
			if(oldId == null || oldId.indexOf(ID_PREFIX)!=0){
				browse_button_wrap_id = ID_PREFIX + dorado.Core.newId();
				$wrap.attr('id', browse_button_wrap_id);
			}else{
				browse_button_wrap_id = oldId;
			}

			var settings = {
				runtimes : this._runtimes,
				selectionMode : this._selectionMode,
				browse_button : browse_button_id,
				container : browse_button_wrap_id,
				max_file_size : this._maxFileSize,
				url : $url(this._url),
				flash_swf_url : resPre + "plupload.flash.swf",
				silverlight_xap_url : resPre + 'plupload.silverlight.xap'
			};

			this._filters && (settings.filters = this._filters);

			var uploader = this._uploader = new plupload.Uploader(settings);

			var self = this;
			uploader.bind('QueueChanged', function(up) {
				if (self._autoUpload) {
					self.start();
				}
			});

			// Fires when the current RunTime has been initialized.
			uploader.bind("Init", function(uploader) {
				self.fireEvent("beforeInit", self, {});
			});

			// Fires after the init event incase you need to perform actions
			// there.
			uploader.bind("PostInit", function(uploader) {
				self.fireEvent("onInit", self, {});
			});

			// Fires when just before a file is uploaded.
			uploader.bind("BeforeUpload", function(uploader, file) {
				self.fireEvent("beforeFileUploaded", self, {
					file : file
				});
			});

			// Fires when a file is to be uploaded by the runtime.
			uploader.bind("UploadFile", function(uploader, file) {
				self.fireEvent("beforeFileUpload", self, {
					file : file
				});
				// setting params
				if (self._parameter) {
                    uploader.settings.multipart_params = self._parameter;
                }else{
                    uploader.settings.multipart_params = {};
                }
                uploader.settings.multipart_params._fileResolver = self._fileResolver;
				// setting headers
				if (self._headers) {
					uploader.settings.headers = self._headers;
				}
			});

			uploader.init();

			// Fires when a file is successfully uploaded.
			uploader.bind("FileUploaded", function(uploader, file, response) {
				self.fireEvent("onFileUploaded", self, {
					file : file,
					returnValue : dorado.JSON.parse(response.response)
				});
			});

			// Fires when file chunk is uploaded.
			uploader.bind("ChunkUploaded", function(uploader, file, response) {
				self.fireEvent("onChunkUploaded", self, {
					file : file,
					returnValue : dorado.JSON.parse(response.response)
				});
			})

			// Fires while when the user selects files to upload.
			uploader.bind("FilesAdded", function(uploader, files) {
				if (this.settings.selectionMode == "singleFile" && uploader.files.length > 1){
					this.splice(0, uploader.files.length-1);
				}

				self.fireEvent("onFilesAdded", self, {
					files : files
				});
			});

			// Fires while a file was removed from queue.
			uploader.bind("FilesRemoved", function(uploader, files) {
				self.fireEvent("onFilesRemoved", self, {
					files : files
				});
			});
			// Fires while a file is being uploaded.
			uploader.bind("UploadProgress", function(uploader, file) {
				self.fireEvent("onUploadProgress", self, {
					file : file,
					total : uploader.total
				});
			});

			// Fires when the file queue is changed.
			uploader.bind("QueueChanged", function(uploader) {
				self.fireEvent("onQueueChanged", self, {});
			});

			// Fires when the overall state is being changed for the upload
			// queue.
			uploader.bind("StateChanged", function(uploader) {
				self.fireEvent("onStateChanged", self, {});
			});

			// Fires when the silverlight/flash or other shim needs to move.
			uploader.bind("Refresh", function(uploader) {
				self.fireEvent("onRefresh", self, {});
			});

			// Fires when all files in a queue are uploaded.
			uploader.bind("UploadComplete", function(uploader, files) {
				if (self._realSuccessMessage) {
					self._successMessage = self._realSuccessMessage;
					delete self._realSuccessMessage;
					dorado.widget.NotifyTipManager.notify(self._successMessage);
				}
				self.fireEvent("onUploadComplete", self, {
					files : files
				});
			});

			// Fires when a error occurs.
			uploader.bind("Error", function(uploader, arg) {
				var eventArg = {
						processDefault : true	
				};
				if (typeof(arg.error)=="undefined"){
					eventArg.error = arg;
				}
				if (typeof(arg.file)!=="undefined"){
					eventArg.file = arg.file;
					delete eventArg.error.file;  
				}
				self.fireEvent("onError", self, eventArg);
				if (eventArg.processDefault === true){
					dorado.Exception.processException(new Error(arg.message));
				}
			});

			this.addListener('onDestroy', function(self, arg) {

				this._uploader.destroy();

			}, {
				scope : this
			});

			this._uploaderInitialized = true;
		}
	}

	/**
	 * @author Vangie Du (mailto:vangie.du@bstek.com)
	 * @component Action
	 * @class 文件上传控件。
	 * @extends dorado.widget.Action
	 */
	dorado.widget.UploadAction = $extend(
			dorado.widget.Action,
			/** @scope dorado.widget.UploadAction.prototype */
			{

				$className : 'dorado.widget.UploadAction',

				ATTRIBUTES : /** @scope dorado.widget.UploadAction.prototype */
				{

					disabled: {
						getter: function () {
							return this._disabled || this._sysDisabled;
						},
						setter: function(v) {
							this._disabled = v;
							if (v){
								if (this._uploader){
									this.doRemoveBindingObject(this);
								}
							}else{
								this.doAddBindingObject(this._bindingObject);
							}
						}
					},
					
                    /**
                     * 文件处理器的名称。
                     * @type String
                     * @attribute
                     */
                    fileResolver:{},

					/**
					 * 上传控件的运行时支持，可选项有：html5、flash、html4。
					 * 指定多个可选项时使用逗号分隔。
					 * 当配置多个可选项时，系统会依次测试runtime,直到某一runtime成功或者全部失败为止。
					 * 
					 * @attribute
					 * @type String
					 * @default "html5,flash,html4"
					 */
					runtimes : {
						defaultValue : 'html5,flash,html4'
					},

					/**
					 * 文件上传目标URL
					 * 
					 * @attribute
					 * @type String
					 */
					url : {
						defaultValue : '>dorado/uploader/fileupload'
					},

					/**
					 * 单文件大小限制 格式形如： 100b、10kb、10mb
					 * 
					 * @attribute
					 * @type String
					 * @default '100MB'
					 */
					maxFileSize : {
						defaultValue : '100MB'
					},

					/**
					 * 自动上传开关， 开启该开关后，选择文件后即开始上传，否则需要显式的调用start()方法开始上传。
					 * 
					 * @attribute
					 * @type boolean
					 * @default true
					 */
					autoUpload : {
						defaultValue : true
					},

					/**
					 * 选择模式。
					 * <p>
					 * 此属性具有如下几种取值：
					 * <ul>
					 * <li>singleFile - 单文件选择。</li>
					 * <li>multiFiles - 多文件选择。</li>
					 * </ul>
					 * </p>
					 * @type String
					 * @attribute skipRefresh
					 * @default "singleFile"
					 */
					selectionMode: {
						defaultValue: "singleFile",
						skipRefresh: true
					},
					
					/**
					 * 文件类型过滤器 格式如下： [ {title : "Image files", extensions :
					 * "jpg,gif,png"}, {title : "Zip files", extensions : "zip"} ]
					 * 
					 * @attribute
					 * @type Object[]
					 */
					filters : [],

					/**
					 * 键值对参数 添加于HTTP请求头
					 * 
					 * 该属性必须在start()方法触发之前设值
					 * 
					 * @attribute
					 * @type Object
					 */
					headers : {},

					/**
					 * 必要的特性 满足必要特性的runtime才能被初始化 多个特性使用逗号分隔
					 * 
					 * @attribute
					 * @type String
					 */
					requiredFeatures : {},

					/**
					 * 当前Runtime的名称
					 * 
					 * @attribute readOnly
					 * @type String
					 */
					runtime : uploaderAttr,

					/**
					 * 当前Runtime启动的新特性
					 * 
					 * @attribute readOnly
					 * @type Object
					 */
					features : uploaderAttr,

					/**
					 * 当前上传队列中的文件
					 * 
					 * @attribute readOnly
					 * @type Object[]
					 */
					files : uploaderAttr,

					/**
					 * 当前设定参数
					 * 
					 * @attribute readOnly
					 * @type Object
					 */
					settings : uploaderAttr,

					/**
					 * 当前上传队列状态
					 * 
					 * @attribute readOnly
					 * @type Integer
					 */
					state : uploaderAttr,

					/**
					 * 当前上传队列信息 返回对象包含如下属性
					 * <ul>
					 * <li>.bytesPerSec - 每秒上传字节数</li>
					 * <li>.failed - 失败文件数</li>
					 * <li>.loaded - 已上传字节数</li>
					 * <li>.percent - 当前上传百分百</li>
					 * <li>.queued - 当前队列未上传文件数</li>
					 * <li>.size - 当前队列文件数</li>
					 * <li>.uploaded - 已上传文件数</li>
					 * </ul>
					 * 
					 * @attribute readOnly
					 * @type Object
					 */
					total : uploaderAttr
				},

				EVENTS : /** @scope dorado.widget.UploadAction.prototype */
				{
					beforeExecute: {
						interceptor: function(superFire, self, arg) {
							var retval = superFire(self, arg);
							this._realSuccessMessage = this._successMessage;
							this._successMessage = "";
							return retval;
						}
					},
					
					/**
					 * 当组件被初始化（即真正可用时）前触发的事件。 组件会在绑定Button时执行初始化。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					beforeInit : {},

					/**
					 * 当组件被初始化（即真正可用时）时触发的事件。 组件会在绑定Button时执行初始化。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onInit : {},

					/**
					 * 当某个文件正要上传时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.file 正要上传的文件。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					beforeFileUpload : {},

					/**
					 * 当某个文件正要完成上传时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.file 正要完成上传的文件。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					beforeFileUploaded : {},

					/**
					 * 当某个文件上传完毕时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.file 完成上传的文件。
					 * @param {Object}
					 *            arg.returnValue 服务端返回结果
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onFileUploaded : {},

					/**
					 * 当某个文件块(Chunk)上传完毕时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.file 正在上传的文件。
					 * @param {Object}
					 *            arg.returnValue 服务端返回结果
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onChunkUploaded : {},

					/**
					 * 当文件被添加时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.files 被添加的文件。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onFilesAdded : {},

					/**
					 * 当文件被移除时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.files 被移除的文件。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onFilesRemoved : {},

					/**
					 * 当某个文件上传时触发的事件,更新上传进度。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.file 正在上传的文件。
					 * @param {Object}
					 *            arg.total 上传队列进度
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onUploadProgress : {},

					/**
					 * 上传队列变化时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onQueueChanged : {},

					/**
					 * 状态变化时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onStateChanged : {},

					/**
					 * 刷新时触发的事件。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onRefresh : {},

					/**
					 * 队列里的文件上传完毕。
					 * 
					 * @param {Object}
					 *            self 事件的发起者，即组件本身。
					 * @param {Object}
					 *            arg 事件参数。
					 * @param {Object}
					 *            arg.files 上传完毕的文件。
					 * @return {boolean}
					 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onUploadComplete : {},

					/**
					 * 发生错误。
					 * 
					 * @param {Object} self 事件的发起者，即组件本身。
					 * @param {Object} arg 事件参数。
					 * @param {Object} #arg.file 上传失败的文件。
					 * @param {Object} #arg.error 错误对象。
					 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
					 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
					 * @event
					 */
					onError : {}

				},

				/**
				 * 通过Id获得某个文件
				 * 
				 * @function
				 * @param {String}
				 *            文件id
				 * @return {Object}
				 */
				getFile : function(id) {
					ensureInitalized.call(this);
					return this._uploader.getFile(id);
				},

				/**
				 * 移除某个文件
				 * 
				 * @function
				 * @param {Object}|
				 *            {String} 文件对象 或者 id
				 */
				removeFile : function(file) {
					ensureInitalized.call(this);
					if (typeof (file) === 'string') {
						file = this.getFile(file);
					}
					this._uploader.removeFile(file);
				},

				/**
				 * 刷新 触发刷新事件
				 * 
				 * @function
				 */
				refresh : function() {
					ensureInitalized.call(this);
					return this._uploader.refresh();
				},

				/**
				 * 开始上传
				 * 
				 * @function
				 */
				start : function() {
					if (this._url=="'>dorado/uploader/fileupload'" && !this._fileResolver) {
						throw new dorado.Exception("No FileResolver defined.");
					}
					ensureInitalized.call(this);
					return this._uploader.start();
				},

				/**
				 * 停止上传
				 * 
				 * @function
				 */
				stop : function() {
					ensureInitalized.call(this);
					return this._uploader.stop();
				},

				doAddBindingObject : function(component) {
					if (this._disabled) return;
					
					if (dorado.widget.menu && component instanceof dorado.widget.menu.MenuItem) {
						// unsupport menuItem
						return;
					}

					// if (!(component instanceof dorado.widget.AbstractButton)) {
					// throw new dorado.Exception(
					// 'UploadAction Only support binding Button!');
					// }
					//
					if (this._uploaderInitialized) {
						throw new dorado.Exception(
								'UploadAction Only support binding one Button!');
					}

					var control, action = this;

					if (component instanceof dorado.widget.AbstractButton) {
						this.doBindingUploaderInit(component, component, action);
					} else if (dorado.widget.menu && component instanceof dorado.widget.menu.MenuItem) {
						return;
						component.addListener("onAttributeChange", function(
								self, arg) {
							if (arg.attribute == 'parent' && arg.value
									&& !arg.value._isUploaderInitialized) {
								var menu = arg.value;
								action.doBindingUploaderInit(menu, component,
										action);
								menu.addListener('onDestroy', function(self,
										arg) {
									action._uploader.destroy();
								});
								menu._isUploaderInitialized = true;

							}
						});
					}
					$invokeSuper.call(this, arguments);
				},

				doBindingUploaderInit : function(control, component, action) {
					action._bindingObject = control;
					action._parentOnResize = function(){
						action.refresh();
					};
					if (control.get('ready')) {
						if (action._disabled) return;
						initUploader.call(action, component);
					} else {
						control.addListener('onReady', function() {
							if (action._disabled) return;
							initUploader.call(action, component);
						}, {
							scope : action,
							once : true
						});
						var parent = control.get("parent");
						if (parent && parent._resizeable){
							var eventName = "onResize";
						    var def = parent.EVENTS[eventName] || (parent.PRIVATE_EVENTS && parent.PRIVATE_EVENTS[eventName]);
							if (def) {
								parent.addListener(eventName, action._parentOnResize);
								
							}
						} 
					}
				},

				doRemoveBindingObject : function(object) {
					this._uploaderInitialized = false;
					if (this._bindingObject){
						var parent = this._bindingObject.get("parent");
						if (parent && parent._resizeable){
							var eventName = "onResize";
						    var def = parent.EVENTS[eventName] || (parent.PRIVATE_EVENTS && parent.PRIVATE_EVENTS[eventName]);
							if (def) {
								parent.removeListener('onResize', this._parentOnResize);	
								
							}
						} 
					}
					this._uploader.destroy();
					$invokeSuper.call(this, arguments);
				},
				
				doExecuteSync : function() {
					//
				},

				doExecuteAsync : function(callback) {
					//
				},
				
				destroy: function () {
					$invokeSuper.call(this, arguments);
					delete this._bindingObject;
				}

			});

	/**
	 * @author William Jiang (mailto:william.jiang@bstek.com)
	 * @component Action
	 * @class 文件下载控件。
	 * @extends dorado.widget.Action
	 */
	dorado.widget.DownloadAction = $extend(
			dorado.widget.FormSubmitAction,
			/** @scope dorado.widget.DownloadAction.prototype */
			{

				$className : 'dorado.widget.DownloadAction',

				ATTRIBUTES : /** @scope dorado.widget.DownloadAction.prototype */
				{
					/**
					 * 文件下载服务URL
					 * 
					 * @attribute
					 * @type String
					 */
					action : {
						defaultValue : '>dorado/uploader/filedownload'
					},

                    /**
                     * 文件提取器的名称。
                     * @type String
                     * @attribute
                     */
                    fileProvider:{},

					/**
					 * 下载模式。
					 * <p>
					 * 此属性具有如下几种取值：
					 * <ul>
					 * <li>off - 直接下载,不开启预览功能。</li>
					 * <li>browser - 尝试用浏览器去预览。</li>
					 * </ul>
					 * </p>
					 * @type String
					 * @attribute skipRefresh
					 * @default "off"
					 */
					inlineMode: {
						defaultValue: "off",
						skipRefresh: true
					}

				},

				doExecute: function() {
					if (!this._fileProvider) {
						throw new dorado.Exception("No FileProvider defined.");
					}

					var action = this, parameter = dorado.JSON.evaluate(action._parameter), data = {};
					if (parameter && parameter instanceof dorado.Entity) {
						data = parameter.toJSON();
					} else if (parameter) {
						data = parameter;
					}
					dorado.Object.apply(data, {
						"_fileProvider": action._fileProvider,
						"_inlineMode": action._inlineMode
					});
					var submitData = {};
					for (var param in data) {
						var value = data[param], string = "";
		                if (value !== undefined) {
		                    if (value instanceof Date) {
		                        string = value.formatDate("Y-m-d H:i:s");;
		                    } else if (value != null && value.toString) {
		                        string = value.toString();
		                    }
		                }
		                submitData[param] = string;
					}
					action.doSubmitData(submitData);
				},
				
				doExecuteSync : function() {
					var action = this;
					action.doExecute();
				},

				doExecuteAsync : function(callback) {
					var action = this;
					action.doExecute();
				}
				
			});
	
})();