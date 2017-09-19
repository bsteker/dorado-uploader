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


import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.action.FormSubmitAction;

@Widget(name = "DownloadAction", category = "Action", dependsPackage = "uploader", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.DownloadAction", shortTypeName = "DownloadAction")
public class DownloadAction extends FormSubmitAction {

	private static final String DEFAULT_URL = ">dorado/uploader/filedownload";

	private String fileProvider;

	private InlineMode inlineMode = InlineMode.off;

	public DownloadAction() {
		this.setAction(DEFAULT_URL);
	}

	@IdeProperty(highlight = 1)
	public String getFileProvider() {
		return fileProvider;
	}

	public void setFileProvider(String fileProvider) {
		this.fileProvider = fileProvider;
	}

	@IdeProperty(visible = false)
	@ClientProperty(escapeValue = DEFAULT_URL)
	public String getAction() {
		return super.getAction();
	}

	@ClientProperty(escapeValue = "off")
	public InlineMode getInlineMode() {
		return inlineMode;
	}

	public void setInlineMode(InlineMode inlineMode) {
		this.inlineMode = inlineMode;
	}


}
