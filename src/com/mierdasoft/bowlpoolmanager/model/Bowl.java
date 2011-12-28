package com.mierdasoft.bowlpoolmanager.model;

import java.util.*;

public class Bowl
{
	private Date date;
	
	private UUID id;
	
	private String name;
	
	private Team team1;
	
	private Team team2;
	
	private Team winner;

	public Bowl(String name, Team team1, Team team2, Date date)
	{
		this.name = name;
		
		this.team1 = team1;
		
		this.team2 = team2;
		
		this.date = date;
		
		id = UUID.randomUUID();
	}
	
	public Date getDate()
	{
		return date;
	}
	
	public UUID getID()
	{
		return id;
	}

	public String getName()
	{
		return name;
	}

	public Team getTeam1()
	{
		return team1;
	}

	public Team getTeam2()
	{
		return team2;
	}

	public Team getWinner()
	{
		return winner;
	}

	public void setWinner(Team winner)
	{
		this.winner = winner;
	}
}
