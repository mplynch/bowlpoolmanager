package com.mierdasoft.bowlpoolmanager.controller.commands;

import javax.servlet.ServletContext;

import org.bibeault.frontman.*;

import com.mierdasoft.bowlpoolmanager.view.PathBean;;

public class ApplyTemplateCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		PathBean cssPath, jQueryPath, jQueryUIPath;
		ServletContext servletContext;
		String baseUrl;
		
		servletContext = context.getServletContext();
		
		baseUrl = servletContext.getInitParameter("site.url");
		
		if (!baseUrl.endsWith("/"))
			baseUrl = baseUrl + "/";
		
		cssPath = new PathBean(baseUrl +
				servletContext.getInitParameter("site.css"));
		
		jQueryPath = new PathBean(baseUrl +
				servletContext.getInitParameter("site.jquery"));
		
		jQueryUIPath = new PathBean(baseUrl +
				servletContext.getInitParameter("site.jquery-ui"));
		
		servletContext.setAttribute("site.css", cssPath);
		servletContext.setAttribute("site.jquery", jQueryPath);
		servletContext.setAttribute("site.jquery-ui", jQueryUIPath);
	}
}
