package com.mierdasoft.bowlpoolmanager.model.dao;

public class StaticDAOFactory implements DAOFactory {
	@Override
	public PoolManagerDAO createPoolManagerDAO() {
		return new StaticPoolManagerDAO();
	}
}
