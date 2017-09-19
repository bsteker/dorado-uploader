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

import javax.servlet.http.HttpServletResponse;

/**
 * 期望中止上传时抛出该异常，客户端触发OnError和OnFailue事件
 * 
 * @author vangie
 * 
 */
public class UploaderException extends RuntimeException {

	private static final long serialVersionUID = 6455565200058585749L;

	/**
	 * 错误状态码，默认值为500
	 */
	private int statusCode = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

	public UploaderException() {

	}

	public UploaderException(String message, Throwable cause) {
		super(message, cause);
	}

	public UploaderException(String message) {
		super(message);
	}

	public UploaderException(Throwable cause) {
		super(cause);
	}

	public UploaderException(int statusCode) {
		this.statusCode = statusCode;
	}

	public int getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}
}
