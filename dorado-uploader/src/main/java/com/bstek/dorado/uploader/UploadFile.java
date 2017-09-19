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
import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

public class UploadFile {
	private String fileName;
	private MultipartFile multipartFile;

	public UploadFile(String fileName, MultipartFile multipartFile) {
		this.fileName = fileName;
		this.multipartFile = multipartFile;
	}

	public long getSize() {
		return multipartFile.getSize();
	}

	public InputStream getInputStream() throws IOException {
		return multipartFile.getInputStream();
	}

	public void transferTo(File dest) throws IOException, IllegalStateException {
		multipartFile.transferTo(dest);
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public MultipartFile getMultipartFile() {
		return multipartFile;
	}

	public void setMultipartFile(MultipartFile multipartFile) {
		this.multipartFile = multipartFile;
	}

}
