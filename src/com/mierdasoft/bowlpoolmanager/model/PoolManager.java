package com.mierdasoft.bowlpoolmanager.model;

import java.util.*;

public class PoolManager {
	private List<Pool> pools;

	public PoolManager() {
		pools = new ArrayList<Pool>();
	}

	public void AddPool(Pool pool) {
		pools.add(pool);
	}

	public Pool getPoolById(UUID id) {
		for (Pool pool : this.pools) {
			if (pool.getId().equals(id))
				return pool;
		}

		return null;
	}

	public Collection<Pool> getPools() {
		return Collections.unmodifiableCollection(this.pools);
	}

	public void RemovePool(Pool pool) {
		pools.remove(pool);
	}
}
