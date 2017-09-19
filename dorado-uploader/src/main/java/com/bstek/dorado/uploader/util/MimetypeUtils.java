package com.bstek.dorado.uploader.util;

import java.io.File;

import javax.activation.MimetypesFileTypeMap;

@SuppressWarnings("restriction")
public class MimetypeUtils {
	
	public static String getMimetype(File file){
		return new MimetypesFileTypeMap().getContentType(file);
	}

	public static String getMimetype(String fileName){
		return new MimetypesFileTypeMap().getContentType(fileName);
	}
}
