 package com.mierdasoft.bowlpoolmanager.model;

import java.util.*;

public class RankedPickScoreCalculator implements ScoreCalculator
{
	@Override
	public int ComputeScoreForPlayer(Pool pool, Player player)
	{
		List<Pick> picks = pool.getPicksForPlayer(player);
		
		int total = 0;
		
		for (Pick pick : picks)
		{
			Bowl bowl = pick.getBowl();
			
			if (bowl.getWinner().equals(pick.getWinner()))
			{
				total += pick.getRank();
			}
		}
		
		return total;
	}
}
