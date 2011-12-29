package com.mierdasoft.bowlpoolmanager.controller.commands;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;

import org.bibeault.frontman.*;

import com.google.appengine.api.users.UserServiceFactory;
import com.mierdasoft.bowlpoolmanager.view.CopyrightBean;
import com.mierdasoft.bowlpoolmanager.view.LoginBean;
import com.mierdasoft.bowlpoolmanager.view.PathBean;

public class ApplyTemplateCommand implements Command {
	@Override
	public void execute(CommandContext context) {
		LoginBean login;
		PathBean cssPath, jQueryPath, jQueryUIPath;
		ServletContext servletContext;
		String baseUrl, view;

		servletContext = context.getServletContext();

		baseUrl = servletContext.getInitParameter("site.url");

		if (!baseUrl.endsWith("/"))
			baseUrl = baseUrl + "/";

		cssPath = new PathBean(baseUrl
				+ servletContext.getInitParameter("site.css"));

		jQueryPath = new PathBean(baseUrl
				+ servletContext.getInitParameter("site.jquery"));

		jQueryUIPath = new PathBean(baseUrl
				+ servletContext.getInitParameter("site.jquery-ui"));

		view = (String) context.getRequest().getAttribute("forwardToView");

		if (view == null)
			view = "WelcomePage";

		try {

			context.setScopedVariable("site.css", cssPath);
			context.setScopedVariable("site.jquery", jQueryPath);
			context.setScopedVariable("site.jquery-ui", jQueryUIPath);

			login = new LoginBean();
			login.setUser(UserServiceFactory.getUserService().getCurrentUser());
			login.setContinueUrl(context.getRequest().getRequestURL().toString());

			context.setScopedVariable("login", login);
			context.setScopedVariable("pageTitle", "Welcome");
			context.setScopedVariable("copyrightNotice", new CopyrightBean());

			context.forwardToView(view);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
