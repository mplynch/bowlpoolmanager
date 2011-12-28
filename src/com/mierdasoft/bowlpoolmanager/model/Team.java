package com.mierdasoft.bowlpoolmanager.model;

import java.util.UUID;

public class Team
{
	private UUID id;
	
	private String name;
	
	private String logoPath;
	
	public Team(String name, String logoPath)
	{
		this.name = name;
		
		this.logoPath = logoPath;
		
		id = UUID.randomUUID();
	}
	
	public UUID getID()
	{
		return id;
	}

	public String getName()
	{
		return name;
	}

	public String getLogoPath()
	{
		return logoPath;
	}
}
