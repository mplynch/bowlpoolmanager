package com.mierdasoft.bowlpoolmanager.controller;

import java.io.IOException;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import org.bibeault.frontman.*;

public class LoginCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		UserService userService = UserServiceFactory.getUserService();

		try
		{
			context.redirect(userService.createLoginURL(
					context.getRequest().getPathInfo().toString()));
		}

		catch (IllegalStateException e)
		{
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		catch (IOException e)
		{
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}