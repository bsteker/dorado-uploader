package com.bstek.dorado.uploader.util;

public class ParameterUtils {
	public static void validateParameterCharacters(String s) {
		if (s.length() > 128) {
			throw new SecurityException();
		}
		for (int i = 0; i < s.length(); i++) {
			char c = s.charAt(i);
			if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0'
					&& c <= '9' || c == '-' || c == '_' || c == '/' || c == '.')) {
				throw new SecurityException();
			}
		}
	}

}
