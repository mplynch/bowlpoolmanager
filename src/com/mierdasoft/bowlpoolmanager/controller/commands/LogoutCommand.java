package com.mierdasoft.bowlpoolmanager.controller.commands;

import java.io.IOException;

import javax.servlet.ServletException;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import org.bibeault.frontman.*;

public class LogoutCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		UserService userService = UserServiceFactory.getUserService();

		if (userService.isUserLoggedIn())
		{

			try
			{
				context.redirect(userService.createLogoutURL(
						context.getRequest().getRequestURI()));
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

		else
		{
			try
			{
				context.redirectToCommand("Welcome");
			}
			
			catch (IOException e)
			{
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			catch (ServletException e)
			{
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}