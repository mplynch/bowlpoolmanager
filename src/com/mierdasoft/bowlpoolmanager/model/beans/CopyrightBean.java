package com.mierdasoft.bowlpoolmanager.model.beans;

public class CopyrightBean {
	private String copyright;

	public CopyrightBean() {
		this.copyright = "Copyright &copy; Michael Lynch 2011";
	}

	public String getCopyright() {
		return this.copyright;
	}

	public void setCopyright(String copyright) {
		this.copyright = copyright;
	}
}
