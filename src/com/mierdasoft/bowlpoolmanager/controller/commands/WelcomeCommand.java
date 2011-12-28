package com.mierdasoft.bowlpoolmanager.controller.commands;

import java.io.IOException;

import javax.servlet.ServletException;

import org.bibeault.frontman.*;

import com.google.appengine.api.users.*;
import com.mierdasoft.bowlpoolmanager.view.*;

public class WelcomeCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		LoginBean login;
		
		login = new LoginBean();
		
		login.setContinueUrl(context.getRequest().getRequestURL().toString());
		
		login.setUser(UserServiceFactory.getUserService().getCurrentUser());
		
		try
		{
			context.getRequest().setAttribute("login", login);
			
			context.forwardToView("WelcomePage");
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
