package com.mierdasoft.bowlpoolmanager.controller.commands;

import java.io.IOException;

import javax.servlet.ServletException;

import org.bibeault.frontman.*;

public class WelcomeCommand implements Command {
	@Override
	public void execute(CommandContext context) {

		try {
			// context.setScopedVariable("forwardToView", "WelcomePage",
			// ScopedContext.REQUEST);
			context.getRequest().setAttribute("forwardToView", "WelcomePage");

			context.forwardToCommand("ApplyTemplate");
			// context.forwardToView("WelcomePage");
		}

		catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
