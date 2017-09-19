/*
 * This file is part of Dorado 7.x (http://dorado7.bsdn.org).
 * 
 * Copyright (c) 2002-2012 BSTEK Corp. All rights reserved.
 * 
 * This file is dual-licensed under the AGPLv3 (http://www.gnu.org/licenses/agpl-3.0.html) 
 * and BSDN commercial (http://www.bsdn.org/licenses) licenses.
 * 
 * If you are unsure which license is appropriate for your use, please contact the sales department
 * at http://www.bstek.com/contact.
 */
 
package com.bstek.dorado.uploader.widget;

import java.util.List;
import java.util.Map;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.action.Action;

@Widget(name = "UploadAction", category = "Action", dependsPackage = "uploader", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.UploadAction", shortTypeName = "UploadAction")
@ClientEvents({ @ClientEvent(name = "beforeInit"),
		@ClientEvent(name = "onInit"), @ClientEvent(name = "onUploadProgress"),
		@ClientEvent(name = "beforeFileUploaded"),
		@ClientEvent(name = "beforeFileUpload"),
		@ClientEvent(name = "onFileUploaded"),
		@ClientEvent(name = "onChunkUploaded"),
		@ClientEvent(name = "onFilesAdded"),
		@ClientEvent(name = "onFilesRemoved"),
		@ClientEvent(name = "onQueueChanged"),
		@ClientEvent(name = "onStateChanged"),
		@ClientEvent(name = "onRefresh"),
		@ClientEvent(name = "onExecute", deprecated=true),
		@ClientEvent(name = "beforeExecute", deprecated=true),
		@ClientEvent(name = "onSuccess", deprecated=true),
		@ClientEvent(name = "onFailure", deprecated=true),
		@ClientEvent(name = "onUploadComplete"), @ClientEvent(name = "onError") })
public class UploadAction extends Action {

	private static final String DEFAULT_RUNTIMES = "html5,flash,silverlight,gears,browserplus,html4";

	private static final String DEFAULT_MAX_FILE_SIZE = "100MB";

	private static final String DEFAULT_URL = ">dorado/uploader/fileupload";

	private String runtimes = DEFAULT_RUNTIMES;

	private String url = DEFAULT_URL;

	private boolean autoUpload = true;

	private SelectionMode selectionMode = SelectionMode.singleFile;
	
	private String maxFileSize = DEFAULT_MAX_FILE_SIZE;

	private List<Filter> filters;

	private Map<String, String> headers;
	
	private String fileResolver;

	@IdeProperty(highlight = 1)
	public String getFileResolver() {
		return fileResolver;
	}

	public void setFileResolver(String fileResolver) {
		this.fileResolver = fileResolver;
	}

	@XmlSubNode(wrapper = @XmlNodeWrapper(nodeName = "Filters"))
	@ClientProperty
	public List<Filter> getFilters() {
		return filters;
	}

	public void setFilters(List<Filter> filters) {
		this.filters = filters;
	}

	@IdeProperty(visible = false)
	@ClientProperty(escapeValue = DEFAULT_RUNTIMES)
	public String getRuntimes() {
		return runtimes;
	}

	public void setRuntimes(String runtimes) {
		this.runtimes = runtimes;
	}

	@IdeProperty(visible = false)
	@ClientProperty(escapeValue = ">dorado/uploader/fileupload")
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	@ClientProperty(escapeValue = DEFAULT_MAX_FILE_SIZE)
	public String getMaxFileSize() {
		return maxFileSize;
	}

	public void setMaxFileSize(String maxFileSize) {
		this.maxFileSize = maxFileSize;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isAutoUpload() {
		return autoUpload;
	}

	public void setAutoUpload(boolean autoUpload) {
		this.autoUpload = autoUpload;
	}

	@ClientProperty(escapeValue = "singleFile")
	public SelectionMode getSelectionMode() {
		return selectionMode;
	}

	public void setSelectionMode(SelectionMode selectionMode) {
		this.selectionMode = selectionMode;
	}

	@IdeProperty(visible = false)
	public String getHotkey() {
		return null;
	}
	
	@IdeProperty(visible = false)
	public String getConfirmMessage() {
		return null;
	}

	@XmlProperty
	@ClientProperty(outputter = "spring:dorado.doradoMapPropertyOutputter")
	@IdeProperty(editor = "pojo")
	public Map<String, String> getHeaders() {
		return headers;
	}

	public void setHeaders(Map<String, String> headers) {
		this.headers = headers;
	}

}
