package com.mierdasoft.bowlpoolmanager.controller;

import java.io.IOException;

import javax.servlet.ServletException;

import org.bibeault.frontman.*;

public class ErrorCommand implements Command {
	@Override
	public void execute(CommandContext context) {
		String errorMessage;

		try {
			errorMessage = (String) context.getScopedVariable("errorMessage",
					ScopedContext.REQUEST);

			if (errorMessage == null)
				errorMessage = "An unknown error occurred.";

			context.setScopedVariable("errorMessage", errorMessage);
			
			context.forwardToView("ErrorPage");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
