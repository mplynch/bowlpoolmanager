package com.mierdasoft.bowlpoolmanager.view;

public class ErrorBean
{
	private String message;
	
	public ErrorBean()
	{
		this.message = "";
	}
	
	public ErrorBean(String message)
	{
		this.setMessage(message);
	}
	
	public String getMessage()
	{
		return this.message;
	}
	
	public void setMessage(String message)
	{
		this.message = message;
	}
}
