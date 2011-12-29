package com.mierdasoft.bowlpoolmanager.view;

import java.util.*;

public class MenuBean {
	private List<MenuItemBean> items;

	public MenuBean() {
		this.items = new ArrayList<MenuItemBean>();
	}

	public void AddMenuItem(String text, String url) {
		this.items.add(new MenuItemBean(text, url));
	}

	public void RemoveMenuItem(MenuItemBean item) {
		this.items.remove(item);
	}
}
