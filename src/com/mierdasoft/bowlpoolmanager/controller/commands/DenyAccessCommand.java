package com.mierdasoft.bowlpoolmanager.controller.commands;

import java.io.IOException;

import javax.servlet.ServletException;

import org.bibeault.frontman.*;
import com.mierdasoft.bowlpoolmanager.view.ErrorBean;;

public class DenyAccessCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		ErrorBean error;
		
		error = new ErrorBean("Error 403 - Access Denied");
		
		context.getRequest().setAttribute("error", error);
		
		try
		{
			context.forwardToView("ErrorPage");
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