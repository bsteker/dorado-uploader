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

dorado.uploader = {};

/**
 * @author William Jiang (mailto:william.jiang@bstek.com)
 * @name dorado.uploader.Common
 * @class 一些实现通用功能的工具方法。
 * @static
 */
dorado.uploader.Common = {
		parseResponseException : function(text) {
			function parseException(text) {
				var json = dorado.JSON.parse(text);
				return new dorado.AbortException(json.message);
			}
			
			function parseRunnableException(text) {
				var json = dorado.JSON.parse(text);
				return new dorado.RunnableException(json.script);
			}
			
			function getContentType(allResponseHeaders){
				var responseHeaders = {};
				try {
					var headerStr = allResponseHeaders;
					var headers = headerStr.split('\n');
					for(var i = 0; i < headers.length; i++) {
						var header = headers[i];
						var delimitPos = header.indexOf(':');
						if(delimitPos != -1) {
							responseHeaders[header.substring(0, delimitPos).toLowerCase()] = header.substring(delimitPos + 2);
						}
					}
				} catch (e) {
					// do nothing
				}
				return responseHeaders["content-type"];
			}

			var UPLOADER_DORADO_JAVA_SERVER_EXCEPTION = "JavaException";
			var UPLOADER_DORADO_JAVA_RUNABLE_EXCEPTION = "ClientRunnableException";
			
			var exception = null;
			if (text && text.indexOf("\"exceptionType\":")>0){
				var json = dorado.JSON.parse(text);
				if (json.exceptionType == UPLOADER_DORADO_JAVA_SERVER_EXCEPTION){
					exception = parseException(text);
				}
				else if(json.exceptionType == UPLOADER_DORADO_JAVA_RUNABLE_EXCEPTION) {
					exception = parseRunnableException(text);
				}
			}
			return exception;
		},
		
		translateImageURL: function (fileProvider, parameter) {
			function doTranslateURL(fileProvider, inlineMode, data) {
			    var dateToJSON = function(date) {
			        function f(n) {
			            // Format integers to have at least two digits.
			            return n < 10 ? '0' + n : n;
			        }

			        return date.getUTCFullYear() + '-' + f(date.getUTCMonth() + 1) + '-' + f(date.getUTCDate()) + 'T'
			                + f(date.getUTCHours()) + ':' + f(date.getUTCMinutes()) + ':' + f(date.getUTCSeconds()) + 'Z';
			    };
			    var url = dorado.widget.DownloadAction.prototype.ATTRIBUTES.action.defaultValue;
				url += "?_fileProvider="+encodeURIComponent(fileProvider);
				if (inlineMode == "browser"){
					url += "&_inlineMode=browser";
				}
				
				for (var param in data) {
					var value = data[param], string = "";
	                if (value !== undefined) {
	                    if (value instanceof Date) {
	                        string = dateToJSON(value);
	                    } else if (value.toString) {
	                        string = value.toString();
	                    }
	                }
	                url += "&"+param+"="+string;
				}
				return url;	
			}
			
			
			var parameter = dorado.JSON.evaluate(parameter), data = {};
			if (parameter && parameter instanceof dorado.Entity) {
				data = parameter.toJSON();
			} else if (parameter) {
				data = parameter;
			}
			return doTranslateURL(fileProvider, "browser", data);
		}
};