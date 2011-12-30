package com.mierdasoft.bowlpoolmanager.model.dao;

import com.mierdasoft.bowlpoolmanager.model.*;

public class StaticPoolManagerDAO implements PoolManagerDAO {
	private PoolManager manager;
	
	public StaticPoolManagerDAO()
	{
		manager = new PoolManager();
		
		manager.AddPool(new Pool("2011 Tullahoma Friends Pool"));
		manager.AddPool(new Pool("2011 HCA Accountants Pool"));
		manager.AddPool(new Pool("2011 Lynch Family Pool"));
	}
	
	public PoolManager getPoolManager()
	{
		return manager;
	}
}
