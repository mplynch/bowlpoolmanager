package com.mierdasoft.bowlpoolmanager.model;

import java.util.*;

public class PoolManager
{
	private List<Pool> pools;
	
	public PoolManager()
	{
		pools = new ArrayList<Pool>();
	}
	
	public void AddPool(Pool pool)
	{
		pools.add(pool);
	}
	
	public Collection<Pool> getPools()
	{
		return Collections.unmodifiableCollection(this.pools);
	}
	
	public void RemovePool(Pool pool)
	{
		pools.remove(pool);
	}
}
