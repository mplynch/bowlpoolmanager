package com.mierdasoft.bowlpoolmanager.view;

public class MenuItemBean {
	private String text;

	private String url;

	public MenuItemBean() {
		this.text = "Menu Item";

		this.url = "";
	}

	public MenuItemBean(String text, String url) {
		this.text = text;

		this.url = url;
	}

	public String GetText() {
		return this.text;
	}

	public String GetUrl() {
		return this.url;
	}

	public void SetText(String text) {
		this.text = text;
	}

	public void SetUrl(String url) {
		this.url = url;
	}
}