package com.mierdasoft.bowlpoolmanager.model;

import java.util.UUID;

public class Pick
{
	private Bowl bowl;
	
	private UUID id;
	
	private Team winner;
	
	private int rank;
	
	public Pick(Bowl bowl, Team winner, int rank)
	{
		id = UUID.randomUUID();
		
		this.bowl = bowl;
		
		this.winner = winner;
		
		this.rank = rank;
	}
	
	public Bowl getBowl()
	{
		return bowl;
	}
	
	public UUID getID()
	{
		return id;
	}

	public int getRank()
	{
		return rank;
	}

	public Team getWinner()
	{
		return winner;
	}
}
