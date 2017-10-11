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

package com.bstek.dorado.uploader.resolver;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.config.definition.DefaultDefinitionReference;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.uploader.UploadFile;
import com.bstek.dorado.uploader.UploaderException;
import com.bstek.dorado.uploader.annotation.FileResolver;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.resolver.ClientRunnableException;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.AbstractResolver;
import com.fasterxml.jackson.core.JsonEncoding;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class UploadResolver extends AbstractResolver  {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(DefaultDefinitionReference.class);

	private final static Logger logger = LoggerFactory
			.getLogger(UploadResolver.class);

	private ObjectMapper objectMapper = new ObjectMapper();

	public UploadResolver() {
		this.objectMapper.configure(SerializationFeature.INDENT_OUTPUT, false);
	}

	@SuppressWarnings("rawtypes")
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest req,
			HttpServletResponse res) throws Exception {

		MultipartHttpServletRequest multiPartReq = null;
		CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
		if (!(req instanceof MultipartHttpServletRequest)
				&& multipartResolver.isMultipart(req)) {
			multiPartReq = multipartResolver.resolveMultipart(req);
		} else if (req instanceof MultipartHttpServletRequest) {
			multiPartReq = (MultipartHttpServletRequest) req;
		} else {
			return null;
		}
		MultipartFile file = multiPartReq.getFile("file");
		String resolver = multiPartReq.getParameter("_fileResolver");
		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			Enumeration paraNames = multiPartReq.getParameterNames();
			for (Enumeration e = paraNames; e.hasMoreElements();) {
				String thisName = e.nextElement().toString();
				String thisValue = multiPartReq.getParameter(thisName);
				parameters.put(thisName, thisValue);
			}
			String[] resolvers = resolver.split("#");
			Object processor = DoradoContext.getCurrent().getWebApplicationContext().getBean(resolvers[0]);
			String methodName = resolvers[1];
			Class<?> target = processor.getClass();
			if (ProxyBeanUtils.isProxy(processor)){
				target = ProxyBeanUtils.getProxyTargetType(processor);
			}
			Method method = target.getDeclaredMethod(methodName, new Class[]{UploadFile.class, Map.class});
			Annotation annotation = method.getAnnotation(FileResolver.class);
			if (annotation!=null){
				Object retObj = method.invoke(processor, getUploadFile(file), parameters);
//				JsonBuilder jsonBuilder = new JsonBuilder(res.getWriter());
//				jsonBuilder.object(); 
//				jsonBuilder.key("data").value(retObj);
//				jsonBuilder.endObject();
				String agent=req.getHeader("User-Agent").toLowerCase();
				if(agent.indexOf("msie 8")>0 || agent.indexOf("msie 9")>0){
					res.setContentType(MediaType.TEXT_HTML_VALUE);
				}else{
					res.setContentType(MediaType.APPLICATION_JSON_VALUE);
				}
				JsonGenerator jsonGenerator = this.objectMapper.getFactory()
						.createGenerator(res.getOutputStream(), getJsonEncoding(res.getContentType()));
				this.objectMapper.writeValue(jsonGenerator, retObj);
				
			}
			else{
				throw new UploaderException(resourceManager.getString(
						"dorado.common/unknownDefinition", resolver));
			}
		} catch (Throwable throwable) {
			if (logger.isInfoEnabled()) {
				logger.info("Uploader Error", throwable);
			}
			//res.sendError(500, throwable.getMessage());
			
			if (throwable instanceof ClientRunnableException) {
				res.setContentType("text/html");
				JsonBuilder jsonBuilder = new JsonBuilder(res.getWriter());
				outputException(jsonBuilder, throwable);
			} else{
				res.setContentType("text/html");
				JsonBuilder jsonBuilder = new JsonBuilder(res.getWriter());
				outputException(jsonBuilder, throwable);
			}
		}

		return null;
	}
	
	protected void outputClientRunnableException(JsonBuilder jsonBuilder, ClientRunnableException throwable) {
		try {
			jsonBuilder.object(); 
			jsonBuilder.key("exceptionType").value("ClientRunnableException")
					.key("script").value(throwable.getScript());
			jsonBuilder.endObject();
		} catch (Exception e) {
			// ignore e!!!
			throwable.printStackTrace();
		}
	}
	
	protected void outputException(JsonBuilder jsonBuilder, Throwable throwable) {
		while (throwable.getCause() != null) {
			throwable = throwable.getCause();
		}

		String message = throwable.getMessage();
		if (message == null) {
			message = throwable.getClass().getSimpleName();
		}

		try {
			jsonBuilder.object(); // TODO: 此行在部分情况下会报错，与出错之前JSONBuilder的输出状态相关
			jsonBuilder.key("exceptionType").value("JavaException")
					.key("message").value(message).key("stackTrace");
			jsonBuilder.array();
			StackTraceElement[] stackTrace = throwable.getStackTrace();
			for (StackTraceElement stackTraceElement : stackTrace) {
				jsonBuilder.value(stackTraceElement.getClassName() + '.'
						+ stackTraceElement.getMethodName() + '('
						+ stackTraceElement.getFileName() + ':'
						+ stackTraceElement.getLineNumber() + ')');
			}
			jsonBuilder.endArray();
			jsonBuilder.endObject();
		} catch (Exception e) {
			// ignore e!!!
			throwable.printStackTrace();
		}
	}
	
	protected UploadFile getUploadFile(MultipartFile multipartFile){
		String originalFilename = multipartFile.getOriginalFilename();
		// 浏览器的不同，有时获得的不仅仅是文件名而是全路径
		String fileName = null;
		if (originalFilename.indexOf("/") != -1) {
			fileName = originalFilename
					.substring(originalFilename.indexOf("/") + 1);
		} else {
			fileName = originalFilename;
		}

		if (fileName.indexOf("\\") != -1) {
			fileName = fileName.substring(fileName.indexOf("/") + 1);
		}

		UploadFile uploadFile = new UploadFile(fileName, multipartFile);
		return uploadFile;
	}
	
	protected JsonEncoding getJsonEncoding(String contentType) {
		MediaType mediaType = (contentType != null ? MediaType
				.parseMediaType(contentType) : null);
		if (mediaType != null && mediaType.getCharSet() != null) {
			Charset charset = mediaType.getCharSet();
			for (JsonEncoding encoding : JsonEncoding.values()) {
				if (charset.name().equals(encoding.getJavaName())) {
					return encoding;
				}
			}
		}
		return JsonEncoding.UTF8;
	}

}
