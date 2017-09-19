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

package com.bstek.dorado.uploader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

import com.bstek.dorado.uploader.widget.InlineMode;

public class DownloadFile {
	private String name;
	private File file;
	private String fileName;
	private InputStream inputStream;
	private String charset = "UTF-8";
//	private long length;
	private String contentType; //http://tool.oschina.net/commons
	private int bufferSize = 1024;
	private InlineMode inlineMode = InlineMode.none;


	public DownloadFile(String name, InputStream inputStream) {
		this.name = name;
		this.inputStream = inputStream;
	}
	
	public DownloadFile(File file) throws FileNotFoundException {
		this.name = file.getName();
		this.file = file;
		this.inputStream = new FileInputStream(file);
//		this.length = file.length();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public InputStream getInputStream() {
		return inputStream;
	}

	public void setInputStream(InputStream inputStream) {
		this.inputStream = inputStream;
	}

//	public long getLength() {
//		return length;
//	}
//
//	public void setLength(long length) {
//		this.length = length;
//	}
//
	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	public int getBufferSize() {
		return bufferSize;
	}

	public void setBufferSize(int bufferSize) {
		this.bufferSize = bufferSize;
	}

	public String getCharset() {
		return charset;
	}

	public void setCharset(String charset) {
		this.charset = charset;
	}

	public InlineMode getInlineMode() {
		return inlineMode;
	}

	public void setInlineMode(InlineMode inlineMode) {
		this.inlineMode = inlineMode;
	}

	public File getFile() {
		return file;
	}
	
}
