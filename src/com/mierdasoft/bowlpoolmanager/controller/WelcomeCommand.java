package com.mierdasoft.bowlpoolmanager.controller;

import java.io.IOException;

import javax.servlet.ServletException;

import org.bibeault.frontman.*;

public class WelcomeCommand implements Command {
	@Override
	public void execute(CommandContext context) {

		try {
			context.setScopedVariable("pageTitle", "Welcome");
			context.setScopedVariable("forwardToView", "WelcomePage");
			context.forwardToCommand("ApplyTemplate");
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
