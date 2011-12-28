package com.mierdasoft.bowlpoolmanager.model;

public class Player
{	
	private String email;
	
	private String name;
	
	public Player(String name, String email)
	{
		this.name = name;
		
		this.email = email;
	}
	
	public String getEmail()
	{
		return email;
	}
	
	public String getName()
	{
		return name;
	}
	
	public void MakePick(Pool pool, Bowl bowl, Team winner, int rank)
	{
		Pick pick;
		
		pick = new Pick(bowl, winner, rank);
		
		pool.addPick(this, pick);
	}
}
