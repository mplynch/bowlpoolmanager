package com.mierdasoft.bowlpoolmanager.model.beans;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class LoginBean
{
	private User user;

	private String continueUrl;

	private UserService userService;

	public LoginBean()
	{
		continueUrl = "/";
		userService = UserServiceFactory.getUserService();
		user = userService.getCurrentUser();
	}

	public String getUrl()
	{
		String url;
		
		if (user != null)
		{

			url = userService.createLogoutURL(this.continueUrl);
		}

		else
		{
			url = userService.createLoginURL(this.continueUrl);
		}

		return url;
	}

	public User getUser()
	{
		return user;
	}
	
	public void setContinueUrl(String url)
	{
		this.continueUrl = url;
	}

	public void setUser(User user)
	{
		this.user = user;
	}

	public String getStatus()
	{
		if (user != null)
		{
			return "Logout";
		}
		
		else
		{
			return "Login";
		}
	}
}