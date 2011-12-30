package com.mierdasoft.bowlpoolmanager.controller;

import java.io.IOException;
import java.util.*;
import javax.servlet.ServletException;

import org.bibeault.frontman.*;

import com.mierdasoft.bowlpoolmanager.model.*;
import com.mierdasoft.bowlpoolmanager.model.dao.*;

public class ViewPoolsCommand implements Command
{
	@Override
	public void execute(CommandContext context)
	{
		DAOFactory daoFactory;
		PoolManager manager;
		PoolManagerDAO poolManagerDAO;
		
		daoFactory = new StaticDAOFactory();
		
		poolManagerDAO = daoFactory.createPoolManagerDAO();
		
		poolManagerDAO.getPoolManager();
		
		manager = poolManagerDAO.getPoolManager();
		
		Collection<Pool> pools = manager.getPools();
		
		try {
			context.setScopedVariable("pools", pools);
			context.setScopedVariable("pageTitle", "View Pools");
			context.setScopedVariable("forwardToView", "PoolsPage");
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
