package com.mierdasoft.bowlpoolmanager.view;

public class PathBean
{
	private String path;
	
	public PathBean()
	{
		this.path = "";
	}
	
	public PathBean(String path)
	{
		this.setPath(path);
	}
	
	public String getPath()
	{
		return this.path;
	}
	
	public void setPath(String path)
	{
		this.path = path;
	}
}